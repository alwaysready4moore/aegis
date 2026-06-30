import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          black: "#0B0F14",
          silver: "#E6E8EB",
          teal: "#00D1C2",
          gray: "#6B7280",
          aqua: "#7CF7F0",
          card: "#11161D",
          border: "#1F2630",
        },
        risk: {
          high: "#F2545B",
          medium: "#F2A93B",
          low: "#6B7280",
          none: "#00D1C2",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-schibsted-grotesk)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;