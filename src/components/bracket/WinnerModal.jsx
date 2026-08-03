import React from 'react';
import { useGame } from '../../context/GameContext';

export default function WinnerModal() {
  const { gameState, updateRoomState } = useGame();

  const handleRestart = () => {
    updateRoomState({
      status: 'LOBBY',
      teamCount: 4,
      teams: [],
      matches: {},
      activeMatch: null,
      champion: null
    });
  };

  return (
    <div className="w-full max-w-lg bg-slate-900 border-2 border-yellow-500/50 rounded-xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-xs font-mono text-yellow-400 tracking-widest uppercase mb-1">JUARA TURNAMEN</h2>
      <h1 className="text-3xl font-extrabold text-white font-mono mb-6">{gameState.champion}</h1>

      <p className="text-xs text-slate-400 font-mono mb-8">
        Selamat! Kelompok ini berhasil memenangkan seluruh babak pertarungan biner!
      </p>

      <button
        type="button"
        onClick={handleRestart}
        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold rounded-lg font-mono text-sm cursor-pointer transition shadow-lg"
      >
        🔄 MULAI TURNAMEN BARU
      </button>
    </div>
  );
}