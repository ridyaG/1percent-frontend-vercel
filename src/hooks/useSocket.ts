import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Notification {
  actor?: {
    displayName: string;
  };
  type: string;
}

export function useSocket() {
  const user = useAuthStore((s) => s.user);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { userId: user.id });
    });

    socket.on('notification', (notif: Notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast(`${notif.actor?.displayName || ''} ${notif.type}`, { icon: '🔔' });
    });

    return () => { socket.disconnect(); };
  }, [user?.id]);

  return socketRef;
}