'use client';

import { useState } from 'react';
import { useGameStore } from '../game/useGameStore';

export default function GameConfigModal() {
  const startGame = useGameStore((state) => state.startGame);
  const [minInput, setMinInput] = useState('1');
  const [maxInput, setMaxInput] = useState('20');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLaunch = () => {
    let minVal = parseInt(minInput) || 0;
    let maxVal = parseInt(maxInput) || 0;

    if (minVal < 0) minVal = 0;
    
    // Require a healthy variance distribution range for gameplay stability
    if (maxVal < minVal + 5) {
      maxVal = minVal + 5;
      setMaxInput(maxVal.toString());
      setErrorMessage(`Maximum adjusted to ${maxVal} to retain operational variance math!`);
      return;
    }

    setErrorMessage('');
    startGame(minVal, maxVal);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center transform scale-100 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 mb-2 tracking-tight">
          MATH TUG ARENA
        </h1>
        <p className="text-slate-400 mb-8 font-medium">Local 2-Player Classroom Faceoff</p>
        
        <div className="space-y-6 text-left mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Minimum Number Bounds</label>
            <input 
              type="number" 
              value={minInput} 
              onChange={(e) => {
                setErrorMessage('');
                setMinInput(e.target.value);
              }}
              placeholder="0"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Maximum Number Bounds</label>
            <input 
              type="number" 
              value={maxInput} 
              onChange={(e) => {
                setErrorMessage('');
                setMaxInput(e.target.value);
              }}
              placeholder="5"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-amber-400 text-sm font-medium mb-4 animate-pulse">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleLaunch}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transform transition-all duration-150 uppercase tracking-wide"
        >
          Enter Arena
        </button>
      </div>
    </div>
  );
}