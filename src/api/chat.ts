import api from './client';

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatUser;
}

export interface ConversationParticipant {
  userId: string;
  user: ChatUser;
  lastReadAt?: string | null;
}

export interface Conversation {
  id: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: DirectMessage[];
}

export const chatApi = {
  getConversations: () =>
    api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations').then(r => r.data.data),

  createOrGetConversation: (recipientId: string) =>
    api.post<{ success: boolean; data: Conversation }>('/chat/conversations', { recipientId }).then(r => r.data.data),

  getMessages: (conversationId: string) =>
    api.get<{ success: boolean; data: DirectMessage[] }>(`/chat/conversations/${conversationId}/messages`).then(r => r.data.data),

  sendMessage: (conversationId: string, content: string) =>
    api.post<{ success: boolean; data: DirectMessage }>(`/chat/conversations/${conversationId}/messages`, { content }).then(r => r.data.data),

  updateMessage: (conversationId: string, messageId: string, content: string) =>
    api.patch<{ success: boolean; data: DirectMessage }>(`/chat/conversations/${conversationId}/messages/${messageId}`, { content }).then(r => r.data.data),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`),

  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`),
};
