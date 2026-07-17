import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--t-bg)",
        white: "var(--t-white)",
        fill: "var(--t-fill)",
        line: { DEFAULT: "var(--t-line)", strong: "var(--t-line-strong)" },
        ink: {
          1: "var(--t-ink-1)",
          2: "var(--t-ink-2)",
          3: "var(--t-ink-3)",
          nav: "var(--t-ink-nav)",
        },
        action: {
          DEFAULT: "var(--t-action)",
          ink: "var(--t-action-ink)",
          soft: "var(--t-action-soft)",
          on: "var(--t-on-action)",
        },
        verified: {
          DEFAULT: "var(--t-verified)",
          ink: "var(--t-verified-ink)",
          soft: "var(--t-verified-soft)",
        },
        danger: {
          DEFAULT: "var(--t-danger)",
          ink: "var(--t-danger-ink)",
          soft: "var(--t-danger-soft)",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)",
        xl: "var(--r-xl)", full: "var(--r-full)",
      },
      boxShadow: {
        raise: "var(--sh-raise)", float: "var(--sh-float)", sheet: "var(--sh-sheet)",
      },
      maxWidth: { content: "1200px", shell: "1440px" },
    },
  },
  plugins: [],
};

export default config;
