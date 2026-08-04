import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export default function SetupForm() {
  const { gameState, updateRoomState } = useGame();
  const [count, setCount] = useState(gameState.teamCount || 4);
  
  const liveTeams = gameState.teams || [];
  const [teams, setTeams] = useState([]);

  // FIXED: Initialize teams array safely WITHOUT resetting on every gameState change
  useEffect(() => {
    setTeams((prev) => {
      const merged = [];
      for (let i = 0; i < count; i++) {
        // Keep existing user-selected team if present, otherwise grab from registered or default
        merged.push(prev[i] || liveTeams[i] || `KELOMPOK ${i + 1}`);
      }
      return merged;
    });
  }, [count]); // Only run when changing team count!

  // Combine live registered teams with slot array so ALL student teams show in dropdowns
  const availableOptions = Array.from(new Set([...teams, ...liveTeams]));

  const [pairings, setPairings] = useState([]);
  const [isManualSeeding, setIsManualSeeding] = useState(false);

  const handleCountChange = (newCount) => {
    setCount(newCount);
    setIsManualSeeding(false);
  };

  const handleTeamNameChange = (idx, value) => {
    const updated = [...teams];
    updated[idx] = value.toUpperCase();
    setTeams(updated);
  };

  const initManualSeeding = () => {
    const initialPairs = [];
    for (let i = 0; i < count; i += 2) {
      initialPairs.push({
        id: `m_${i / 2}`,
        t1: teams[i] || '',
        t2: teams[i + 1] || '',
        winner: null,
        completed: false
      });
    }
    setPairings(initialPairs);
    setIsManualSeeding(true);
  };

  const handlePairChange = (matchIdx, slot, selectedTeam) => {
    const copy = [...pairings];
    copy[matchIdx][slot] = selectedTeam;
    setPairings(copy);
  };

  const handleLaunchBracket = () => {
    updateRoomState({
      ...gameState,
      status: 'BRACKET',
      teamCount: count,
      teams: teams,
      matches: pairings.reduce((acc, pair, idx) => {
        acc[`m${idx + 1}`] = pair;
        return acc;
      }, {})
    });
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border-2 border-sky-500/50 rounded-xl p-6 shadow-xl font-mono">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-sky-400">🏆 PENGATURAN TURNAMEN</h2>
        <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
          👥 Terdaftar: {liveTeams.length} Kelompok
        </span>
      </div>

      {!isManualSeeding ? (
        <>
          {/* TEAM COUNT SELECTOR */}
          <div className="mb-6">
            <label className="text-xs text-slate-400 block mb-2 font-mono">JUMLAH KELOMPOK DALAM BAGAN</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 8, 16].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCountChange(num)}
                  className={`py-2 rounded font-mono font-bold text-sm cursor-pointer border ${
                    count === num
                      ? 'bg-sky-500 border-sky-400 text-slate-950'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {num} KELOMPOK
                </button>
              ))}
            </div>
          </div>

          {/* EDIT & VIEW REGISTERED TEAMS */}
          <div className="mb-6">
            <label className="text-xs text-slate-400 block mb-2 font-mono">
              SLOT KELOMPOK DALAM BAGAN:
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {teams.map((t, idx) => (
                <div key={idx}>
                  <label className="text-[10px] text-slate-500 font-mono">Slot {idx + 1}</label>
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2 text-xs font-mono outline-none focus:border-sky-400 uppercase"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={initManualSeeding}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded cursor-pointer transition text-sm font-mono"
          >
            ⚙ ATUR ATURAN TANDING (MANUAL SEEDING)
          </button>
        </>
      ) : (
        <>
          {/* MANUAL PAIRING / SEEDING DROPDOWNS */}
          <h3 className="text-sm font-bold text-yellow-400 mb-3 font-mono">PENENTUAN MATCHUP PERTANDINGAN</h3>
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-6 pr-1">
            {pairings.map((pair, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded flex items-center gap-3 font-mono">
                <span className="text-xs text-sky-400 font-bold w-16">MATCH {idx + 1}</span>
                <select
                  value={pair.t1}
                  onChange={(e) => handlePairChange(idx, 't1', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs p-2 rounded flex-1 outline-none"
                >
                  <option value="">-- Pilih Kelompok 1 --</option>
                  {availableOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 font-bold">VS</span>
                <select
                  value={pair.t2}
                  onChange={(e) => handlePairChange(idx, 't2', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs p-2 rounded flex-1 outline-none"
                >
                  <option value="">-- Pilih Kelompok 2 --</option>
                  {availableOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsManualSeeding(false)}
              className="py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded text-xs cursor-pointer font-mono"
            >
              KEMBALI
            </button>
            <button
              type="button"
              onClick={handleLaunchBracket}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded cursor-pointer transition text-sm font-mono"
            >
              ▶ SIMPAN & TAMPILKAN BAGAN
            </button>
          </div>
        </>
      )}
    </div>
  );
}