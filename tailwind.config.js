/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ncat-blue': {
          DEFAULT: '#003366',
          light: '#004684',
          dark: '#002244',
        },
        'ncat-gold': {
          DEFAULT: '#FFD200',
          light: '#FFE55C',
          dark: '#D4A017',
        },
        'ncat-green': {
          DEFAULT: '#228B22',
          light: '#32CD32',
          dark: '#006400',
        },
      },
    },
  },
  plugins: [],
};
