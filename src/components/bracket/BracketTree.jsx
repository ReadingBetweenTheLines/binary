import React from 'react';
import { useGame } from '../../context/GameContext';
import { generateQuestionForRound } from '../../utils/questionGenerator';

export default function BracketTree() {
    const { gameState, updateRoomState } = useGame();
    const matches = gameState.matches || {};
    const matchKeys = Object.keys(matches);

    const totalMatchesInRound = matchKeys.length;
    const currentRoundLevel =
        totalMatchesInRound >= 4 ? 1 : totalMatchesInRound === 2 ? 2 : totalMatchesInRound === 1 ? 4 : 1;

    const handleStartMatch = (matchKey) => {
        const selectedMatch = matches[matchKey];
        if (!selectedMatch?.t1 || !selectedMatch?.t2) {
            alert("Pastikan kedua kelompok dalam match ini sudah terisi!");
            return;
        }

        const qA = generateQuestionForRound(currentRoundLevel, 5, 0);
        const qB = generateQuestionForRound(currentRoundLevel, 5, 0);

        const activeMatchData = {
            matchKey,
            timer: null,
            roundLevel: currentRoundLevel,
            isRunning: true,
            teamA: {
                name: selectedMatch.t1,
                score: 0,
                target: qA.target,
                targetBit: qA.targetBit || null,
                nextBitLength: qA.nextBitLength || null,
                questionType: qA.type,
                bitLength: qA.bitLength || 5,
                questionsSolvedInLevel: 0,
                levelLabel: qA.label,
                bits: [0, 0, 0, 0, 0, 0, 0, 0]
            },
            teamB: {
                name: selectedMatch.t2,
                score: 0,
                target: qB.target,
                targetBit: qB.targetBit || null,
                nextBitLength: qB.nextBitLength || null,
                questionType: qB.type,
                bitLength: qB.bitLength || 5,
                questionsSolvedInLevel: 0,
                levelLabel: qB.label,
                bits: [0, 0, 0, 0, 0, 0, 0, 0]
            }
        };

        updateRoomState({
            ...gameState,
            status: 'IN_MATCH',
            activeMatch: activeMatchData
        });
    };

    // FEATURE: Disqualify a specific team in a match slot
    const handleDisqualifyTeam = (matchKey, teamToDisqualify, winnerTeam) => {
        if (!teamToDisqualify || teamToDisqualify === '---') return;

        if (window.confirm(`Apakah Anda yakin ingin mendiskualifikasi "${teamToDisqualify}"? "${winnerTeam}" akan otomatis menang.`)) {
            const currentMatches = { ...matches };

            currentMatches[matchKey] = {
                ...currentMatches[matchKey],
                winner: winnerTeam,
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
                matches: currentMatches
            });
        }
    };

    const handleResetTournament = () => {
        if (window.confirm("Apakah Anda yakin ingin meriset seluruh bagan dan mengubah kelompok?")) {
            updateRoomState({
                ...gameState,
                status: 'LOBBY',
                activeMatch: null
            });
        }
    };

    const getRoundTitle = () => {
        if (currentRoundLevel === 1) return "BABAK KUALIFIKASI (DESIMAL BINER)";
        if (currentRoundLevel === 2) return "BABAK SEMIFINAL (LOGIC GATES)";
        if (currentRoundLevel === 4) return "GRAND FINAL (TWO'S COMPLEMENT)";
        return "BAGAN TURNAMEN";
    };

    return (
        <div className="w-full max-w-4xl bg-slate-900 border-2 border-sky-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(56,189,248,0.15)] font-mono">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-sky-400 tracking-wide">{getRoundTitle()}</h2>
                    <p className="text-xs text-slate-400">Pilih pertandingan untuk memulai duel</p>
                </div>
                <button
                    type="button"
                    onClick={handleResetTournament}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs rounded border border-rose-500/40 cursor-pointer transition"
                >
                    ⚙ RISET & UBAH KELOMPOK
                </button>
            </div>

            {/* DYNAMIC MATCHES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchKeys.map((key, idx) => {
                    const m = matches[key];
                    return (
                        <div key={key} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-sky-400 font-bold">PERTANDINGAN {idx + 1}</span>
                                {m?.completed && (
                                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                        SELESAI
                                    </span>
                                )}
                            </div>

                            {/* TEAM 1 SLOT */}
                            <div className="flex justify-between items-center py-2 px-3 bg-slate-900/60 rounded mb-2 border border-slate-800/80 text-sm">
                                <span className={m?.winner && m.winner === m.t1 ? "text-emerald-400 font-bold" : "text-white"}>
                                    {m?.t1 || '---'}
                                </span>
                                <div className="flex items-center gap-2">
                                    {m?.winner && m.winner === m.t1 && <span>🏆</span>}
                                    {!m?.completed && m?.t1 && m?.t2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDisqualifyTeam(key, m.t1, m.t2)}
                                            className="text-[10px] bg-rose-950 hover:bg-rose-900 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800 cursor-pointer"
                                            title="Diskualifikasi Kelompok 1"
                                        >
                                            🚫 DQ
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="text-center text-[10px] text-slate-600 my-1 font-bold">VS</div>

                            {/* TEAM 2 SLOT */}
                            <div className="flex justify-between items-center py-2 px-3 bg-slate-900/60 rounded mt-2 border border-slate-800/80 text-sm">
                                <span className={m?.winner && m.winner === m.t2 ? "text-emerald-400 font-bold" : "text-white"}>
                                    {m?.t2 || '---'}
                                </span>
                                <div className="flex items-center gap-2">
                                    {m?.winner && m.winner === m.t2 && <span>🏆</span>}
                                    {!m?.completed && m?.t1 && m?.t2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDisqualifyTeam(key, m.t2, m.t1)}
                                            className="text-[10px] bg-rose-950 hover:bg-rose-900 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800 cursor-pointer"
                                            title="Diskualifikasi Kelompok 2"
                                        >
                                            🚫 DQ
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!m?.completed && (
                                <button
                                    type="button"
                                    onClick={() => handleStartMatch(key)}
                                    className="mt-4 w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded transition cursor-pointer shadow-md"
                                >
                                    ▶ MAINkan MATCH {idx + 1}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}