import { Theme, ThemeColors, ThemeColorScheme } from '../types/theme';

// Color scheme definitions
const colorSchemes: Record<ThemeColorScheme, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      primary: 'rgb(99 102 241)', // indigo-500
      secondary: 'rgb(129 140 248)', // indigo-400
      accent: 'rgb(165 180 252)', // indigo-300
      background: 'rgb(249 250 251)', // gray-50 - softer than pure white
      surface: 'rgb(255 255 255)', // white - cards stand out more
      text: 'rgb(17 24 39)', // gray-900 - darker for better contrast
      textSecondary: 'rgb(55 65 81)', // gray-700 - darker secondary text
      border: 'rgb(209 213 219)', // gray-300 - more visible borders
      hover: 'rgb(243 244 246)', // gray-100 - subtle hover
      success: 'rgb(34 197 94)', // green-500
      warning: 'rgb(245 158 11)', // amber-500
      error: 'rgb(239 68 68)', // red-500
      info: 'rgb(59 130 246)', // blue-500
    },
    dark: {
      primary: 'rgb(129 140 248)', // indigo-400
      secondary: 'rgb(165 180 252)', // indigo-300
      accent: 'rgb(196 181 253)', // violet-300
      background: 'rgb(15 23 42)', // slate-900
      surface: 'rgb(30 41 59)', // slate-800
      text: 'rgb(248 250 252)', // slate-50
      textSecondary: 'rgb(148 163 184)', // slate-400
      border: 'rgb(51 65 85)', // slate-700
      hover: 'rgb(71 85 105)', // slate-600
      success: 'rgb(34 197 94)', // green-500
      warning: 'rgb(245 158 11)', // amber-500
      error: 'rgb(239 68 68)', // red-500
      info: 'rgb(59 130 246)', // blue-500
    },
  },
  purple: {
    light: {
      primary: 'rgb(147 51 234)', // violet-600
      secondary: 'rgb(168 85 247)', // violet-500
      accent: 'rgb(196 181 253)', // violet-300
      background: 'rgb(250 249 255)', // violet-25 - very light purple tint
      surface: 'rgb(255 255 255)', // pure white for cards
      text: 'rgb(17 24 39)', // gray-900 - much darker text
      textSecondary: 'rgb(55 65 81)', // gray-700 - darker secondary
      border: 'rgb(196 181 253)', // violet-300 - purple borders
      hover: 'rgb(243 232 255)', // violet-100 - light purple hover
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
    dark: {
      primary: 'rgb(168 85 247)', // violet-500
      secondary: 'rgb(196 181 253)', // violet-300
      accent: 'rgb(221 214 254)', // violet-200
      background: 'rgb(15 23 42)',
      surface: 'rgb(30 27 75)', // Custom dark violet
      text: 'rgb(248 250 252)',
      textSecondary: 'rgb(148 163 184)',
      border: 'rgb(88 28 135)', // violet-800
      hover: 'rgb(109 40 217)', // violet-700
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
  },
  blue: {
    light: {
      primary: 'rgb(37 99 235)', // blue-600
      secondary: 'rgb(59 130 246)', // blue-500
      accent: 'rgb(147 197 253)', // blue-300
      background: 'rgb(248 250 255)', // blue-25 - very light blue tint
      surface: 'rgb(255 255 255)', // pure white
      text: 'rgb(17 24 39)', // gray-900
      textSecondary: 'rgb(55 65 81)', // gray-700
      border: 'rgb(147 197 253)', // blue-300 - blue borders
      hover: 'rgb(235 245 255)', // blue-50 - light blue hover
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
    dark: {
      primary: 'rgb(59 130 246)', // blue-500
      secondary: 'rgb(96 165 250)', // blue-400
      accent: 'rgb(147 197 253)', // blue-300
      background: 'rgb(15 23 42)',
      surface: 'rgb(30 58 138)', // Custom dark blue
      text: 'rgb(248 250 252)',
      textSecondary: 'rgb(148 163 184)',
      border: 'rgb(30 64 175)', // blue-800
      hover: 'rgb(30 58 138)', // blue-900
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
  },
  green: {
    light: {
      primary: 'rgb(22 163 74)', // green-600
      secondary: 'rgb(34 197 94)', // green-500
      accent: 'rgb(134 239 172)', // green-300
      background: 'rgb(248 255 251)', // green-25 - very light green tint
      surface: 'rgb(255 255 255)', // pure white
      text: 'rgb(17 24 39)', // gray-900
      textSecondary: 'rgb(55 65 81)', // gray-700
      border: 'rgb(134 239 172)', // green-300 - green borders
      hover: 'rgb(240 253 244)', // green-50 - light green hover
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
    dark: {
      primary: 'rgb(34 197 94)', // green-500
      secondary: 'rgb(74 222 128)', // green-400
      accent: 'rgb(134 239 172)', // green-300
      background: 'rgb(15 23 42)',
      surface: 'rgb(20 83 45)', // Custom dark green
      text: 'rgb(248 250 252)',
      textSecondary: 'rgb(148 163 184)',
      border: 'rgb(22 101 52)', // green-800
      hover: 'rgb(21 128 61)', // green-700
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
  },
  orange: {
    light: {
      primary: 'rgb(234 88 12)', // orange-600
      secondary: 'rgb(249 115 22)', // orange-500
      accent: 'rgb(253 186 116)', // orange-300
      background: 'rgb(255 252 249)', // orange-25 - very light orange tint
      surface: 'rgb(255 255 255)', // pure white
      text: 'rgb(17 24 39)', // gray-900
      textSecondary: 'rgb(55 65 81)', // gray-700
      border: 'rgb(253 186 116)', // orange-300 - orange borders
      hover: 'rgb(255 247 237)', // orange-50 - light orange hover
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
    dark: {
      primary: 'rgb(249 115 22)', // orange-500
      secondary: 'rgb(251 146 60)', // orange-400
      accent: 'rgb(253 186 116)', // orange-300
      background: 'rgb(15 23 42)',
      surface: 'rgb(120 53 15)', // Custom dark orange
      text: 'rgb(248 250 252)',
      textSecondary: 'rgb(148 163 184)',
      border: 'rgb(154 52 18)', // orange-800
      hover: 'rgb(194 65 12)', // orange-700
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
  },
  pink: {
    light: {
      primary: 'rgb(219 39 119)', // pink-600
      secondary: 'rgb(236 72 153)', // pink-500
      accent: 'rgb(249 168 212)', // pink-300
      background: 'rgb(255 250 252)', // pink-25 - very light pink tint
      surface: 'rgb(255 255 255)', // pure white
      text: 'rgb(17 24 39)', // gray-900
      textSecondary: 'rgb(55 65 81)', // gray-700
      border: 'rgb(249 168 212)', // pink-300 - pink borders
      hover: 'rgb(253 242 248)', // pink-50 - light pink hover
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
    dark: {
      primary: 'rgb(236 72 153)', // pink-500
      secondary: 'rgb(244 114 182)', // pink-400
      accent: 'rgb(249 168 212)', // pink-300
      background: 'rgb(15 23 42)',
      surface: 'rgb(131 24 67)', // Custom dark pink
      text: 'rgb(248 250 252)',
      textSecondary: 'rgb(148 163 184)',
      border: 'rgb(157 23 77)', // pink-800
      hover: 'rgb(190 24 93)', // pink-700
      success: 'rgb(34 197 94)',
      warning: 'rgb(245 158 11)',
      error: 'rgb(239 68 68)',
      info: 'rgb(59 130 246)',
    },
  },
};

export const themes: Record<ThemeColorScheme, Theme> = Object.entries(colorSchemes).reduce(
  (acc, [key, colors]) => ({
    ...acc,
    [key]: {
      mode: 'system' as const,
      colorScheme: key as ThemeColorScheme,
      colors,
      animations: {
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  }),
  {} as Record<ThemeColorScheme, Theme>
);

// Utility functions
export const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const generateThemeClasses = (
  currentTheme: 'light' | 'dark',
  colorScheme: ThemeColorScheme
): string => {
  const scheme = colorSchemes[colorScheme];
  const colors = scheme[currentTheme];
  
  return [
    currentTheme,
    `theme-${colorScheme}`,
    `theme-${currentTheme}`,
  ].join(' ');
};

export const applyThemeToDocument = (
  currentTheme: 'light' | 'dark',
  colorScheme: ThemeColorScheme
): void => {
  const root = document.documentElement;
  const scheme = colorSchemes[colorScheme];
  const colors = scheme[currentTheme];

  // Apply CSS custom properties (convert rgb(r g b) to space-separated format)
  Object.entries(colors).forEach(([key, value]) => {
    // Convert 'rgb(99 102 241)' to '99 102 241' for Tailwind CSS custom properties
    const rgbValues = value.replace('rgb(', '').replace(')', '');
    root.style.setProperty(`--color-${key}`, rgbValues);
  });

  // Apply theme classes
  root.className = generateThemeClasses(currentTheme, colorScheme);
  
  // Update meta theme-color for mobile browsers
  const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (themeColorMeta) {
    themeColorMeta.content = colors.primary;
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = colors.primary;
    document.head.appendChild(meta);
  }
};