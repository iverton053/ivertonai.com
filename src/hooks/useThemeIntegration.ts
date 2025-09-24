import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

// Hook to apply theme changes to the DOM
export const useThemeIntegration = () => {
  const { settings } = useSettingsStore();
  const { dashboard } = settings;

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme mode (dark/light)
    if (dashboard.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (dashboard.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else if (dashboard.theme === 'auto') {
      // Auto mode - follow system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      };
      
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [dashboard.theme]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply accent color as CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    };

    const hsl = hexToHsl(dashboard.accentColor);
    
    // Set CSS custom properties for the accent color
    root.style.setProperty('--color-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--color-primary-rgb', `${parseInt(dashboard.accentColor.slice(1, 3), 16)}, ${parseInt(dashboard.accentColor.slice(3, 5), 16)}, ${parseInt(dashboard.accentColor.slice(5, 7), 16)}`);
    
    // Generate variations
    root.style.setProperty('--color-primary-50', `${hsl.h} ${Math.max(hsl.s - 5, 0)}% ${Math.min(hsl.l + 45, 95)}%`);
    root.style.setProperty('--color-primary-100', `${hsl.h} ${Math.max(hsl.s - 5, 0)}% ${Math.min(hsl.l + 40, 90)}%`);
    root.style.setProperty('--color-primary-200', `${hsl.h} ${Math.max(hsl.s - 5, 0)}% ${Math.min(hsl.l + 30, 85)}%`);
    root.style.setProperty('--color-primary-300', `${hsl.h} ${Math.max(hsl.s - 5, 0)}% ${Math.min(hsl.l + 20, 80)}%`);
    root.style.setProperty('--color-primary-400', `${hsl.h} ${hsl.s}% ${Math.min(hsl.l + 10, 75)}%`);
    root.style.setProperty('--color-primary-500', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--color-primary-600', `${hsl.h} ${Math.min(hsl.s + 5, 100)}% ${Math.max(hsl.l - 10, 25)}%`);
    root.style.setProperty('--color-primary-700', `${hsl.h} ${Math.min(hsl.s + 10, 100)}% ${Math.max(hsl.l - 20, 15)}%`);
    root.style.setProperty('--color-primary-800', `${hsl.h} ${Math.min(hsl.s + 15, 100)}% ${Math.max(hsl.l - 30, 10)}%`);
    root.style.setProperty('--color-primary-900', `${hsl.h} ${Math.min(hsl.s + 20, 100)}% ${Math.max(hsl.l - 40, 5)}%`);
    
  }, [dashboard.accentColor]);

  // Apply other theme preferences
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply compact mode
    if (dashboard.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply animations preference
    if (!dashboard.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
  }, [dashboard.compactMode, dashboard.animationsEnabled]);
};