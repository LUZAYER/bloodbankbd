/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa2a2',
          400: '#f86f6f',
          500: '#eb3838',
          600: '#d91d1d',
          700: '#b51414',
          800: '#951414',
          900: '#7c1717',
          950: '#440707',
        },
        bloody: {
          base: '#070103',
          panel: '#110307',
          card: '#19050b',
          cardHover: '#250811',
          border: '#3d0a17',
          borderMuted: '#2b0710',
          glow: '#ff1e42',
        },
      },
    },
  },
  plugins: [],
};
