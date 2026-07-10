import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "talantly admin",
  description: "talantly admin panel",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
