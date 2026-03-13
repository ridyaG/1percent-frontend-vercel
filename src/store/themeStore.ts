import { create } from 'zustand';

export type ThemeName =
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'dusk'
  | 'evening'
  | 'night';

interface ThemeColors {
  bg: string;
  surface: string;
  border: string;

  text: string;
  textMuted: string;

  accent: string;
  accentHover: string;
  accentText: string;

  accentBg: string;
  accentGradient: string;
}

export const themes: Record<
  ThemeName,
  ThemeColors & { label: string; emoji: string }
> = {
  dawn: {
    label: 'Dawn',
    emoji: '🌅',

    bg: '#FFF4E6',
    surface: '#FFE4C7',
    border: '#FFC98B',

    text: '#3A2200',
    textMuted: '#8A5A2B',

    accent: '#FF8A3D',
    accentHover: '#FF9B52',
    accentText: '#FFFFFF',

    accentBg: 'rgba(255,138,61,0.18)',
    accentGradient:
      'linear-gradient(135deg, #FF8A3D, color-mix(in srgb, #FF8A3D 70%, white))',
  },

  morning: {
    label: 'Morning',
    emoji: '☀️',

    bg: '#FFF9E6',
    surface: '#FFF0B3',
    border: '#FFD966',

    text: '#3A2A00',
    textMuted: '#9C6B00',

    accent: '#FFB347',
    accentHover: '#FFC266',
    accentText: '#3A2200',

    accentBg: 'rgba(255,179,71,0.22)',
    accentGradient:
      'linear-gradient(135deg, #FFB347, color-mix(in srgb, #FFB347 70%, white))',
  },

  noon: {
    label: 'Noon',
    emoji: '🕛',

    bg: '#F3F6FA',
    surface: '#FFFFFF',
    border: '#D6DEE6',

    text: '#2F3440',
    textMuted: '#6C7480',

    accent: '#FFD60A',
    accentHover: '#FFE34A',
    accentText: '#2F3440',

    accentBg: 'rgba(255,214,10,0.22)',
    accentGradient:
      'linear-gradient(135deg, #FFD60A, color-mix(in srgb, #FFD60A 70%, white))',
  },

  afternoon: {
    label: 'Afternoon',
    emoji: '🌤',

    bg: '#FFF4EE',
    surface: '#FFE5D8',
    border: '#FFB38A',

    text: '#3A1200',
    textMuted: '#8A4A2A',

    accent: '#FF7A59',
    accentHover: '#FF9075',
    accentText: '#FFFFFF',

    accentBg: 'rgba(255,122,89,0.20)',
    accentGradient:
      'linear-gradient(135deg, #FF7A59, color-mix(in srgb, #FF7A59 70%, white))',
  },

  dusk: {
    label: 'Dusk',
    emoji: '🌇',

    bg: '#F1E9FF',
    surface: '#E4D9FF',
    border: '#C8B7FF',

    text: '#2B2450',
    textMuted: '#6B63A6',

    accent: '#6C63FF',
    accentHover: '#837BFF',
    accentText: '#FFFFFF',

    accentBg: 'rgba(108,99,255,0.18)',
    accentGradient:
      'linear-gradient(135deg, #6C63FF, color-mix(in srgb, #6C63FF 70%, white))',
  },

  evening: {
    label: 'Evening',
    emoji: '🌆',

    bg: '#F7F3E6',
    surface: '#EDE4C8',
    border: '#CDBE8B',

    text: '#2F3A14',
    textMuted: '#6B7B44',

    accent: '#8FB339',
    accentHover: '#A3C953',
    accentText: '#1E2A0C',

    accentBg: 'rgba(143,179,57,0.25)',
    accentGradient:
      'linear-gradient(135deg, #8FB339, color-mix(in srgb, #8FB339 70%, white))',
  },

  night: {
    label: 'Night',
    emoji: '🌌',

    bg: '#03141C',
    surface: '#0F1113',
    border: '#24282C',

    text: '#F1F5FF',
    textMuted: '#7C8593',

    accent: '#FF6A00',
    accentHover: '#FF7A1F',
    accentText: '#FFFFFF',

    accentBg: 'rgba(255,106,0,0.15)',
    accentGradient:
      'linear-gradient(135deg, #FF6A00, color-mix(in srgb, #FF6A00 70%, white))',
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
  root.style.setProperty('--color-accent-hover', t.accentHover);
  root.style.setProperty('--color-accent-text', t.accentText);

  root.style.setProperty('--color-accent-bg', t.accentBg);
  root.style.setProperty('--color-accent-gradient', t.accentGradient);
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
