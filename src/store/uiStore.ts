import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  composeOpen: boolean;
  selectedPostType: 'daily_win' | 'milestone' | 'reflection' | 'challenge';
  toggleSidebar: () => void;
  openCompose: () => void;
  closeCompose: () => void;
  setPostType: (type: UIState['selectedPostType']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  composeOpen: false,
  selectedPostType: 'daily_win',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCompose: () => set({ composeOpen: true }),
  closeCompose: () => set({ composeOpen: false, selectedPostType: 'daily_win' }),
  setPostType: (type) => set({ selectedPostType: type }),
}));