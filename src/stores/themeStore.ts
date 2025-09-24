import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemeState, ThemeMode, ThemeColorScheme } from '../types/theme';
import { getSystemPreference, generateThemeClasses, applyThemeToDocument } from '../utils/themes';

const STORAGE_KEY = 'iverton-theme-preferences';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'system',
      colorScheme: 'purple', // Default to purple to match your existing design
      systemDetection: true,
      persistPreference: true,
      currentTheme: getSystemPreference(),

      // Actions
      setMode: (mode: ThemeMode) => {
        set((state) => {
          const newCurrentTheme = mode === 'system' 
            ? getSystemPreference() 
            : mode as 'light' | 'dark';
          
          applyThemeToDocument(newCurrentTheme, state.colorScheme);
          
          return {
            mode,
            currentTheme: newCurrentTheme,
          };
        });
      },

      setColorScheme: (colorScheme: ThemeColorScheme) => {
        set((state) => {
          applyThemeToDocument(state.currentTheme, colorScheme);
          return { colorScheme };
        });
      },

      toggleMode: () => {
        const { mode, currentTheme } = get();
        
        if (mode === 'system') {
          // If currently system, switch to opposite of current theme
          const newMode = currentTheme === 'light' ? 'dark' : 'light';
          get().setMode(newMode);
        } else {
          // Toggle between light and dark
          const newMode = mode === 'light' ? 'dark' : 'light';
          get().setMode(newMode);
        }
      },

      setSystemDetection: (enabled: boolean) => {
        set({ systemDetection: enabled });
        
        if (enabled && get().mode === 'system') {
          const systemTheme = getSystemPreference();
          set((state) => {
            applyThemeToDocument(systemTheme, state.colorScheme);
            return { currentTheme: systemTheme };
          });
        }
      },

      getThemeClasses: () => {
        const { currentTheme, colorScheme } = get();
        return generateThemeClasses(currentTheme, colorScheme);
      },

      initialize: () => {
        const { mode, colorScheme, systemDetection } = get();
        
        // Determine initial theme
        const initialTheme = mode === 'system' ? getSystemPreference() : mode as 'light' | 'dark';
        
        // Apply theme to document
        applyThemeToDocument(initialTheme, colorScheme);
        
        // Update state
        set({ currentTheme: initialTheme });
        
        // Set up system preference listener
        if (systemDetection && mode === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const { mode: currentMode, colorScheme: currentColorScheme } = get();
            if (currentMode === 'system') {
              const newTheme = e.matches ? 'dark' : 'light';
              applyThemeToDocument(newTheme, currentColorScheme);
              set({ currentTheme: newTheme });
            }
          };
          
          mediaQuery.addEventListener('change', handleSystemThemeChange);
          
          // Store cleanup function for potential future use
          return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        colorScheme: state.colorScheme,
        systemDetection: state.systemDetection,
        persistPreference: state.persistPreference,
      }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  useThemeStore.getState().initialize();
}