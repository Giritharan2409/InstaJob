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
        darkBg: '#0b0f19',
        darkCard: '#111827',
        brandBlue: '#3b82f6',
        brandDark: '#1e3a8a'
      }
    },
  },
  plugins: [],
}
