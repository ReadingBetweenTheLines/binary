import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import StudentPad from './components/mobile/StudentPad';
import BracketTree from './components/bracket/BracketTree';
import Arena from './components/arena/Arena';

export default function App() {
  const [role, setRole] = useState(null); // null | 'TEACHER' | 'STUDENT'
  const [teacherPass, setTeacherPass] = useState('');
  const [isTeacherAuthed, setIsTeacherAuthed] = useState(false);
  const { gameState } = useGame();

  const handleTeacherAuth = (e) => {
    e.preventDefault();
    if (teacherPass === 'choom') {
      setIsTeacherAuthed(true);
    } else {
      alert('Kode Akses Guru Salah!');
    }
  };

  // 1. Role Selection Screen (App Entry)
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-mono">
        <div className="w-full max-w-md bg-slate-900 border border-sky-500/30 p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-sky-400 mb-2">⚡ BINARY CLASH</h1>
          <p className="text-xs text-slate-400 mb-8">Pilih mode akses untuk melanjutkan</p>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              📱 MASUK SEBAGAI SISWA
            </button>

            <button
              type="button"
              onClick={() => setRole('TEACHER')}
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
            onClick={() => setRole(null)}
            className="text-slate-500 hover:text-slate-300 underline cursor-pointer"
          >
            Keluar
          </button>
        </div>
        <StudentPad />
      </div>
    );
  }

  // 3. Teacher Password Prompt
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
              placeholder="Masukkan PIN (Default: 1234)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-center font-mono rounded p-3 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole(null)}
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

  // 4. Teacher Dashboard (Shows Arena when match is active, otherwise BracketTree)
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
            setIsTeacherAuthed(false);
            setRole(null);
          }}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition cursor-pointer"
        >
          🔒 KELUAR HOST
        </button>
      </header>

      <main className="flex flex-col items-center justify-center">
        {gameState?.status === 'IN_MATCH' ? <Arena /> : <BracketTree />}
      </main>
    </div>
  );
}