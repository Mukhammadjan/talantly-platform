import "./globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Talantly",
  description: "Tekshirilgan talantlar platformasi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F5F7",
};

// Root layout — konteynersiz. Mobil Mini App qobig'i (app)/layout.tsx da,
// keng desktop web qobig'i (web)/layout.tsx da.
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="uz">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
