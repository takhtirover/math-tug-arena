import Phaser from 'phaser';

export class TugScene extends Phaser.Scene {
  private gameContainer!: Phaser.GameObjects.Container;
  private backgroundArena!: Phaser.GameObjects.Image;
  private centerZoneSquare!: Phaser.GameObjects.Graphics;
  private flag!: Phaser.GameObjects.Rectangle;
  private victoryText: Phaser.GameObjects.Text | null = null;
  
  private targetXOffset: number = 0;
  private currentXOffset: number = 0;
  private isGameOver: boolean = false;
  
  private audioCtx!: AudioContext | null;
  private ropePullListenerWrapper!: (e: Event) => void;
  private gameResetListenerWrapper!: () => void;

  // Configuration Constants
  private readonly ZONE_WIDTH = 120;  // Width of the victory zone box
  private readonly ZONE_HEIGHT = 120; // Height of the victory zone box
  private readonly PULL_STEP = 45;    // The pixel distance shifted per correct answer

  constructor() {
    super('TugScene');
    this.audioCtx = null;
  }

  init() {
    try {
      const WinAudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (WinAudioContext) this.audioCtx = new WinAudioContext();
    } catch (e) {
      console.warn("Web Audio API blocked:", e);
    }
  }

  preload() {
    this.load.image('arena_illustration', 'assets/tug-arena.jpg');
  }

  create() {
    const { width, height } = this.scale;
    this.isGameOver = false;
    this.targetXOffset = 0;
    this.currentXOffset = 0;
    this.victoryText = null;

    // 1. Create the master sliding world container perfectly centered in the viewport view
    this.gameContainer = this.add.container(width / 2, height / 2);

    // 2. Add unified full-width team illustration asset inside the container (centered at 0,0 locally)
    this.backgroundArena = this.add.image(0, 0, 'arena_illustration');
    this.backgroundArena.setDisplaySize(width * 1.5, height); 
    this.gameContainer.add(this.backgroundArena);

    // 3. Add structural hidden flag layer at local origin center (0,0) inside the moving container
    this.flag = this.add.rectangle(0, 0, 20, 40, 0xeab308).setOrigin(0.5).setAlpha(0);
    this.gameContainer.add(this.flag);

    // 4. FIX: Draw the target box directly on the SCENE root, NOT inside the moving container.
    // We draw it around (width / 2, height / 2) so it stays completely stationary on the screen.
    this.centerZoneSquare = this.add.graphics();
    this.drawStaticVictoryZone();

    // Register active answer updates listener
    this.ropePullListenerWrapper = (e: Event) => {
      this.handleRopePull(e as CustomEvent<{ position: number; player: 'p1' | 'p2'; correct: boolean }>);
    };
    window.addEventListener('rope_pull', this.ropePullListenerWrapper);

    // Register corrected global state flush reset channel
    this.gameResetListenerWrapper = () => {
      this.handleSystemReset();
    };
    window.addEventListener('game_reset', this.gameResetListenerWrapper);

    // Handle responsiveness if the canvas sizes dynamically change mid-game
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Draws the victory box on the screen layer, perfectly centered in world coordinates.
   */
  private drawStaticVictoryZone() {
    const { width, height } = this.scale;
    this.centerZoneSquare.clear();
    this.centerZoneSquare.lineStyle(4, 0xef4444, 0.8);
    
    // Centered explicitly in the absolute middle of the canvas screen area
    this.centerZoneSquare.strokeRect(
      width / 2 - this.ZONE_WIDTH / 2, 
      height / 2 - this.ZONE_HEIGHT / 2, 
      this.ZONE_WIDTH, 
      this.ZONE_HEIGHT
    );
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;
    
    // Re-center container base coordinates safely
    this.gameContainer.setPosition(width / 2 + this.currentXOffset, height / 2);
    this.backgroundArena.setDisplaySize(width * 1.5, height);

    // Re-render static bounding graphics layout accurately in screen space
    this.drawStaticVictoryZone();

    // Handle victory text relocation adjustments if existing during screen adaptations
    if (this.victoryText) {
      this.victoryText.setPosition(width / 2, height / 4);
    }
  }

  private handleRopePull(e: CustomEvent<{ position: number; player: 'p1' | 'p2'; correct: boolean }>) {
    if (!this.sys || this.isGameOver) return;

    const { player, correct } = e.detail;

    if (correct) {
      this.playSynthSound(587.33, 'triangle', 0.15);
      this.cameras.main.shake(100, 0.005);

      if (player === 'p1') {
        this.targetXOffset -= this.PULL_STEP;
      } else {
        this.targetXOffset += this.PULL_STEP;
      }
    } else {
      this.playSynthSound(130.81, 'sawtooth', 0.25);
      
      if (player === 'p1') {
        this.targetXOffset += this.PULL_STEP * 0.3;
      } else {
        this.targetXOffset -= this.PULL_STEP * 0.3;
      }
    }
  }

  private handleSystemReset() {
    const { width, height } = this.scale;
    
    if (this.victoryText) {
      this.victoryText.destroy();
      this.victoryText = null;
    }

    this.targetXOffset = 0;
    this.currentXOffset = 0;
    this.isGameOver = false;

    // Reset container positions completely back to standard viewport middle points
    this.gameContainer.setPosition(width / 2, height / 2);
    this.drawStaticVictoryZone();
  }

  update() {
    if (this.isGameOver) return;

    const { width, height } = this.scale;

    // Smooth linear frame-rate independent position movement calculations
    this.currentXOffset = Phaser.Math.Linear(this.currentXOffset, this.targetXOffset, 0.12);
    this.gameContainer.x = (width / 2) + this.currentXOffset;

    // FIX WIN CONDITION: Track the flag's absolute global position on the screen
    // Since the container center is (width / 2 + currentXOffset) and the flag sits at 0 locally:
    const flagGlobalX = this.gameContainer.x; 

    const halfZone = this.ZONE_WIDTH / 2;
    const leftBoundary = width / 2 - halfZone;
    const rightBoundary = width / 2 + halfZone;

    // Trigger victory if the flag's real-time screen coordinate escapes the stationary boundaries
    if (flagGlobalX < leftBoundary) {
      this.triggerVictory('p1'); 
    } else if (flagGlobalX > rightBoundary) {
      this.triggerVictory('p2'); 
    }
  }

  private triggerVictory(winner: 'p1' | 'p2') {
    this.isGameOver = true;
    this.playSynthSound(880, 'sine', 0.5);
    
    const teamName = winner === 'p1' ? 'BLUE TEAM' : 'RED TEAM';
    const teamColor = winner === 'p1' ? '#3b82f6' : '#ef4444';

    this.victoryText = this.add.text(this.scale.width / 2, this.scale.height / 4, `${teamName} WINS!`, {
      font: '900 36px Inter, sans-serif',
      color: teamColor,
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    window.dispatchEvent(new CustomEvent('game_over', { detail: { winner } }));
  }

  private playSynthSound(freq: number, type: OscillatorType, duration: number) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context failure execution bypass:", e);
    }
  }

  destroy() {
    this.scale.off('resize', this.handleResize, this);
    if (this.ropePullListenerWrapper) {
      window.removeEventListener('rope_pull', this.ropePullListenerWrapper);
    }
    if (this.gameResetListenerWrapper) {
      window.removeEventListener('game_reset', this.gameResetListenerWrapper);
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }
}