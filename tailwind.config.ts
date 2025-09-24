import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 this must include tsx files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
