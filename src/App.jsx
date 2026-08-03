import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import SetupForm from './components/lobby/SetupForm';
import BracketTree from './components/bracket/BracketTree';
import Arena from './components/arena/Arena';
import StudentPad from './components/mobile/StudentPad';
import WinnerModal from './components/bracket/WinnerModal';

function GameContainer() {
  const { gameState } = useGame();
  const [isMobileMode, setIsMobileMode] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (isMobileMode) {
    return <StudentPad />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-sky-400 tracking-wider font-mono">⚔️ BINARY CLASH</h1>
          <p className="text-slate-500 text-xs font-mono">PROJECTOR / TEACHER ARENA</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMode(true)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono rounded border border-sky-500/30 cursor-pointer"
        >
          📱 MODE HP SISWA
        </button>
      </div>

      {gameState.status === 'LOBBY' && <SetupForm />}
      {gameState.status === 'BRACKET' && <BracketTree />}
      {gameState.status === 'IN_MATCH' && <Arena />}
      {gameState.status === 'FINISHED' && <WinnerModal />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}