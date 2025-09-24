export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColorScheme = 'default' | 'purple' | 'blue' | 'green' | 'orange' | 'pink';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  mode: ThemeMode;
  colorScheme: ThemeColorScheme;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ThemeColorScheme;
  systemDetection: boolean;
  persistPreference: boolean;
}

export interface ThemeState extends ThemeConfig {
  currentTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ThemeColorScheme) => void;
  toggleMode: () => void;
  setSystemDetection: (enabled: boolean) => void;
  getThemeClasses: () => string;
  initialize: () => void;
}