import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

interface Notification {
  actor?: {
    displayName: string;
  };
  type: string;
}

interface NewMessagePayload {
  conversationId: string;
  message: {
    content: string;
    sender: {
      displayName: string;
    };
  };
}

interface MessageMutationPayload {
  conversationId: string;
}

interface ConversationDeletedPayload {
  conversationId: string;
}

let sharedSocket: Socket | null = null;
let listenersAttached = false;
let latestPathname = '';
let latestSearch = '';
let latestUserId = '';

function disconnectSharedSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
    listenersAttached = false;
  }
}

export function getSharedSocket() {
  return sharedSocket;
}

export function useSocket() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    latestPathname = location.pathname;
    latestSearch = location.search;
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!userId) {
      latestUserId = '';
      disconnectSharedSocket();
      socketRef.current = null;
      return;
    }

    latestUserId = userId;

    if (!sharedSocket) {
      sharedSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001');
    }

    socketRef.current = sharedSocket;

    if (!listenersAttached) {
      sharedSocket.on('connect', () => {
        if (latestUserId) {
          sharedSocket?.emit('join_room', { userId: latestUserId });
        }
      });

      sharedSocket.on('notification', (notif: Notification) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        if (notif.type !== 'message') {
          toast(`${notif.actor?.displayName || ''} ${notif.type}`, { icon: '🔔' });
        }
      });

      sharedSocket.on('new_message', ({ conversationId, message }: NewMessagePayload) => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });

        const activeConversationId = new URLSearchParams(latestSearch).get('conversationId');
        const isViewingConversation = latestPathname === '/chat' && activeConversationId === conversationId;

        if (!isViewingConversation) {
          toast(`${message.sender.displayName}: ${message.content.slice(0, 40)}`, { icon: '💬' });
        }
      });

      sharedSocket.on('message_updated', ({ conversationId }: MessageMutationPayload) => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });

      sharedSocket.on('message_deleted', ({ conversationId }: MessageMutationPayload) => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });

      sharedSocket.on('conversation_deleted', ({ conversationId }: ConversationDeletedPayload) => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.removeQueries({ queryKey: ['messages', conversationId] });
      });

      listenersAttached = true;
    }

    if (sharedSocket.connected) {
      sharedSocket.emit('join_room', { userId });
    }

    return undefined;
  }, [queryClient, userId]);

  return socketRef;
}
