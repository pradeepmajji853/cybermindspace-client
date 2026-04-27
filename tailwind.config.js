/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F6EF7',
          600: '#3451D1',
          700: '#2C3FBA',
          800: '#1E2F8A',
          900: '#162370',
          950: '#0C1545',
        },
        surface: {
          50: '#F7F8FC',
          100: '#F0F2F8',
          200: '#E4E7F0',
          300: '#CDD2E0',
          400: '#9BA3BC',
          500: '#6B7A99',
          600: '#4B5675',
          700: '#333D5A',
          800: '#1C2333',
          900: '#141926',
          950: '#0B0F1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4F6EF7 0%, #3451D1 100%)',
        'gradient-glow': 'linear-gradient(135deg, #4F6EF7 0%, #A855F7 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0B0F1A 0%, #141926 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 16px -4px rgba(79, 110, 247, 0.3)',
        'glow': '0 0 28px -6px rgba(79, 110, 247, 0.4)',
        'glow-lg': '0 0 44px -10px rgba(79, 110, 247, 0.5)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 32px -8px rgba(79, 110, 247, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.35s ease-out',
        'scale-in': 'scaleIn 0.35s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
