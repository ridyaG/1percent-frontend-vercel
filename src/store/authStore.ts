import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  currentStreak?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(sessionStorage.getItem('currentUser') || 'null'),
  isAuthenticated: !!sessionStorage.getItem('accessToken'),

  login: (user, accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    set({ user });
  },
}));
 
