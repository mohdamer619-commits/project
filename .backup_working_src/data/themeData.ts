import { ColorTheme, ThemeMode } from '../types';

export interface ThemeConfig {
  id: ColorTheme;
  name: string;
  tagline: string;
  description: string;
  chips: {
    bgLight: string;
    bgDark: string;
    primary: string;
    accent: string;
    textLight: string;
    textDark: string;
  };
  classes: {
    // Primary buttons
    primaryBtn: string;
    // Outline / secondary buttons
    secondaryBtn: string;
    // Active tabs / pills
    activeTab: string;
    // Accent text
    accentText: string;
    // Primary text
    primaryText: string;
    // Soft badge bg
    badgeBg: string;
    // Soft badge text
    badgeText: string;
    // Card border when highlighted
    cardActiveBorder: string;
    // Ring color
    ringColor: string;
    // Hero banner gradient
    heroGradient: string;
    // Hero decorative circle border
    heroBorder: string;
    // Hero subtext
    heroSubtext: string;
    // Accent highlight (gold/amber/silver)
    highlightText: string;
  };
  cssVars: {
    primary: string;
    primaryHover: string;
    accent: string;
    heroStart: string;
    heroVia: string;
    heroEnd: string;
  };
}

export const THEME_LIST: ThemeConfig[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    tagline: 'Classic Islamic Sanctuary',
    description: 'Deep Islamic emerald green, soft gold accents and elegant cream surfaces.',
    chips: {
      bgLight: '#fcfbf7',
      bgDark: '#041d16',
      primary: '#059669',
      accent: '#d97706',
      textLight: '#064e3b',
      textDark: '#6ee7b7',
    },
    classes: {
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      secondaryBtn: 'border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
      activeTab: 'bg-emerald-600 text-white shadow-sm',
      accentText: 'text-emerald-600 dark:text-emerald-400',
      primaryText: 'text-emerald-800 dark:text-emerald-200',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      cardActiveBorder: 'border-emerald-600 ring-2 ring-emerald-500/30',
      ringColor: 'ring-emerald-500',
      heroGradient: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white',
      heroBorder: 'border-emerald-500/15',
      heroSubtext: 'text-emerald-300',
      highlightText: 'text-amber-300',
    },
    cssVars: {
      primary: '#059669',
      primaryHover: '#047857',
      accent: '#f59e0b',
      heroStart: '#064e3b',
      heroVia: '#042f2e',
      heroEnd: '#022c22',
    },
  },
  {
    id: 'midnight',
    name: 'Royal Midnight',
    tagline: 'Deep Sapphire Night Sky',
    description: 'Deep navy, midnight blue and subtle silver accents.',
    chips: {
      bgLight: '#f8fafc',
      bgDark: '#0b132b',
      primary: '#2563eb',
      accent: '#38bdf8',
      textLight: '#1e3a8a',
      textDark: '#93c5fd',
    },
    classes: {
      primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondaryBtn: 'border-blue-600/40 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40',
      activeTab: 'bg-blue-600 text-white shadow-sm',
      accentText: 'text-blue-600 dark:text-blue-400',
      primaryText: 'text-blue-800 dark:text-blue-200',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
      badgeText: 'text-blue-800 dark:text-blue-300',
      cardActiveBorder: 'border-blue-600 ring-2 ring-blue-500/30',
      ringColor: 'ring-blue-500',
      heroGradient: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white',
      heroBorder: 'border-blue-500/20',
      heroSubtext: 'text-blue-300',
      highlightText: 'text-sky-300',
    },
    cssVars: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      accent: '#38bdf8',
      heroStart: '#0b132b',
      heroVia: '#172554',
      heroEnd: '#0f172a',
    },
  },
  {
    id: 'desert',
    name: 'Desert Gold',
    tagline: 'Warm Sandstone & Amber',
    description: 'Warm sand, champagne gold and dark brown.',
    chips: {
      bgLight: '#fffdf5',
      bgDark: '#1c140e',
      primary: '#d97706',
      accent: '#78350f',
      textLight: '#92400e',
      textDark: '#fcd34d',
    },
    classes: {
      primaryBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      secondaryBtn: 'border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40',
      activeTab: 'bg-amber-600 text-white shadow-sm',
      accentText: 'text-amber-600 dark:text-amber-400',
      primaryText: 'text-amber-800 dark:text-amber-200',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
      badgeText: 'text-amber-900 dark:text-amber-300',
      cardActiveBorder: 'border-amber-600 ring-2 ring-amber-500/30',
      ringColor: 'ring-amber-500',
      heroGradient: 'bg-gradient-to-br from-amber-950 via-stone-950 to-amber-900 text-white',
      heroBorder: 'border-amber-500/20',
      heroSubtext: 'text-amber-300',
      highlightText: 'text-yellow-300',
    },
    cssVars: {
      primary: '#d97706',
      primaryHover: '#b45309',
      accent: '#f59e0b',
      heroStart: '#29180f',
      heroVia: '#1c140e',
      heroEnd: '#451a03',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    tagline: 'Imperial Violet & Lavender',
    description: 'Deep plum, violet and soft lavender accents.',
    chips: {
      bgLight: '#faf5ff',
      bgDark: '#180b26',
      primary: '#9333ea',
      accent: '#c084fc',
      textLight: '#6b21a8',
      textDark: '#d8b4fe',
    },
    classes: {
      primaryBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondaryBtn: 'border-purple-600/40 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40',
      activeTab: 'bg-purple-600 text-white shadow-sm',
      accentText: 'text-purple-600 dark:text-purple-400',
      primaryText: 'text-purple-800 dark:text-purple-200',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
      badgeText: 'text-purple-800 dark:text-purple-300',
      cardActiveBorder: 'border-purple-600 ring-2 ring-purple-500/30',
      ringColor: 'ring-purple-500',
      heroGradient: 'bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 text-white',
      heroBorder: 'border-purple-500/20',
      heroSubtext: 'text-purple-300',
      highlightText: 'text-fuchsia-300',
    },
    cssVars: {
      primary: '#9333ea',
      primaryHover: '#7e22ce',
      accent: '#c084fc',
      heroStart: '#1e0a38',
      heroVia: '#140626',
      heroEnd: '#2e1065',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    tagline: 'Coastal Azure & Turquoise',
    description: 'Rich ocean blue, turquoise and cool white.',
    chips: {
      bgLight: '#f0f9ff',
      bgDark: '#041624',
      primary: '#0284c7',
      accent: '#14b8a6',
      textLight: '#0369a1',
      textDark: '#7dd3fc',
    },
    classes: {
      primaryBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
      secondaryBtn: 'border-sky-600/40 text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40',
      activeTab: 'bg-sky-600 text-white shadow-sm',
      accentText: 'text-sky-600 dark:text-sky-400',
      primaryText: 'text-sky-800 dark:text-sky-200',
      badgeBg: 'bg-sky-100 dark:bg-sky-950/80',
      badgeText: 'text-sky-800 dark:text-sky-300',
      cardActiveBorder: 'border-sky-600 ring-2 ring-sky-500/30',
      ringColor: 'ring-sky-500',
      heroGradient: 'bg-gradient-to-br from-sky-950 via-teal-950 to-slate-950 text-white',
      heroBorder: 'border-sky-500/20',
      heroSubtext: 'text-sky-300',
      highlightText: 'text-cyan-300',
    },
    cssVars: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      accent: '#14b8a6',
      heroStart: '#082f49',
      heroVia: '#041e30',
      heroEnd: '#134e4a',
    },
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    tagline: 'Soft Rose & Warm Blush',
    description: 'Soft rose, dusty pink and warm ivory.',
    chips: {
      bgLight: '#fff1f2',
      bgDark: '#260a15',
      primary: '#e11d48',
      accent: '#fb7185',
      textLight: '#be185d',
      textDark: '#fda4af',
    },
    classes: {
      primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      secondaryBtn: 'border-rose-600/40 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40',
      activeTab: 'bg-rose-600 text-white shadow-sm',
      accentText: 'text-rose-600 dark:text-rose-400',
      primaryText: 'text-rose-800 dark:text-rose-200',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
      badgeText: 'text-rose-800 dark:text-rose-300',
      cardActiveBorder: 'border-rose-600 ring-2 ring-rose-500/30',
      ringColor: 'ring-rose-500',
      heroGradient: 'bg-gradient-to-br from-rose-950 via-slate-950 to-pink-950 text-white',
      heroBorder: 'border-rose-500/20',
      heroSubtext: 'text-rose-300',
      highlightText: 'text-pink-300',
    },
    cssVars: {
      primary: '#e11d48',
      primaryHover: '#be185d',
      accent: '#fb7185',
      heroStart: '#3b0d1e',
      heroVia: '#240612',
      heroEnd: '#4c0519',
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Black',
    tagline: 'Monochrome & Burnished Gold',
    description: 'Premium black, charcoal and muted gold.',
    chips: {
      bgLight: '#f4f4f5',
      bgDark: '#09090b',
      primary: '#27272a',
      accent: '#eab308',
      textLight: '#18181b',
      textDark: '#fafafa',
    },
    classes: {
      primaryBtn: 'bg-zinc-800 hover:bg-zinc-900 text-white border border-zinc-700',
      secondaryBtn: 'border-zinc-500/40 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900',
      activeTab: 'bg-zinc-800 text-white shadow-sm border border-zinc-700',
      accentText: 'text-zinc-800 dark:text-zinc-200',
      primaryText: 'text-zinc-900 dark:text-white',
      badgeBg: 'bg-zinc-200 dark:bg-zinc-800',
      badgeText: 'text-zinc-900 dark:text-zinc-100',
      cardActiveBorder: 'border-zinc-500 ring-2 ring-zinc-400/30',
      ringColor: 'ring-zinc-500',
      heroGradient: 'bg-gradient-to-br from-zinc-950 via-neutral-950 to-stone-950 text-white',
      heroBorder: 'border-amber-400/30',
      heroSubtext: 'text-zinc-400',
      highlightText: 'text-amber-400',
    },
    cssVars: {
      primary: '#27272a',
      primaryHover: '#18181b',
      accent: '#eab308',
      heroStart: '#18181b',
      heroVia: '#09090b',
      heroEnd: '#000000',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Silver',
    tagline: 'Glacial Slate & Ice Blue',
    description: 'Cool white, silver, slate and pale blue.',
    chips: {
      bgLight: '#f8fafc',
      bgDark: '#0f172a',
      primary: '#475569',
      accent: '#38bdf8',
      textLight: '#334155',
      textDark: '#cbd5e1',
    },
    classes: {
      primaryBtn: 'bg-slate-700 hover:bg-slate-800 text-white',
      secondaryBtn: 'border-slate-500/40 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60',
      activeTab: 'bg-slate-700 text-white shadow-sm',
      accentText: 'text-slate-600 dark:text-slate-300',
      primaryText: 'text-slate-800 dark:text-slate-100',
      badgeBg: 'bg-slate-200 dark:bg-slate-800',
      badgeText: 'text-slate-800 dark:text-slate-200',
      cardActiveBorder: 'border-slate-500 ring-2 ring-slate-400/30',
      ringColor: 'ring-slate-500',
      heroGradient: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white',
      heroBorder: 'border-slate-500/20',
      heroSubtext: 'text-slate-300',
      highlightText: 'text-sky-300',
    },
    cssVars: {
      primary: '#475569',
      primaryHover: '#334155',
      accent: '#38bdf8',
      heroStart: '#1e293b',
      heroVia: '#0f172a',
      heroEnd: '#020617',
    },
  },
];

export function getThemeConfig(themeId: string): ThemeConfig {
  const normalizedId =
    themeId === 'indigo' ? 'midnight' : themeId === 'sand' ? 'desert' : themeId;
  return THEME_LIST.find((t) => t.id === normalizedId) || THEME_LIST[0];
}

export function applyThemeToDOM(themeId: ColorTheme, mode: ThemeMode): boolean {
  if (typeof document === 'undefined') return false;

  const config = getThemeConfig(themeId);
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', config.id);

  // Determine dark mode
  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // system
    isDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set CSS variables for theme
  root.style.setProperty('--theme-primary', config.cssVars.primary);
  root.style.setProperty('--theme-primary-hover', config.cssVars.primaryHover);
  root.style.setProperty('--theme-accent', config.cssVars.accent);

  return isDark;
}
