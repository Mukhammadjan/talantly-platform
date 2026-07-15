import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page background (replaces the retired cream).
        canvas: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface2)",
        },
        orange: {
          DEFAULT: "var(--orange)",
          deep: "var(--orange-deep)",
          soft: "var(--orange-soft)",
          light: "var(--orange-light)",
          tint: "var(--orange-tint)",
        },
        green: {
          DEFAULT: "var(--green)",
          seal: "var(--green-seal)",
          soft: "var(--green-soft)",
          deep: "var(--green-deep)",
          tint: "var(--green-tint)",
        },
        red: "var(--red)",
        blue: "var(--blue)",
        // Text scale — legacy `ink*` names kept so existing markup stays valid.
        ink: {
          DEFAULT: "var(--text)",
          soft: "var(--muted)",
          faint: "var(--dim)",
        },
        text: "var(--text)",
        muted: "var(--muted)",
        dim: "var(--dim)",
        line: {
          DEFAULT: "var(--border)",
          2: "var(--border-2)",
        },
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        input: "12px",
        chip: "8px",
        pill: "99px",
        // Legacy keys kept so pre-existing screens keep compiling.
        role: "22px",
        opt: "15px",
      },
      fontFamily: {
        // VK Sans Display is the brand typeface; legacy fonts stay as fallbacks.
        sans: ["var(--font-vksans)", "var(--font-onest)", "sans-serif"],
        display: ["var(--font-vksans)", "var(--font-grotesk)", "sans-serif"],
        vksans: ["var(--font-vksans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px -22px rgba(23,23,27,.22)",
      },
      maxWidth: {
        app: "390px",
      },
    },
  },
  plugins: [],
};

export default config;
