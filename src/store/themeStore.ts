import { create } from 'zustand';

export type ThemeName = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'evening' | 'night';

interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentBg: string;
}

export const themes: Record<ThemeName, ThemeColors & { label: string; emoji: string }> = {
  dawn: {
    label: 'Dawn', emoji: '🌅',
    bg: '#fdf3e7', surface: '#fce7c8', border: '#f0d0a0',
    text: '#3a2800', textMuted: '#8a6a40',
    accent: '#f0a04b', accentText: '#fff', accentBg: 'rgba(240,160,75,0.15)',
  },
  morning: {
    label: 'Morning', emoji: '☀️',
    bg: '#fffbf0', surface: '#fff2cc', border: '#ffe5a0',
    text: '#3a2800', textMuted: '#9a7040',
    accent: '#f4b183', accentText: '#3a2800', accentBg: 'rgba(244,177,131,0.2)',
  },
  noon: {
    label: 'Noon', emoji: '🕛',
    bg: '#f5f7f8', surface: '#ffffff', border: '#e0e0e0',
    text: '#45474b', textMuted: '#6a7070',
    accent: '#f4ce14', accentText: '#45474b', accentBg: 'rgba(244,206,20,0.2)',
  },
  afternoon: {
    label: 'Afternoon', emoji: '🌤',
    bg: '#fff8f4', surface: '#fff2eb', border: '#ffd0b0',
    text: '#3a1800', textMuted: '#805040',
    accent: '#ffdcdc', accentText: '#a03040', accentBg: 'rgba(255,180,180,0.3)',
  },
  dusk: {
    label: 'Dusk', emoji: '🌇',
    bg: '#f4eeff', surface: '#ffffff', border: '#dcd6f7',
    text: '#2a2850', textMuted: '#6060a0',
    accent: '#424874', accentText: '#fff', accentBg: 'rgba(66,72,116,0.12)',
  },
  evening: {
    label: 'Evening', emoji: '🌆',
    bg: '#f6f0d7', surface: '#eeebd0', border: '#c5d89d',
    text: '#2a3a15', textMuted: '#506040',
    accent: '#9cab84', accentText: '#2a3a15', accentBg: 'rgba(156,171,132,0.25)',
  },
  night: {
    label: 'Night', emoji: '🌌',
    bg: '#0b0f14', surface: '#111f1a', border: 'rgba(84,120,255,0.15)',
    text: '#ffffff', textMuted: '#6a90b0',
    accent: '#5478ff', accentText: '#fff', accentBg: 'rgba(84,120,255,0.15)',
  },
};

function applyTheme(name: ThemeName) {
  const t = themes[name];
  const root = document.documentElement;
  root.style.setProperty('--color-bg', t.bg);
  root.style.setProperty('--color-surface', t.surface);
  root.style.setProperty('--color-border', t.border);
  root.style.setProperty('--color-text', t.text);
  root.style.setProperty('--color-text-muted', t.textMuted);
  root.style.setProperty('--color-accent', t.accent);
  root.style.setProperty('--color-accent-text', t.accentText);
  root.style.setProperty('--color-accent-bg', t.accentBg);
}

interface ThemeStore {
  theme: ThemeName;
  setTheme: (name: ThemeName, userId?: string) => void;
  initTheme: (userId?: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'night',
  setTheme: (name, userId) => {
    const key = userId ? `theme_${userId}` : 'theme_default';
    localStorage.setItem(key, name);
    applyTheme(name);
    set({ theme: name });
  },
  initTheme: (userId) => {
    const key = userId ? `theme_${userId}` : 'theme_default';
    const saved = (localStorage.getItem(key) as ThemeName) || 'night';
    applyTheme(saved);
    set({ theme: saved });
  },
}));
