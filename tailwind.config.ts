import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Heizen primary palette
        heizen: {
          DEFAULT: "#5C95A8",
          50: "#F0F5F7",
          100: "#DCE8ED",
          200: "#BCD3DB",
          300: "#93B8C5",
          400: "#6FA1B1",
          500: "#5C95A8",
          600: "#4A7C8D",
          700: "#3E6675",
          800: "#365562",
          900: "#304954",
        },
        // Neutral surface tokens
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7F8F9",
          subtle: "#FAFBFB",
        },
      },
      fontFamily: {
        sans: [
          "Axiforma",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderColor: {
        DEFAULT: "#EAECEE",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        panel: "0 4px 16px -4px rgba(16, 24, 40, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
