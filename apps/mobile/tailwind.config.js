/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        veil: {
          background: '#0F0820',
          surface: '#1A1035',
          border: '#3D2A6B',
          accent: '#8B5CF6',
          muted: '#7C7C9A',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
