import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talantly — HR platforma",
  description: "Tekshirilgan yosh talantlarni toping va ishga oling.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
