import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1A2F",
        "background-warm": "#0F2240",
        foreground: "#FFFFFF",
        navy: {
          DEFAULT: "#0B1A2F",
          50: "#0F2240",
          100: "#111D33",
          200: "#1A2D4D",
          300: "#243A5E",
          400: "#2E4770",
        },
        "accent-blue": "#7CB9E8",
        purple: {
          DEFAULT: "#503AA8",
          50: "#1A1535",
          100: "#251D4A",
          200: "#352B6B",
          300: "#B7A5ED",
          400: "#8370C5",
          500: "#503AA8",
          600: "#402E86",
          700: "#302365",
          800: "#201743",
          900: "#100C22",
        },
        yellow: {
          DEFAULT: "#FFEE58",
          50: "#FFFDE6",
          100: "#FFFBCC",
          200: "#FFF799",
          300: "#FFF366",
          400: "#FFEE58",
          500: "#E6D64E",
          600: "#CCBE45",
        },
        pursue: "#22C55E",
        monitor: "#F59E0B",
        avoid: "#EF4444",
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
