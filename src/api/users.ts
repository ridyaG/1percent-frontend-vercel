import api from './client';
import type { User } from '../types/user';

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  websiteUrl?: string;
  location?: string;
  goalStatement?: string;
  focusAreas?: string[];
  isPrivate?: boolean;
}

export const usersApi = {
  getProfile: (username: string) =>
    api.get<{ success: boolean; data: User }>(`/users/${username}`).then(r => r.data.data),

  updateProfile: (data: UpdateProfilePayload) =>
    api.patch<{ success: boolean; data: User }>('/users/me', data).then(r => r.data.data),

  getUserPosts: (userId: string) =>
    api.get(`/users/${userId}/posts`).then(r => r.data.data),

  getFollowers: (userId: string) =>
    api.get(`/users/${userId}/followers`).then(r => r.data.data),

  getFollowing: (userId: string) =>
    api.get(`/users/${userId}/following`).then(r => r.data.data),

  follow: (userId: string) =>
    api.post(`/users/${userId}/follow`),

  unfollow: (userId: string) =>
    api.delete(`/users/${userId}/follow`),

  getSuggestions: () =>
    api.get<{ success: boolean; data: User[] }>('/users/me/suggestions').then(r => r.data.data),

  getLeaderboard: () =>
    api.get<{ success: boolean; data: User[] }>('/users/me/suggestions').then(r => r.data.data),
};
