/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#04132b',
        surface: '#0b1c3d',
        'surface-container-low': '#12264c',
        'surface-container-high': '#1a305b',
        primary: '#3fff8b',
        'primary-container': '#1a5f33',
        'on-primary-container': '#a8ffe1',
        secondary: '#feb300',
        error: '#ff5449',
        'error-container': '#93000a',
        'on-surface': '#ffffff',
        'on-surface-variant': '#b0b5bd'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
