import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f5f7",
        // Orqaga moslik: eski `cream` → yangi inset surface (kulrang).
        cream: "#f1f1f4",
        surface: "#ffffff",
        "surface-2": "#f1f1f4",
        line: {
          DEFAULT: "#e3e3e9",
          strong: "#d2d2da",
        },
        ink: {
          DEFAULT: "#17171b",
          soft: "#5b5b66",
          faint: "#8e8e99",
        },
        orange: {
          DEFAULT: "#f26430",
          deep: "#d74f1f",
          ink: "#b8431a",
          tint: "#fdede6",
          light: "#f59b6d", // progress bar aksenti (orqaga moslik)
        },
        green: {
          DEFAULT: "#1f9e58",
          ink: "#157a42",
          deep: "#157a42", // orqaga moslik (eski text-green-deep)
          tint: "#e7f5ed",
        },
        red: {
          DEFAULT: "#d93a34",
          ink: "#b3241f",
          tint: "#fcebea",
        },
        gold: {
          ink: "#8a6d1f",
          tint: "#f7efd9",
        },
      },
      fontFamily: {
        sans: [
          "VK Sans Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "18px",
        btn: "14px",
        input: "12px",
      },
      boxShadow: {
        raise: "0 1px 2px rgba(23,23,27,.05), 0 0 0 1px rgba(23,23,27,.03)",
        btn: "0 6px 16px -8px rgba(242,100,48,.5)",
        float: "0 12px 32px -14px rgba(23,23,27,.22)",
        soft: "0 12px 32px -14px rgba(23,23,27,.22)",
      },
    },
  },
  plugins: [],
};

export default config;
