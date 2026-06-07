import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || '/', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

export default socket;
