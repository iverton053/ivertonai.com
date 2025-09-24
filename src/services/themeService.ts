export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorScheme = 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'cyan';

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animations: boolean;
  transparency: number; // 0-100
}

export interface ThemeColors {
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    modal: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  // Border colors
  border: {
    default: string;
    focus: string;
    muted: string;
  };
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Theme specific colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

class ThemeService {
  private config: ThemeConfig;
  private listeners: Array<(theme: ThemeConfig, colors: ThemeColors) => void> = [];
  private mediaQuery: MediaQueryList;

  constructor() {
    // Load saved theme or use defaults
    this.config = this.loadThemeConfig();
    
    // Set up system theme detection
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    
    // Apply initial theme
    this.applyTheme();
  }

  private loadThemeConfig(): ThemeConfig {
    try {
      const saved = localStorage.getItem('ai-hub-theme');
      if (saved) {
        return { ...this.getDefaultConfig(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load theme config:', error);
    }
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): ThemeConfig {
    return {
      mode: 'dark',
      colorScheme: 'purple',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
      transparency: 90
    };
  }

  private saveThemeConfig(): void {
    try {
      localStorage.setItem('ai-hub-theme', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save theme config:', error);
    }
  }

  private handleSystemThemeChange(): void {
    if (this.config.mode === 'system') {
      this.applyTheme();
      this.notifyListeners();
    }
  }

  private getEffectiveMode(): 'light' | 'dark' {
    if (this.config.mode === 'system') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return this.config.mode;
  }

  private generateColors(): ThemeColors {
    const mode = this.getEffectiveMode();
    const isDark = mode === 'dark';
    
    // Base color schemes
    const colorSchemes: Record<ColorScheme, any> = {
      default: {
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
        400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
        800: '#1e293b', 900: '#0f172a'
      },
      purple: {
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
        400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed',
        800: '#6b21a8', 900: '#581c87'
      },
      blue: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
        400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
        800: '#1e40af', 900: '#1e3a8a'
      },
      green: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
        400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        800: '#166534', 900: '#14532d'
      },
      orange: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
        400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        800: '#9a3412', 900: '#7c2d12'
      },
      red: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
        400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        800: '#991b1b', 900: '#7f1d1d'
      },
      cyan: {
        50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
        400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
        800: '#155e75', 900: '#164e63'
      }
    };

    const primary = colorSchemes[this.config.colorScheme];
    const neutral = colorSchemes.default;

    return {
      bg: {
        primary: isDark ? neutral[900] : neutral[50],
        secondary: isDark ? neutral[800] : neutral[100],
        tertiary: isDark ? neutral[700] : neutral[200],
        card: isDark ? `${neutral[800]}${Math.round(this.config.transparency * 2.55).toString(16)}` : `${neutral[50]}${Math.round(this.config.transparency * 2.55).toString(16)}`,
        modal: isDark ? neutral[800] : neutral[50]
      },
      text: {
        primary: isDark ? neutral[50] : neutral[900],
        secondary: isDark ? neutral[300] : neutral[600],
        muted: isDark ? neutral[400] : neutral[500],
        accent: primary[500]
      },
      border: {
        default: isDark ? neutral[700] : neutral[300],
        focus: primary[500],
        muted: isDark ? neutral[800] : neutral[200]
      },
      status: {
        success: colorSchemes.green[500],
        warning: colorSchemes.orange[500],
        error: colorSchemes.red[500],
        info: colorSchemes.blue[500]
      },
      primary
    };
  }

  private applyTheme(): void {
    const colors = this.generateColors();
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--bg-primary', colors.bg.primary);
    root.style.setProperty('--bg-secondary', colors.bg.secondary);
    root.style.setProperty('--bg-tertiary', colors.bg.tertiary);
    root.style.setProperty('--bg-card', colors.bg.card);
    root.style.setProperty('--bg-modal', colors.bg.modal);

    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-muted', colors.text.muted);
    root.style.setProperty('--text-accent', colors.text.accent);

    root.style.setProperty('--border-default', colors.border.default);
    root.style.setProperty('--border-focus', colors.border.focus);
    root.style.setProperty('--border-muted', colors.border.muted);

    root.style.setProperty('--color-success', colors.status.success);
    root.style.setProperty('--color-warning', colors.status.warning);
    root.style.setProperty('--color-error', colors.status.error);
    root.style.setProperty('--color-info', colors.status.info);

    // Apply primary colors
    Object.entries(colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizes[this.config.fontSize]);

    // Apply compact mode
    root.style.setProperty('--spacing-unit', this.config.compactMode ? '0.75rem' : '1rem');

    // Apply animations
    root.style.setProperty('--animation-duration', this.config.animations ? '0.3s' : '0s');

    // Apply theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${this.getEffectiveMode()}`);
    document.body.classList.add(`scheme-${this.config.colorScheme}`);
    
    if (this.config.compactMode) {
      document.body.classList.add('compact');
    } else {
      document.body.classList.remove('compact');
    }
  }

  private notifyListeners(): void {
    const colors = this.generateColors();
    this.listeners.forEach(listener => {
      try {
        listener(this.config, colors);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }

  // Public API
  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  getColors(): ThemeColors {
    return this.generateColors();
  }

  updateConfig(updates: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveThemeConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setMode(mode: ThemeMode): void {
    this.updateConfig({ mode });
  }

  setColorScheme(scheme: ColorScheme): void {
    this.updateConfig({ colorScheme: scheme });
  }

  setFontSize(size: 'small' | 'medium' | 'large'): void {
    this.updateConfig({ fontSize: size });
  }

  toggleCompactMode(): void {
    this.updateConfig({ compactMode: !this.config.compactMode });
  }

  toggleAnimations(): void {
    this.updateConfig({ animations: !this.config.animations });
  }

  setTransparency(transparency: number): void {
    this.updateConfig({ transparency: Math.max(0, Math.min(100, transparency)) });
  }

  // Predefined themes
  applyPreset(preset: 'default' | 'minimal' | 'vibrant' | 'professional'): void {
    const presets: Record<string, Partial<ThemeConfig>> = {
      default: {
        colorScheme: 'purple',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        transparency: 90
      },
      minimal: {
        colorScheme: 'default',
        fontSize: 'medium',
        compactMode: true,
        animations: false,
        transparency: 95
      },
      vibrant: {
        colorScheme: 'cyan',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        transparency: 80
      },
      professional: {
        colorScheme: 'blue',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        transparency: 95
      }
    };

    this.updateConfig(presets[preset]);
  }

  // Event listeners
  onThemeChange(callback: (theme: ThemeConfig, colors: ThemeColors) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  isDark(): boolean {
    return this.getEffectiveMode() === 'dark';
  }

  isLight(): boolean {
    return this.getEffectiveMode() === 'light';
  }

  getSystemPreference(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  // Reset to defaults
  reset(): void {
    this.config = this.getDefaultConfig();
    this.saveThemeConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  // Export/Import theme
  exportTheme(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importTheme(themeJson: string): boolean {
    try {
      const imported = JSON.parse(themeJson);
      // Validate the structure
      if (typeof imported === 'object' && imported !== null) {
        this.updateConfig(imported);
        return true;
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
    return false;
  }
}

// Export singleton instance
export const themeService = new ThemeService();
export default themeService;