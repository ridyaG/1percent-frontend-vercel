import api from './client';

export const usersApi = {
  getProfile: (username: string) =>
    api.get(`/users/${username}`).then(r => r.data.data),

  getLeaderboard: () =>
    api.get('/streaks/leaderboard').then(r => r.data.data),

  updateProfile: (data: Partial<{ displayName: string; bio: string }>) =>
    api.patch('/users/me', data).then(r => r.data.data),

  follow: (userId: string) =>
    api.post(`/users/${userId}/follow`),

  unfollow: (userId: string) =>
    api.delete(`/users/${userId}/follow`),

  getSuggestions: () =>
    api.get('/users/me/suggestions').then(r => r.data.data),
};
 
