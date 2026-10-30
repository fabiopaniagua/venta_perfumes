/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#f6d365',
          500: '#fda085',
          600: '#d4af37',
          700: '#aa820a',
        },
        luxury: {
          900: '#0d0d11',
          800: '#16161f',
          700: '#222230',
          600: '#2e2e42',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
