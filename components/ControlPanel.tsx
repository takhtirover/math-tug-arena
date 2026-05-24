'use client';

import { useEffect } from 'react';
import { useGameStore } from '../game/useGameStore';

export default function ControlPanel() {
  const { currentQuestion, submitAnswer, p1Freeze, p2Freeze, clearFreeze, status } = useGameStore();

  useEffect(() => {
    // Isolated local automatic timeout clearing tracking pipelines
    let p1Timer: NodeJS.Timeout;
    let p2Timer: NodeJS.Timeout;

    if (p1Freeze) {
      p1Timer = setTimeout(() => clearFreeze('p1'), 1000);
    }
    if (p2Freeze) {
      p2Timer = setTimeout(() => clearFreeze('p2'), 1000);
    }

    return () => {
      clearTimeout(p1Timer);
      clearTimeout(p2Timer);
    };
  }, [p1Freeze, p2Freeze, clearFreeze]);

  if (status !== 'playing' || !currentQuestion) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto items-stretch mt-6">
      {/* LEFT PLAYER INTERACTIVE BUTTON INPUT GRID AREA */}
      <div className={`bg-blue-950/40 border-2 border-blue-500/30 p-6 rounded-3xl transition-all duration-300 ${p1Freeze ? 'opacity-40 pointer-events-none scale-95 blur-[1px]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-black text-blue-400 uppercase tracking-widest">BLUE TEAM (P1)</span>
          {p1Freeze && <span className="text-red-400 font-black animate-pulse text-sm">⚠️ FROZEN (1s)</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((opt, index) => (
            <button
              key={`p1-${index}-${opt}`}
              onClick={() => submitAnswer('p1', opt)}
              className="h-24 md:h-28 text-3xl font-black rounded-2xl bg-slate-800 text-blue-100 hover:bg-blue-600 hover:text-white border-b-8 border-slate-900 active:border-b-0 active:translate-y-2 transition-all duration-100 transform selection:bg-transparent"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PLAYER INTERACTIVE BUTTON INPUT GRID AREA */}
      <div className={`bg-red-950/40 border-2 border-red-500/30 p-6 rounded-3xl transition-all duration-300 ${p2Freeze ? 'opacity-40 pointer-events-none scale-95 blur-[1px]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-black text-red-400 uppercase tracking-widest">RED TEAM (P2)</span>
          {p2Freeze && <span className="text-red-400 font-black animate-pulse text-sm">⚠️ FROZEN (1s)</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((opt, index) => (
            <button
              key={`p2-${index}-${opt}`}
              onClick={() => submitAnswer('p2', opt)}
              className="h-24 md:h-28 text-3xl font-black rounded-2xl bg-slate-800 text-red-100 hover:bg-red-600 hover:text-white border-b-8 border-slate-900 active:border-b-0 active:translate-y-2 transition-all duration-100 transform selection:bg-transparent"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}