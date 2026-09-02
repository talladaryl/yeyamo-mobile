/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Couleurs YEYAMO officielles
        yeyamo: {
          DEFAULT: '#EF4444',
          primary: '#EF4444',
          secondary: '#DC2626',
          dark: '#B91C1C',
        },
        primary: {
          DEFAULT: '#EF4444', // Utilise YEYAMO comme couleur primaire
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        accent: '#F59E0B',
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#F4F4F5',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          400: '#A1A1AA',
          600: '#52525B',
          800: '#27272A',
          900: '#18181B',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
