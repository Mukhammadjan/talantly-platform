import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        surface: "var(--surface)",
        orange: {
          DEFAULT: "var(--orange)",
          deep: "var(--orange-deep)",
          light: "var(--orange-light)",
          tint: "var(--orange-tint)",
        },
        green: {
          DEFAULT: "var(--green)",
          deep: "var(--green-deep)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          faint: "var(--ink-faint)",
        },
        line: "var(--line)",
      },
      borderRadius: {
        card: "20px",
        input: "14px",
      },
      boxShadow: {
        soft: "0 18px 40px -22px rgba(120,70,30,.25)",
      },
      maxWidth: {
        app: "390px",
      },
    },
  },
  plugins: [],
};

export default config;
