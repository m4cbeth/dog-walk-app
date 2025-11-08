import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    daisyui({
      themes: [
        {
          light: {
            primary: "#2563eb",
            secondary: "#22c55e",
            accent: "#f97316",
            neutral: "#1f2937",
            "base-100": "#ffffff",
            "base-200": "#f4f4f5",
            "base-300": "#e4e4e7",
          },
        },
        {
          dark: {
            primary: "#60a5fa",
            secondary: "#4ade80",
            accent: "#fb923c",
            neutral: "#111827",
            "base-100": "#0f172a",
            "base-200": "#111827",
            "base-300": "#1f2937",
          },
        },
      ],
    }),
  ],
} satisfies Config;

export default config;

