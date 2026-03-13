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

  // Added for better modern UIs
  card?: string;
  hover?: string;
  active?: string;
  subtle?: string;
}

export const themes: Record<ThemeName, ThemeColors & {
  label: string;
  emoji: string;
  description?: string;     // optional – good for tooltips / settings preview
}> = {
  dawn: {
    label: 'Dawn',
    emoji: '🌅',
    description: 'Warm sunrise tones',

    bg: '#FFF7F0',
    surface: '#FFE8D1',
    border: '#FFCC99',

    text: '#3F2200',
    textMuted: '#8B6132',

    accent: '#FF8533',
    accentHover: '#FF9A55',
    accentText: '#FFFFFF',

    accentBg: 'rgba(255, 133, 51, 0.14)',
    accentGradient: 'linear-gradient(135deg, #FF8533 0%, #FFB07F 100%)',

    card: '#FFF0E0',
    hover: 'rgba(255, 133, 51, 0.08)',
    active: 'rgba(255, 133, 51, 0.16)',
    subtle: 'rgba(255, 133, 51, 0.06)',
  },

  morning: {
    label: 'Morning',
    emoji: '🌤️',
    description: 'Bright & optimistic',

    bg: '#FEFAF0',
    surface: '#FFF4D6',
    border: '#FFE599',

    text: '#3F2E00',
    textMuted: '#A67C00',

    accent: '#FFB733',
    accentHover: '#FFC966',
    accentText: '#3F2E00',

    accentBg: 'rgba(255, 183, 51, 0.18)',
    accentGradient: 'linear-gradient(135deg, #FFB733 0%, #FFDB99 100%)',

    card: '#FFF7E0',
    hover: 'rgba(255, 183, 51, 0.10)',
    active: 'rgba(255, 183, 51, 0.20)',
    subtle: 'rgba(255, 183, 51, 0.05)',
  },

  noon: {
    label: 'Noon',
    emoji: '☀️',
    description: 'Clean & energetic',

    bg: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',

    text: '#1E293B',
    textMuted: '#64748B',

    accent: '#FCD34D',
    accentHover: '#FDE68A',
    accentText: '#1E293B',

    accentBg: 'rgba(252, 211, 77, 0.15)',
    accentGradient: 'linear-gradient(135deg, #FCD34D 0%, #FEF08A 100%)',

    card: '#F8FAFC',
    hover: 'rgba(252, 211, 77, 0.08)',
    active: 'rgba(252, 211, 77, 0.16)',
    subtle: 'rgba(226, 232, 240, 0.6)',
  },

  afternoon: {
    label: 'Afternoon',
    emoji: '🌅',
    description: 'Warm golden hour',

    bg: '#FFF8F2',
    surface: '#FFE8DB',
    border: '#FFCCB3',

    text: '#3F1A00',
    textMuted: '#8B4F33',

    accent: '#FF6B4D',
    accentHover: '#FF8873',
    accentText: '#FFFFFF',

    accentBg: 'rgba(255, 107, 77, 0.15)',
    accentGradient: 'linear-gradient(135deg, #FF6B4D 0%, #FFA38A 100%)',

    card: '#FFF0E8',
    hover: 'rgba(255, 107, 77, 0.09)',
    active: 'rgba(255, 107, 77, 0.18)',
    subtle: 'rgba(255, 107, 77, 0.06)',
  },

  dusk: {
    label: 'Dusk',
    emoji: '🌆',
    description: 'Magical purple hour',

    bg: '#F3EEFF',
    surface: '#E6DEFF',
    border: '#D1C2FF',

    text: '#2A1F4D',
    textMuted: '#6A5FC2',

    accent: '#7C3AED',
    accentHover: '#9F7AED',
    accentText: '#FFFFFF',

    accentBg: 'rgba(124, 58, 237, 0.13)',
    accentGradient: 'linear-gradient(135deg, #7C3AED 0%, #BFA8F5 100%)',

    card: '#EDE7FF',
    hover: 'rgba(124, 58, 237, 0.10)',
    active: 'rgba(124, 58, 237, 0.20)',
    subtle: 'rgba(124, 58, 237, 0.05)',
  },

  evening: {
    label: 'Evening',
    emoji: '🌙',
    description: 'Calm & cozy',

    bg: '#F9F6F0',
    surface: '#F0E8D2',
    border: '#D9C9A3',

    text: '#2F3A1A',
    textMuted: '#6B7F4A',

    accent: '#84A938',
    accentHover: '#9DC455',
    accentText: '#1F2A0F',

    accentBg: 'rgba(132, 169, 56, 0.18)',
    accentGradient: 'linear-gradient(135deg, #84A938 0%, #B5D97A 100%)',

    card: '#F5F1E5',
    hover: 'rgba(132, 169, 56, 0.10)',
    active: 'rgba(132, 169, 56, 0.20)',
    subtle: 'rgba(132, 169, 56, 0.06)',
  },

  night: {
    label: 'Night',
    emoji: '🌃',
    description: 'Deep & focused',

    bg: '#0B0F14',
    surface: '#111111',
    border: '#1F2937',

    text: '#F1F5F9',
    textMuted: '#94A3B8',

    accent: '#FF5C00',
    accentHover: '#FB923C',
    accentText: '#FFFFFF',

    accentBg: 'rgba(249, 115, 22, 0.14)',
    accentGradient: 'linear-gradient(135deg, #F97316 0%, #FDBA74 100%)',

    card: '#000206',
    hover: 'rgba(249, 115, 22, 0.12)',
    active: 'rgba(249, 115, 22, 0.22)',
    subtle: 'rgba(55, 65, 81, 0.4)',
  },
};

// Helper to apply CSS variables
function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  const surface2 = theme.card ?? theme.surface;
  const surface3 = theme.surface;
  const secondary = theme.textMuted;
  const textSubtle = theme.textMuted;

  const vars = {
    '--color-bg': theme.bg,
    '--color-surface': theme.surface,
    '--color-surface-2': surface2,
    '--color-surface-3': surface3,
    '--color-border': theme.border,

    '--color-text': theme.text,
    '--color-text-muted': theme.textMuted,
    '--color-text-subtle': textSubtle,

    '--color-accent': theme.accent,
    '--color-accent-hover': theme.accentHover,
    '--color-accent-text': theme.accentText,

    '--color-accent-bg': theme.accentBg,
    '--gradient-brand': theme.accentGradient,
    '--gradient-surface': `linear-gradient(180deg, ${surface2} 0%, ${theme.surface} 100%)`,
    '--color-secondary': secondary,

    '--color-card': theme.card ?? theme.surface,
    '--color-hover': theme.hover ?? 'rgba(0,0,0,0.07)',
    '--color-active': theme.active ?? 'rgba(0,0,0,0.12)',
    '--color-subtle': theme.subtle ?? 'rgba(0,0,0,0.04)',
  };

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

interface ThemeStore {
  theme: ThemeName;
  setTheme: (name: ThemeName, userId?: string) => void;
  initTheme: (userId?: string) => void;
  getCurrentThemeObject: () => (typeof themes)[ThemeName];
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'night',

  setTheme: (name, userId) => {
    if (!(name in themes)) return;

    const key = userId ? `theme_${userId}` : 'theme_default';

    localStorage.setItem(key, name);
    applyTheme(themes[name]);

    set({ theme: name });
  },

  initTheme: (userId) => {
    const key = userId ? `theme_${userId}` : 'theme_default';
    const saved = localStorage.getItem(key) as ThemeName | null;

    const targetTheme = saved && saved in themes ? saved : 'night';

    applyTheme(themes[targetTheme]);
    set({ theme: targetTheme });
  },

  // Very useful when you want to show current theme name, emoji, description, etc.
  getCurrentThemeObject: () => themes[get().theme],
}));
