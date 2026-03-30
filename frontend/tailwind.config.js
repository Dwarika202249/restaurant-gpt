/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          950: '#431407',
        },
        'surface-light': '#ffffff',
        'surface-dark': '#0f172a',
        'surface-card-light': '#ffffff',
        'surface-card-dark': '#1e293b',
      },
      boxShadow: {
        'glow-orange': '0 0 15px -3px rgba(249, 115, 22, 0.4)',
        'glow-orange-lg': '0 0 25px -5px rgba(249, 115, 22, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
