'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { TugScene } from '../game/TugScene';
import { useGameStore } from '../game/useGameStore';

export default function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  
  // 1. Grab our victory state actions from the store
  const setGameOver = useGameStore((state) => state.setGameOver);

  useEffect(() => {
    // 2. Set up the event listener to catch the Phaser boundary win signal
    const handlePhaserGameOver = (e: Event) => {
      const customEvent = e as CustomEvent<{ winner: 'p1' | 'p2' }>;
      const { winner } = customEvent.detail;
      
      // Update the Zustand state store status to 'victory' immediately
      setGameOver(winner);
    };

    window.addEventListener('game_over', handlePhaserGameOver);

    // Phaser Instance Initialization Engine Core
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: 320,
      parent: containerRef.current,
      backgroundColor: '#0f172a',
      physics: { default: 'arcade' },
      scene: [TugScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Clean up event listener and destroy game instance cleanly on unmount
    return () => {
      window.removeEventListener('game_over', handlePhaserGameOver);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [setGameOver]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border-4 border-slate-700 bg-slate-900 shadow-2xl">
      <div ref={containerRef} className="w-full h-[320px]" />
    </div>
  );
}