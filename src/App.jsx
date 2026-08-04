import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import StudentPad from './components/mobile/StudentPad';
import BracketTree from './components/bracket/BracketTree';
import Arena from './components/arena/Arena';
import SetupForm from './components/lobby/SetupForm';
import { playClickSound, playChampionSound } from './utils/sound';

export default function App() {
  const [role, setRole] = useState(null); // null | 'TEACHER' | 'STUDENT'
  const [teacherPass, setTeacherPass] = useState('');
  const [isTeacherAuthed, setIsTeacherAuthed] = useState(false);
  const { gameState, updateRoomState } = useGame();

  // Trigger victory fanfare sound on tournament complete
  useEffect(() => {
    if (gameState?.status === 'FINISHED') {
      playChampionSound();
    }
  }, [gameState?.status]);

  const handleTeacherAuth = (e) => {
    e.preventDefault();
    if (teacherPass === 'choom') {
      playClickSound();
      setIsTeacherAuthed(true);
    } else {
      alert('Kode Akses Guru Salah!');
    }
  };

  const handleRestartTournament = () => {
    playClickSound();
    updateRoomState({
      ...gameState,
      status: 'LOBBY',
      activeMatch: null,
      champion: null
    });
  };

  // 1. Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-mono">
        <div className="w-full max-w-md bg-slate-900 border border-sky-500/30 p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-sky-400 mb-2">⚡ BINARY CLASH</h1>
          <p className="text-xs text-slate-400 mb-8">Pilih mode akses untuk melanjutkan</p>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setRole('STUDENT');
              }}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              📱 MASUK SEBAGAI SISWA
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setRole('TEACHER');
              }}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              🖥️ MASUK SEBAGAI GURU / HOST
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Student View
  if (role === 'STUDENT') {
    return (
      <div>
        <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-between items-center text-[10px] font-mono px-4">
          <span className="text-slate-400">MODE SISWA</span>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setRole(null);
            }}
            className="text-slate-500 hover:text-slate-300 underline cursor-pointer"
          >
            Keluar
          </button>
        </div>
        <StudentPad />
      </div>
    );
  }

  // 3. Teacher Password Screen
  if (role === 'TEACHER' && !isTeacherAuthed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-mono">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-base font-bold text-sky-400 mb-2">🔒 AKSES GURU / HOST</h2>
          <p className="text-xs text-slate-400 mb-4">Masukkan PIN/Kode Akses untuk mengelola arena</p>

          <form onSubmit={handleTeacherAuth} className="space-y-4">
            <input
              type="password"
              value={teacherPass}
              onChange={(e) => setTeacherPass(e.target.value)}
              placeholder="Masukkan PIN (Default: choom)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-center font-mono rounded p-3 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setRole(null);
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded transition cursor-pointer"
              >
                KEMBALI
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded transition cursor-pointer"
              >
                VERIFIKASI
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 4. Tournament Champion Victory View
  if (gameState?.status === 'FINISHED') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-mono">
        <div className="w-full max-w-lg bg-slate-900 border-2 border-yellow-500/60 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">JUARA TURNAMEN BINARY CLASH</h1>
          <div className="text-3xl font-extrabold text-white my-4 bg-slate-950 py-4 px-6 rounded-xl border border-yellow-500/30">
            {gameState.champion || 'PEMENANG'}
          </div>
          <p className="text-xs text-slate-400 mb-8">
            Selamat kepada kelompok pemenang yang telah menyelesaikan seluruh babak duel!
          </p>

          <button
            type="button"
            onClick={handleRestartTournament}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
          >
            🔄 BUAT TURNAMEN BARU
          </button>
        </div>
      </div>
    );
  }

  // 5. Main Teacher Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-mono">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-sky-400">🖥️ PANEL GURU / HOST</h1>
          <p className="text-xs text-slate-400">Atur turnamen dan tandingkan kelompok siswa</p>
        </div>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsTeacherAuthed(false);
            setRole(null);
          }}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition cursor-pointer"
        >
          🔒 KELUAR HOST
        </button>
      </header>

      <main className="flex flex-col items-center justify-center">
        {gameState?.status === 'IN_MATCH' ? (
          <Arena />
        ) : gameState?.status === 'LOBBY' ? (
          <SetupForm />
        ) : (
          <BracketTree />
        )}
      </main>
    </div>
  );
}