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
          50: '#fefdeb',
          100: '#fdfbc8',
          200: '#faf393',
          300: '#f7e754',
          400: '#f3d623',
          500: '#e5be0e',
          600: '#c59808',
          700: '#9d7009',
          800: '#80570f',
          900: '#6e4913',
          950: '#402605',
        }
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        pulseFast: 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        }
      }
    },
  },
  plugins: [],
}
