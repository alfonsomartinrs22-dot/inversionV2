/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Mono"', 'monospace'],
        body: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        surface: {
          0: '#0a0b0d',
          1: '#12141a',
          2: '#1a1d26',
          3: '#232733',
        },
        accent: {
          lime: '#b8f53d',
          cyan: '#3df5e8',
          orange: '#f5923d',
          red: '#f53d5e',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#8b90a0',
          muted: '#545868',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(184, 245, 61, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(184, 245, 61, 0.6)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'pulse-glow': 'pulse_glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
