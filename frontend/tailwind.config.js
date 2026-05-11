export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 24px 80px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        healthcare: {
          50: '#eef8ff',
          100: '#d9f0ff',
          200: '#b7e2ff',
          300: '#86ccff',
          400: '#4eb2ff',
          500: '#1c86ff',
          600: '#0f6aed',
          700: '#0b53c6',
          800: '#0d48a7',
          900: '#0f3d88',
        },
      },
    },
  },
  plugins: [],
}
