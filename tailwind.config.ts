import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        campus: '#E87516',
        ink: '#1C1917',
        surface: '#FFF9F5',
      },
    },
  },
  plugins: [],
};

export default config;
