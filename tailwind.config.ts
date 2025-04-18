import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0E4125',
        secondary: '#D0BFFF',
        tertiary: '#B2C9FF',
        fore: '#F2F2F2',
        back: '#171717'
      },
      fontSize: {
        base: '8px'
      }
    }
  }
} satisfies Config;
