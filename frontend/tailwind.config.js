/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F5F0',
        cream: '#F1EAE1',
        champagne: '#E5D2B8',
        gold: {
          light: '#CEB694',
          DEFAULT: '#B89A70',
          dark: '#9B7F57',
        },
        espresso: '#241D1A',
        charcoal: '#35302D',
        rose: '#D7B6AE',
        taupe: '#A99B8E',
        status: {
          success: '#4D806A',
          warning: '#C58C43',
          error: '#B85D58',
          info: '#5B7C99',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        sans: ['Manrope', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(36, 29, 26, 0.07)',
        'luxury-hover': '0 25px 50px -12px rgba(184, 154, 112, 0.18)',
        'glass': '0 8px 32px 0 rgba(36, 29, 26, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
