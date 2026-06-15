import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Focustown식 따뜻한 베이지/크림 톤
        cream: {
          50: "#FFFDF7",
          100: "#FBF6EA",
          200: "#F5ECD7",
          300: "#EADfBF",
        },
        sand: {
          200: "#EDE0C8",
          300: "#E0CDA9",
          400: "#CBB082",
          500: "#B5945F",
        },
        ink: {
          700: "#5C5142",
          800: "#3E372C",
          900: "#2A251D",
        },
        // 장르별 무드 액센트
        jazz: "#8A6D3B",
        citypop: "#FF6EC7",
        lofi: "#7C83FD",
        metal: "#4B4B5C",
        live: "#FF5A5F",
        brand: {
          DEFAULT: "#6C8AE4",
          dark: "#4F6FCB",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "system-ui", "sans-serif"],
        round: ["var(--font-pretendard)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(62, 55, 44, 0.18)",
        card: "0 2px 8px rgba(62, 55, 44, 0.08), 0 8px 24px -12px rgba(62,55,44,0.18)",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        bob: "bob 1.2s ease-in-out infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        pop: "pop 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
