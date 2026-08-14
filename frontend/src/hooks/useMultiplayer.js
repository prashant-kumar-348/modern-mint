import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://modernmint-backend.onrender.com";

export function useMultiplayer(roomId, username, role, avatarId) {
  const [gameState, setGameState] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [drawnCard, setDrawnCard] = useState(null);
  const socketRef = useRef(null);
 
  const [socketId, setSocketId] = useState(null);
 
  useEffect(() => {
    if (!roomId || !username) return;
 
    socketRef.current = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
 
    socketRef.current.on('connect', () => {
      console.log('Connected to multiplayer server', socketRef.current.id);
      setSocketId(socketRef.current.id);
      socketRef.current.emit('join_room', { roomId, username, role: role || 'Founder', avatarId });
    });

    socketRef.current.on('game_state_update', (newState) => {
      setGameState(newState);
    });

    socketRef.current.on('notification', (message) => {
      setNotification({ show: true, message });
      setTimeout(() => setNotification({ show: false, message: '' }), 2000);
    });

    socketRef.current.on('mentor_card_drawn', (card) => {
      setDrawnCard(card);
    });

    socketRef.current.on('second_chance_result', (data) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('second_chance_result', { detail: data }));
      }
    });

    socketRef.current.on('initial_roll_result', (data) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('initial_roll_result', { detail: data }));
      }
    });

    socketRef.current.on('trigger_bankruptcy', (data) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger_bankruptcy', { detail: data }));
      }
    });

    socketRef.current.on('bankruptcy_cleared', () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bankruptcy_cleared'));
      }
    });

    socketRef.current.on('royalty_proposal_received', (data) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('royalty_proposal_received', { detail: data }));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, username, role, avatarId]);

  const sendAction = (actionType, payload) => {
    if (socketRef.current) {
      socketRef.current.emit(actionType, { roomId, ...payload });
    }
  };

  return { gameState, notification, sendAction, socketId, drawnCard, clearDrawnCard: () => setDrawnCard(null) };
}
