import api from './client';
import type { Notification } from '../types/notification';

export const notificationsApi = {
  getAll: () =>
    api.get<{ success: boolean; data: Notification[] }>('/notifications').then(r => r.data.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),

  getUnreadCount: () =>
    api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count')
      .then(r => r.data.data.count),
};
