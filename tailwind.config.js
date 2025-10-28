/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
             colors: {
        'ncat-blue': {
          DEFAULT: '#0066CC',
          light: '#3399FF',
          dark: '#004499',
        },
        'ncat-gold': {
          DEFAULT: '#FFCC00',
          light: '#FFD633',
          dark: '#CC9900',
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
