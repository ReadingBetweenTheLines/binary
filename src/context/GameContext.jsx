import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../services/firebase';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [roomCode, setRoomCode] = useState('CLASH1');
  
  // Persist selected team in browser storage for auto-reconnect
  const [myTeam, setMyTeamState] = useState(() => {
    return localStorage.getItem('binary_clash_team') || null;
  });

  const setMyTeam = (teamName) => {
    if (teamName) {
      localStorage.setItem('binary_clash_team', teamName);
    } else {
      localStorage.removeItem('binary_clash_team');
    }
    setMyTeamState(teamName);
  };

  const [gameState, setGameState] = useState({
    status: 'LOBBY',
    teamCount: 4,
    teams: ['KELOMPOK 1', 'KELOMPOK 2', 'KELOMPOK 3', 'KELOMPOK 4'],
    matches: {},
    activeMatch: null
  });

  // Real-time Firebase Sync
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setGameState(data);
    });
    return () => unsubscribe();
  }, [roomCode]);

  const updateRoomState = async (newState) => {
    try {
      await set(ref(db, `rooms/${roomCode}`), newState);
    } catch (err) {
      console.error("Firebase Update Error:", err);
    }
  };

  return (
    <GameContext.Provider value={{ roomCode, setRoomCode, myTeam, setMyTeam, gameState, updateRoomState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}