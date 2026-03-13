import { create } from 'zustand';

export type PostType =
  | 'daily_win'
  | 'milestone'
  | 'reflection'
  | 'challenge'
  | 'goal_update'
  | 'photo_progress';

interface UIState {
  sidebarOpen: boolean;
  composeOpen: boolean;
  selectedPostType: PostType;
  toggleSidebar: () => void;
  openCompose: () => void;
  closeCompose: () => void;
  setPostType: (type: PostType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  composeOpen: false,
  selectedPostType: 'daily_win',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCompose:   () => set({ composeOpen: true }),
  closeCompose:  () => set({ composeOpen: false, selectedPostType: 'daily_win' }),
  setPostType:   (type) => set({ selectedPostType: type }),
}));
