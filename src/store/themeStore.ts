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
    bg: '#FFF4E6',
    surface: '#FFE4C7',
    border: '#FFC98B',
    text: '#3A2200',
    textMuted: '#8A5A2B',
    accent: '#FF8A3D',
    accentText: '#FFFFFF',
    accentBg: 'rgba(255,138,61,0.18)',
  },

  morning: {
    label: 'Morning', emoji: '☀️',
    bg: '#FFF9E6',
    surface: '#FFF0B3',
    border: '#FFD966',
    text: '#3A2A00',
    textMuted: '#9C6B00',
    accent: '#FFB347',
    accentText: '#3A2200',
    accentBg: 'rgba(255,179,71,0.22)',
  },

  noon: {
    label: 'Noon', emoji: '🕛',
    bg: '#F3F6FA',
    surface: '#FFFFFF',
    border: '#D6DEE6',
    text: '#2F3440',
    textMuted: '#6C7480',
    accent: '#FFD60A',
    accentText: '#2F3440',
    accentBg: 'rgba(255,214,10,0.22)',
  },

  afternoon: {
    label: 'Afternoon', emoji: '🌤',
    bg: '#FFF4EE',
    surface: '#FFE5D8',
    border: '#FFB38A',
    text: '#3A1200',
    textMuted: '#8A4A2A',
    accent: '#FF7A59',
    accentText: '#FFFFFF',
    accentBg: 'rgba(255,122,89,0.20)',
  },

  dusk: {
    label: 'Dusk', emoji: '🌇',
    bg: '#F1E9FF',
    surface: '#E4D9FF',
    border: '#C8B7FF',
    text: '#2B2450',
    textMuted: '#6B63A6',
    accent: '#6C63FF',
    accentText: '#FFFFFF',
    accentBg: 'rgba(108,99,255,0.18)',
  },

  evening: {
    label: 'Evening', emoji: '🌆',
    bg: '#F7F3E6',
    surface: '#EDE4C8',
    border: '#CDBE8B',
    text: '#2F3A14',
    textMuted: '#6B7B44',
    accent: '#8FB339',
    accentText: '#1E2A0C',
    accentBg: 'rgba(143,179,57,0.25)',
  },

  night: {
    label: 'Night', emoji: '🌌',
    bg: '#0A0F1F',
    surface: '#111A33',
    border: 'rgba(120,140,255,0.25)',
    text: '#F1F5FF',
    textMuted: '#8FA4FF',
    accent: '#5B7CFF',
    accentText: '#FFFFFF',
    accentBg: 'rgba(91,124,255,0.20)',
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
