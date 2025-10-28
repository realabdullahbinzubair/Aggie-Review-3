/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ncat-blue': {
          DEFAULT: '#004684',
          light: '#0066B3',
          dark: '#003366',
        },
        'ncat-gold': {
          DEFAULT: '#FFC72C',
          light: '#FFD659',
          dark: '#D4A017',
        },
      },
    },
  },
  plugins: [],
};
