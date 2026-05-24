'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../game/useGameStore';
import GameConfigModal from '../components/GameConfigModal';
import ControlPanel from '../components/ControlPanel';
import dynamic from 'next/dynamic';

const GameContainer = dynamic(() => import('../components/GameContainer'), {
  ssr: false, 
  loading: () => (
    <div className="w-full h-full min-h-[260px] bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-slate-700">
      <span className="text-slate-400 font-bold animate-pulse">Initializing Game Engine Canvas...</span>
    </div>
  ),
});

export default function MathTugArena() {
  const { status, currentQuestion, winner, resetGame, setCountdownFinished } = useGameStore();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (status !== 'countdown') return;
    
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setCountdownFinished();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, setCountdownFinished]);

  return (
    <main className="h-screen w-screen max-h-screen max-w-full bg-slate-950 text-white grid grid-rows-[auto_1fr_auto] p-4 md:p-6 overflow-hidden font-sans select-none box-border gap-2">
      
      {/* ROOT PORTAL OVERLAYS */}
      {status === 'config' && <GameConfigModal />}

      {status === 'countdown' && (
        <div className="bg-slate-950/80 fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <span className="text-[12rem] font-black text-indigo-400 animate-ping absolute">
            {countdown}
          </span>
          <span className="text-[12rem] font-black text-white relative">
            {countdown}
          </span>
        </div>
      )}

      {status === 'victory' && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
          <div className="text-center space-y-6 max-w-lg">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-black shadow-2xl ${
              winner === 'Player 1' ? 'bg-blue-600 shadow-blue-500/40' : 'bg-red-600 shadow-red-500/40'
            }`}>
              🏆
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tight">
              Victory Achieved!
            </h1>
            <p className={`text-4xl font-black ${winner === 'Player 1' ? 'text-blue-400' : 'text-red-400'}`}>
              {winner === 'Player 1' ? 'BLUE TEAM WINS' : 'RED TEAM WINS'}
            </p>
            <p className="text-slate-400 font-medium px-4">
              The opposing team has been dragged completely past the outer line threshold boundary marker!
            </p>
            <button
              onClick={resetGame}
              className="mt-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl rounded-2xl shadow-xl shadow-indigo-600/30 transform active:scale-95 transition-all duration-150 uppercase tracking-wide"
            >
              Rematch Arena
            </button>
          </div>
        </div>
      )}

      {/* ROW 1: UPPER LAYOUT BLOCK (HUD Header & Fixed Formula Panel) */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-2">
        {/* ARENA HEADER HUD NAVBAR */}
        <header className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xl font-black tracking-tighter text-slate-400">
            💥 MATH TUG <span className="text-indigo-500">ARENA</span>
          </h2>
          {status === 'playing' && (
            <button 
              onClick={resetGame}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Abandon Match
            </button>
          )}
        </header>

        {/* HIGH-VISIBILITY MATHEMATICAL EQUATION DOCK */}
        {status === 'playing' && currentQuestion && (
          <div className="w-full flex justify-center py-1 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 px-12 py-2 rounded-xl shadow-xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Active Formula Challenge</p>
              <span className="text-4xl md:text-5xl font-black tracking-tight text-white block">
                {currentQuestion.expression}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ROW 2: CENTER CANVAS PLACEMENT BOX (Dynamically shrinks/expands to use available space) */}
      <div className="w-full max-w-7xl mx-auto relative min-h-0 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full max-h-full">
          <GameContainer />
        </div>
      </div>

      {/* ROW 3: INPUT BUTTON MATRIX INTERFACE BOARD */}
      <div className="w-full max-w-7xl mx-auto pt-2 border-t border-slate-900 self-end">
        {status === 'playing' ? (
          <ControlPanel />
        ) : (
          <div className="py-8 flex items-center justify-center text-slate-500 font-medium uppercase tracking-widest text-xs border-2 border-dashed border-slate-800 rounded-2xl w-full">
            Awaiting Arena Ingress Authorization...
          </div>
        )}
      </div>
    </main>
  );
}