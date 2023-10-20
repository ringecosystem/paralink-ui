import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#FF0083",
        component: "#242A2E",
        "app-black": "#1A1D1F",
      },
      spacing: {
        small: "0.3125rem", // 5px
        middle: "0.625rem", // 10px
        large: "0.9375rem", // 15px
      },
      screens: {
        xl: "1200px",
        "2xl": "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
