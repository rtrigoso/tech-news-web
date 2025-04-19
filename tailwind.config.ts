import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        tertiary: '#D0BFFF',
        secondary: '#030f08',
        primary: '#F2F2F2'
      },
      fontSize: {
        base: '8px'
      }
    }
  }
} satisfies Config;
