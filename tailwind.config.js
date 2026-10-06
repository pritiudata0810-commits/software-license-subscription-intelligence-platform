/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D18',
          900: '#0B192C',
          850: '#0F213A',
          800: '#142948',
          700: '#1E3A8A',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        canvas: '#F8FAFC',
        cardBg: '#FFFFFF',
        pastel: {
          mint: '#D7EFEA',
          mintHover: '#CBEBE4',
          rose: '#FDDCE5',
          roseHover: '#F9D0DC',
          lemon: '#FEF1C9',
          lemonHover: '#FDEBB2',
          lavender: '#E3DCFD',
          lavenderHover: '#DCD4FA',
          sage: '#DCEAE7',
          coral: '#FF8C68',
          violet: '#6C5CE7',
          violetHover: '#5B4BC4',
          cyan: '#62D0DF',
          cream: '#FFF9F0',
        },
      },
    },
  },
  plugins: [],
};
