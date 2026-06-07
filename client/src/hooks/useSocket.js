import { useEffect, useState, useCallback } from 'react';
import socket from '../lib/socket.js';

export function useSocket(event, handler) {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    socket.on(event, stableHandler);
    return () => socket.off(event, stableHandler);
  }, [event, stableHandler]);
}

export function useSocketConnection() {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Sync initial state
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return connected;
}
