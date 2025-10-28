/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
         colors: {
        'aggie-blue': '#0033a0',
        'aggie-gold': '#ffd200',
        'aggie-green': '#2a9d8f'
      },
      },
    },
  },
  plugins: [],
};
