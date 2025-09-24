/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS custom properties
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-textSecondary)',
        border: 'var(--color-border)',
        hover: 'var(--color-hover)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'theme-transition': 'themeTransition var(--theme-duration, 300ms) var(--theme-easing, cubic-bezier(0.4, 0, 0.2, 1))',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 20px 5px rgba(139, 92, 246, 0.1)',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        'theme': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'theme-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.2)',
      },
    },
  },
  plugins: [
    // Custom plugin for theme utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.theme-transition': {
          transition: 'all var(--theme-duration, 300ms) var(--theme-easing, cubic-bezier(0.4, 0, 0.2, 1))',
        },
        '.theme-transition-colors': {
          transition: 'color var(--theme-duration, 300ms) var(--theme-easing, cubic-bezier(0.4, 0, 0.2, 1)), background-color var(--theme-duration, 300ms) var(--theme-easing, cubic-bezier(0.4, 0, 0.2, 1)), border-color var(--theme-duration, 300ms) var(--theme-easing, cubic-bezier(0.4, 0, 0.2, 1))',
        },
        '.glass-morphism': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
}