import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { generateQuestionForRound } from '../../utils/questionGenerator';
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playRoundWinSound, 
  playChampionSound 
} from '../../utils/sound';

const ALL_BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
const QUESTIONS_PER_ROUND = 6;

export default function StudentPad() {
  const { gameState, myTeam, setMyTeam, updateRoomState } = useGame();
  const [customTeamName, setCustomTeamName] = useState('');
  const [guess, setGuess] = useState('');
  const activeMatch = gameState.activeMatch;

  if (!myTeam) {
    const handleCreateCustomTeam = (e) => {
      e.preventDefault();
      const formattedName = customTeamName.trim().toUpperCase();
      if (!formattedName) return;

      playClickSound();
      const currentTeams = gameState.teams || [];
      if (!currentTeams.includes(formattedName)) {
        updateRoomState({
          ...gameState,
          teams: [...currentTeams, formattedName]
        });
      }

      setMyTeam(formattedName);
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center font-mono">
        <div className="w-full max-w-sm bg-slate-900 border border-sky-500/30 p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-bold text-sky-400 mb-1">📱 GABUNG ARENA</h2>
          <p className="text-xs text-slate-400 mb-6">Buat nama kelompok baru atau pilih yang sudah ada</p>

          <form onSubmit={handleCreateCustomTeam} className="mb-6 pb-6 border-b border-slate-800">
            <label className="text-xs text-slate-400 block mb-2">BUAT NAMA KELOMPOK SENDIRI</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTeamName}
                onChange={(e) => setCustomTeamName(e.target.value)}
                placeholder="CONTOH: CYBER NATIVE"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-xs rounded p-3 outline-none uppercase"
              />
              <button
                type="submit"
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded cursor-pointer transition"
              >
                BUAT
              </button>
            </div>
          </form>

          <div>
            <label className="text-xs text-slate-400 block mb-2">ATAU PILIH KELOMPOK TERDAFTAR</label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {gameState.teams?.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMyTeam(team);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 hover:border-sky-400 text-slate-300 font-bold rounded text-xs text-left cursor-pointer transition"
                >
                  👥 {team}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTeamA = activeMatch?.teamA?.name === myTeam;
  const isTeamB = activeMatch?.teamB?.name === myTeam;
  const isMyTurn = gameState.status === 'IN_MATCH' && (isTeamA || isTeamB);

  if (!isMyTurn) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center text-center font-mono">
        <div className="text-xl font-bold text-sky-400 mb-2">{myTeam}</div>
        <div className="text-xs text-slate-500 animate-pulse mb-6">
          {gameState.status === 'IN_MATCH'
            ? 'Pertandingan sedang berjalan (Menunggu giliran kelompok Anda)...'
            : 'Menunggu guru memulai pertandingan di layar utama...'}
        </div>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setMyTeam(null);
          }}
          className="text-xs text-slate-500 underline hover:text-slate-300 cursor-pointer"
        >
          Ganti / Ubah Nama Kelompok
        </button>
      </div>
    );
  }

  const teamKey = isTeamA ? 'teamA' : 'teamB';
  const teamData = activeMatch[teamKey];
  const teamA = activeMatch.teamA;
  const teamB = activeMatch.teamB;
  const matchKey = activeMatch.matchKey;
  const currentMatchRound = activeMatch.currentMatchRound || 1;
  const roundLevel = activeMatch.roundLevel || 1;
  const isChallenge = teamData.questionType === 'UNLOCK_CHALLENGE';

  const bits = teamData.bits || [0, 0, 0, 0, 0, 0, 0, 0];
  const activeLen = teamData.bitLength || (roundLevel === 4 ? 8 : 5);

  const activeWeights = ALL_BIT_WEIGHTS.slice(8 - activeLen);
  const activeBits = bits.slice(8 - activeLen);

  const handleToggleBit = (arrayIdx) => {
    playClickSound();
    const updatedBits = [...bits];
    updatedBits[arrayIdx] = updatedBits[arrayIdx] === 0 ? 1 : 0;

    updateRoomState({
      ...gameState,
      activeMatch: {
        ...activeMatch,
        [teamKey]: {
          ...teamData,
          bits: updatedBits
        }
      }
    });
  };

  const currentSum = activeBits.reduce((acc, bit, idx) => acc + bit * activeWeights[idx], 0);

  const handleProcessAnswer = (targetBitLen = activeLen) => {
    const solvedInRound = (teamData.questionsSolvedInRound || 0) + 1;

    // Check Round Victory (6 Questions Solved)
    if (solvedInRound >= QUESTIONS_PER_ROUND) {
      const isA = teamKey === 'teamA';
      const newRoundsWonA = (teamA.roundsWon || 0) + (isA ? 1 : 0);
      const newRoundsWonB = (teamB.roundsWon || 0) + (isA ? 0 : 1);

      // Check Match Victory
      if (newRoundsWonA >= 2 || newRoundsWonB >= 2) {
        playChampionSound();
        const winnerName = newRoundsWonA >= 2 ? teamA.name : teamB.name;
        const currentMatches = { ...gameState.matches };

        currentMatches[matchKey] = {
          ...currentMatches[matchKey],
          winner: winnerName,
          completed: true
        };

        const allKeys = Object.keys(currentMatches);
        const allCompleted = allKeys.every((k) => currentMatches[k].completed);

        if (allCompleted) {
          const winners = allKeys.map((k) => currentMatches[k].winner);

          if (winners.length === 1) {
            updateRoomState({
              ...gameState,
              status: 'FINISHED',
              champion: winners[0],
              matches: currentMatches,
              activeMatch: null
            });
            return;
          }

          const nextRoundMatches = {};
          for (let i = 0; i < winners.length; i += 2) {
            nextRoundMatches[`m${i / 2 + 1}`] = {
              id: `m_${i / 2}`,
              t1: winners[i] || 'TBD',
              t2: winners[i + 1] || 'TBD',
              winner: null,
              completed: false
            };
          }

          updateRoomState({
            ...gameState,
            status: 'BRACKET',
            matches: nextRoundMatches,
            activeMatch: null
          });
          return;
        }

        updateRoomState({
          ...gameState,
          status: 'BRACKET',
          matches: currentMatches,
          activeMatch: null
        });
        return;
      }

      // Reset for next match round using correct starting bit length
      playRoundWinSound();
      const nextMatchRound = currentMatchRound + 1;
      const startingBits = roundLevel === 4 ? 8 : 5;
      const initialQA = generateQuestionForRound(roundLevel, startingBits, 0);
      const initialQB = generateQuestionForRound(roundLevel, startingBits, 0);

      setGuess('');

      updateRoomState({
        ...gameState,
        activeMatch: {
          ...activeMatch,
          currentMatchRound: nextMatchRound,
          teamA: {
            ...teamA,
            roundsWon: newRoundsWonA,
            questionsSolvedInRound: 0,
            bitLength: initialQA.bitLength || startingBits,
            questionType: initialQA.type,
            target: initialQA.target,
            targetBit: initialQA.targetBit || null,
            nextBitLength: initialQA.nextBitLength || null,
            bits: [0, 0, 0, 0, 0, 0, 0, 0],
            levelLabel: initialQA.label
          },
          teamB: {
            ...teamB,
            roundsWon: newRoundsWonB,
            questionsSolvedInRound: 0,
            bitLength: initialQB.bitLength || startingBits,
            questionType: initialQB.type,
            target: initialQB.target,
            targetBit: initialQB.targetBit || null,
            nextBitLength: initialQB.nextBitLength || null,
            bits: [0, 0, 0, 0, 0, 0, 0, 0],
            levelLabel: initialQB.label
          }
        }
      });
      return;
    }

    playCorrectSound();
    const nextQ = generateQuestionForRound(roundLevel, targetBitLen, solvedInRound);
    setGuess('');

    updateRoomState({
      ...gameState,
      activeMatch: {
        ...activeMatch,
        [teamKey]: {
          ...teamData,
          bitLength: nextQ.bitLength || targetBitLen,
          questionsSolvedInRound: solvedInRound,
          questionType: nextQ.type,
          target: nextQ.target,
          targetBit: nextQ.targetBit || null,
          nextBitLength: nextQ.nextBitLength || null,
          bits: [0, 0, 0, 0, 0, 0, 0, 0],
          levelLabel: nextQ.label
        }
      }
    });
  };

  const handleSubmit = () => {
    if (isChallenge) {
      if (parseInt(guess, 10) === teamData.targetBit) {
        handleProcessAnswer(teamData.nextBitLength);
      } else {
        playWrongSound();
        alert(`Jawaban Salah! Angka kelipatan bit berikutnya bukan ${guess}.`);
        setGuess('');
      }
      return;
    }

    if (currentSum === teamData.target) {
      handleProcessAnswer(activeLen);
    } else {
      playWrongSound();
      alert(`Jawaban Belum Tepat! Total Saat Ini: ${currentSum} / Target: ${teamData.target}.`);
    }
  };

  const solvedCount = teamData.questionsSolvedInRound || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col justify-between font-mono">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-sky-400">{myTeam}</span>
          <span className="text-xs text-yellow-400 font-bold">
            RONDE MENANG: {teamData.roundsWon || 0} / 2
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center mb-4 shadow-inner">
          <div className="flex justify-between items-center text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-1 px-1">
            <span>{teamData.levelLabel || `${activeLen}-BIT MODE`}</span>
            <span>SOAL: {solvedCount} / {QUESTIONS_PER_ROUND}</span>
          </div>

          {isChallenge ? (
            <div className="py-2">
              <p className="text-xs text-slate-300 mb-2">
                Berapa nilai bobot bit berikutnya setelah <span className="text-yellow-400 font-bold">{activeWeights[0]}</span>?
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                onFocus={(e) => e.target.select()}
                placeholder="Angka..."
                className="bg-slate-950 border border-amber-500/50 text-amber-400 text-center font-bold text-2xl rounded p-3 w-44 outline-none focus:border-amber-400"
              />
            </div>
          ) : (
            <>
              <div className="text-4xl font-extrabold text-sky-400 my-1">{teamData.target}</div>
              <div className="text-xs text-slate-400">
                Jumlah Bit: <span className="text-white font-bold">{currentSum}</span>
              </div>
            </>
          )}
        </div>

        {!isChallenge && (
          <div className={`grid gap-2 mb-4 ${activeLen === 5 ? 'grid-cols-5' : activeLen === 6 ? 'grid-cols-6' : activeLen === 7 ? 'grid-cols-7' : 'grid-cols-8'}`}>
            {activeWeights.map((weight, idx) => {
              const bitIndexInFullArray = 8 - activeLen + idx;
              const isOn = bits[bitIndexInFullArray] === 1;
              return (
                <button
                  key={weight}
                  type="button"
                  onClick={() => handleToggleBit(bitIndexInFullArray)}
                  className={`p-3 rounded flex flex-col items-center justify-center cursor-pointer border ${
                    isOn
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] text-slate-500">{weight}</span>
                  <span className="text-lg font-bold">{bits[bitIndexInFullArray]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-base cursor-pointer shadow-lg active:scale-95 transition"
      >
        {isChallenge ? '🔓 JAWAB TANTANGAN UNLOCK' : '▶ KIRIM OVERRIDE'}
      </button>
    </div>
  );
}