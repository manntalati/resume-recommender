/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#fefefe',
          100: '#fefefe',
          200: '#fefefe',
          300: '#fefefe',
          400: '#fefefe',
          500: '#f5f5dc',
          600: '#e8e8d0',
          700: '#d4d4c4',
          800: '#c0c0b8',
          900: '#acacac',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 