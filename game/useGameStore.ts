import { create } from 'zustand';
import { generateQuestion, Question } from '../utils/mathEngine';

export type GameStatus = 'config' | 'countdown' | 'playing' | 'victory';

interface GameState {
  status: GameStatus;
  currentQuestion: Question | null;
  ropePosition: number; // Range: -100 to +100
  p1Freeze: boolean;
  p2Freeze: boolean;
  winner: 'Player 1' | 'Player 2' | null;
  scoreRange: { min: number; max: number };
  
  // Interactive Mutators
  startGame: (min: number, max: number) => void;
  submitAnswer: (player: 'p1' | 'p2', selected: number) => void;
  setGameOver: (winnerId: 'p1' | 'p2') => void;
  resetGame: () => void;
  clearFreeze: (player: 'p1' | 'p2') => void;
  setCountdownFinished: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'config',
  currentQuestion: null,
  ropePosition: 0,
  p1Freeze: false,
  p2Freeze: false,
  winner: null,
  scoreRange: { min: 1, max: 20 },

  startGame: (min, max) => {
    // Notify the canvas system to flush old offsets before match initialization
    window.dispatchEvent(new CustomEvent('game_reset'));

    set({
      scoreRange: { min, max },
      status: 'countdown',
      ropePosition: 0,
      p1Freeze: false,
      p2Freeze: false,
      winner: null,
      currentQuestion: generateQuestion(min, max),
    });
  },

  setCountdownFinished: () => {
    set({ status: 'playing' });
  },

  submitAnswer: (player, selected) => {
    const { currentQuestion, ropePosition, p1Freeze, p2Freeze, scoreRange, status } = get();
    
    // Safety Guardrails
    if (status !== 'playing' || !currentQuestion) return;
    if (player === 'p1' && p1Freeze) return;
    if (player === 'p2' && p2Freeze) return;

    const isCorrect = selected === currentQuestion.correctAnswer;

    if (isCorrect) {
      // P1 pulls left (negative translation), P2 pulls right (positive translation)
      const pullDelta = player === 'p1' ? -15 : 15;
      const nextPosition = Math.min(Math.max(ropePosition + pullDelta, -100), 100);

      set({
        ropePosition: nextPosition,
        currentQuestion: generateQuestion(scoreRange.min, scoreRange.max),
        p1Freeze: false,
        p2Freeze: false,
      });

      window.dispatchEvent(new CustomEvent('rope_pull', { 
        detail: { position: nextPosition, player, correct: true } 
      }));
    } else {
      // Trigger stun freeze state penalties
      if (player === 'p1') set({ p1Freeze: true });
      if (player === 'p2') set({ p2Freeze: true });
      
      window.dispatchEvent(new CustomEvent('rope_pull', { 
        detail: { position: ropePosition, player, correct: false } 
      }));
    }
  },

  setGameOver: (winnerId) => {
    set({
      status: 'victory',
      winner: winnerId === 'p1' ? 'Player 1' : 'Player 2',
      p1Freeze: false,
      p2Freeze: false,
    });
  },

  clearFreeze: (player) => {
    if (player === 'p1') set({ p1Freeze: false });
    if (player === 'p2') set({ p2Freeze: false });
  },

  resetGame: () => {
    window.dispatchEvent(new CustomEvent('game_reset'));

    set({
      status: 'config',
      currentQuestion: null,
      ropePosition: 0,
      p1Freeze: false,
      p2Freeze: false,
      winner: null,
    });
  },
}));