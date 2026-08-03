import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { generateQuestionForRound } from '../../utils/questionGenerator';

const ALL_BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function Arena() {
  const { gameState, updateRoomState } = useGame();
  const activeMatch = gameState.activeMatch;

  if (!activeMatch) return null;

  const { matchKey, teamA, teamB } = activeMatch;
  const roundLevel = activeMatch.roundLevel || 1;

  const [bitsA, setBitsA] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [bitsB, setBitsB] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [guessA, setGuessA] = useState('');
  const [guessB, setGuessB] = useState('');

  const toggleBitA = (idx) => {
    setBitsA((prev) => {
      const copy = [...prev];
      copy[idx] = copy[idx] === 0 ? 1 : 0;
      return copy;
    });
  };

  const toggleBitB = (idx) => {
    setBitsB((prev) => {
      const copy = [...prev];
      copy[idx] = copy[idx] === 0 ? 1 : 0;
      return copy;
    });
  };

  const checkMatchWinner = (scoreA, scoreB) => {
    if (scoreA >= 200) return teamA.name;
    if (scoreB >= 200) return teamB.name;
    return null;
  };

  // Submit Logic for Team A
  const submitAnswerA = () => {
    const isChallenge = teamA.questionType === 'UNLOCK_CHALLENGE';

    if (isChallenge) {
      if (parseInt(guessA, 10) === teamA.targetBit) {
        const newBitLen = teamA.nextBitLength;
        const newScore = teamA.score + 100;
        const nextQ = generateQuestionForRound(roundLevel, newBitLen, 0);

        setGuessA('');
        setBitsA([0, 0, 0, 0, 0, 0, 0, 0]);

        const winner = checkMatchWinner(newScore, teamB.score);
        if (winner) {
          handleFinishMatch(winner);
          return;
        }

        updateRoomState({
          ...gameState,
          activeMatch: {
            ...activeMatch,
            teamA: {
              ...teamA,
              score: newScore,
              bitLength: newBitLen,
              questionType: nextQ.type,
              target: nextQ.target,
              targetBit: nextQ.targetBit || null,
              nextBitLength: nextQ.nextBitLength || null,
              questionsSolvedInLevel: 0,
              levelLabel: nextQ.label
            }
          }
        });
      } else {
        alert(`Salah! Nilai bobot bit berikutnya bukan ${guessA}. Perhatikan kelipatan 2!`);
        setGuessA('');
      }
      return;
    }

    const activeLen = teamA.bitLength || 5;
    const activeWeights = ALL_BIT_WEIGHTS.slice(8 - activeLen);
    const activeBits = bitsA.slice(8 - activeLen);
    const currentSum = activeBits.reduce((acc, bit, idx) => acc + bit * activeWeights[idx], 0);

    if (currentSum === teamA.target) {
      const newScore = teamA.score + 100;
      const solved = (teamA.questionsSolvedInLevel || 0) + 1;
      const nextQ = generateQuestionForRound(roundLevel, activeLen, solved);

      setBitsA([0, 0, 0, 0, 0, 0, 0, 0]);

      const winner = checkMatchWinner(newScore, teamB.score);
      if (winner) {
        handleFinishMatch(winner);
        return;
      }

      updateRoomState({
        ...gameState,
        activeMatch: {
          ...activeMatch,
          teamA: {
            ...teamA,
            score: newScore,
            questionType: nextQ.type,
            target: nextQ.target,
            targetBit: nextQ.targetBit || null,
            nextBitLength: nextQ.nextBitLength || null,
            questionsSolvedInLevel: nextQ.questionsSolvedInLevel,
            levelLabel: nextQ.label
          }
        }
      });
    } else {
      alert(`Jawaban ${teamA.name} belum cocok (${currentSum} / ${teamA.target})!`);
    }
  };

  // Submit Logic for Team B
  const submitAnswerB = () => {
    const isChallenge = teamB.questionType === 'UNLOCK_CHALLENGE';

    if (isChallenge) {
      if (parseInt(guessB, 10) === teamB.targetBit) {
        const newBitLen = teamB.nextBitLength;
        const newScore = teamB.score + 100;
        const nextQ = generateQuestionForRound(roundLevel, newBitLen, 0);

        setGuessB('');
        setBitsB([0, 0, 0, 0, 0, 0, 0, 0]);

        const winner = checkMatchWinner(teamA.score, newScore);
        if (winner) {
          handleFinishMatch(winner);
          return;
        }

        updateRoomState({
          ...gameState,
          activeMatch: {
            ...activeMatch,
            teamB: {
              ...teamB,
              score: newScore,
              bitLength: newBitLen,
              questionType: nextQ.type,
              target: nextQ.target,
              targetBit: nextQ.targetBit || null,
              nextBitLength: nextQ.nextBitLength || null,
              questionsSolvedInLevel: 0,
              levelLabel: nextQ.label
            }
          }
        });
      } else {
        alert(`Salah! Nilai bobot bit berikutnya bukan ${guessB}. Perhatikan kelipatan 2!`);
        setGuessB('');
      }
      return;
    }

    const activeLen = teamB.bitLength || 5;
    const activeWeights = ALL_BIT_WEIGHTS.slice(8 - activeLen);
    const activeBits = bitsB.slice(8 - activeLen);
    const currentSum = activeBits.reduce((acc, bit, idx) => acc + bit * activeWeights[idx], 0);

    if (currentSum === teamB.target) {
      const newScore = teamB.score + 100;
      const solved = (teamB.questionsSolvedInLevel || 0) + 1;
      const nextQ = generateQuestionForRound(roundLevel, activeLen, solved);

      setBitsB([0, 0, 0, 0, 0, 0, 0, 0]);

      const winner = checkMatchWinner(teamA.score, newScore);
      if (winner) {
        handleFinishMatch(winner);
        return;
      }

      updateRoomState({
        ...gameState,
        activeMatch: {
          ...activeMatch,
          teamB: {
            ...teamB,
            score: newScore,
            questionType: nextQ.type,
            target: nextQ.target,
            targetBit: nextQ.targetBit || null,
            nextBitLength: nextQ.nextBitLength || null,
            questionsSolvedInLevel: nextQ.questionsSolvedInLevel,
            levelLabel: nextQ.label
          }
        }
      });
    } else {
      alert(`Jawaban ${teamB.name} belum cocok (${currentSum} / ${teamB.target})!`);
    }
  };

  const handleFinishMatch = (winnerName) => {
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
  };

  const handleCancelMatch = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan pertandingan ini?")) {
      updateRoomState({
        ...gameState,
        status: 'BRACKET',
        activeMatch: null
      });
    }
  };

  const roundsA = teamA.score / 100;
  const roundsB = teamB.score / 100;

  return (
    <div className="w-full max-w-5xl bg-slate-900 border-2 border-sky-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-sky-400 font-mono">ARENA DUEL: {matchKey?.toUpperCase()}</h2>
          <p className="text-xs text-slate-400 font-mono">Sistem Best of 3 (BO3) — Kumpulkan 2 Kemenangan Ronde!</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-mono font-bold text-yellow-400 bg-slate-950 px-4 py-2 rounded-lg border border-yellow-500/30">
            🥊 BO3: {roundsA} - {roundsB}
          </div>

          <button
            type="button"
            onClick={handleCancelMatch}
            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 rounded text-xs font-mono font-bold cursor-pointer transition"
          >
            ⛔ BATALKAN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamPad
          teamData={teamA}
          bits={bitsA}
          guess={guessA}
          setGuess={setGuessA}
          color="sky"
          onToggleBit={toggleBitA}
          onSubmit={submitAnswerA}
        />

        <TeamPad
          teamData={teamB}
          bits={bitsB}
          guess={guessB}
          setGuess={setGuessB}
          color="rose"
          onToggleBit={toggleBitB}
          onSubmit={submitAnswerB}
        />
      </div>
    </div>
  );
}

function TeamPad({ teamData, bits, guess, setGuess, color, onToggleBit, onSubmit }) {
  const isSky = color === 'sky';
  const borderClass = isSky ? 'border-sky-500/40' : 'border-rose-500/40';
  const textClass = isSky ? 'text-sky-400' : 'text-rose-400';
  const btnBg = isSky ? 'bg-sky-500 hover:bg-sky-400' : 'bg-rose-500 hover:bg-rose-400';

  const isChallenge = teamData.questionType === 'UNLOCK_CHALLENGE';
  const activeLen = teamData.bitLength || 5;
  const activeWeights = ALL_BIT_WEIGHTS.slice(8 - activeLen);
  const activeBits = bits.slice(8 - activeLen);

  const currentSum = activeBits.reduce((acc, bit, idx) => acc + bit * activeWeights[idx], 0);
  const roundsWon = teamData.score / 100;

  return (
    <div className={`bg-slate-950 border-2 ${borderClass} rounded-xl p-5 flex flex-col justify-between shadow-lg`}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-base font-mono ${textClass}`}>{teamData.name}</h3>
          <div className="text-yellow-400 font-mono font-bold text-sm">
            RONDE MENANG: {roundsWon} / 2
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center mb-5">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono mb-1">
            {teamData.levelLabel || "LEVEL 1: 5-BIT MODE"}
          </div>

          {isChallenge ? (
            <div className="py-2">
              <p className="text-xs text-slate-300 font-mono mb-2">
                Berapa nilai bobot bit berikutnya setelah <span className="text-yellow-400 font-bold">{activeWeights[0]}</span>?
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                onFocus={(e) => e.target.select()}
                placeholder="Masukkan angka..."
                className="bg-slate-950 border border-amber-500/50 text-amber-400 text-center font-mono font-bold text-xl rounded p-2 w-48 outline-none focus:border-amber-400"
              />
            </div>
          ) : (
            <>
              <div className={`text-4xl font-extrabold font-mono my-1 ${textClass}`}>{teamData.target}</div>
              <div className="text-xs text-slate-400 font-mono">
                Jumlah Bit: <span className="text-white font-bold">{currentSum}</span>
              </div>
            </>
          )}
        </div>

        {!isChallenge && (
          <div className={`grid gap-1 mb-6 ${activeLen === 5 ? 'grid-cols-5' : activeLen === 6 ? 'grid-cols-6' : activeLen === 7 ? 'grid-cols-7' : 'grid-cols-8'}`}>
            {activeWeights.map((weight, idx) => {
              const bitIndexInFullArray = 8 - activeLen + idx;
              const isOn = bits[bitIndexInFullArray] === 1;

              return (
                <div key={weight} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-500 font-mono">{weight}</span>
                  <button
                    type="button"
                    onClick={() => onToggleBit(bitIndexInFullArray)}
                    className={`w-full aspect-square font-mono font-bold text-sm rounded transition cursor-pointer border ${
                      isOn
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {bits[bitIndexInFullArray]}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className={`w-full py-3 ${btnBg} text-slate-950 font-bold rounded-lg transition cursor-pointer text-sm font-mono shadow-md`}
      >
        {isChallenge ? '🔓 JAWAB TANTANGAN UNLOCK' : '▶ KIRIM OVERRIDE'}
      </button>
    </div>
  );
}