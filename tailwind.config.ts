import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A2A3A',
          cream: '#F5F2EA',
          gold: '#C3A343',
          gray: '#8C8C8C',
          white: '#FFFFFF'
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        source: ['Source Sans 3', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config