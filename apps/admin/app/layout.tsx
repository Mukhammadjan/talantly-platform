import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Talantly — Boshqaruv paneli",
  description: "Talantly admin va moderator boshqaruv paneli",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
