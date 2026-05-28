/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#03110D',
        'forest-light': '#071f17',
        'forest-mid': '#0a2a1e',
        gold: '#A38560',
        'gold-light': '#b89870',
        'gold-muted': '#8a6f4f',
        burgundy: '#390517',
        'burgundy-light': '#4d0820',
        cream: '#FAF8F3',
        'cream-dark': '#F0EDE5',
        'gray-warm': '#6B6560',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
