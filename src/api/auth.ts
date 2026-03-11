import api from './client';

export const authApi = {
  register: (data: { username: string; email: string; password: string; displayName: string }) =>
    api.post('/auth/register', data).then(r => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data.data),
};
