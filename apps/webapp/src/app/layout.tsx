import "./globals.css";
import { OfflineGate } from "@/components/OfflineGate";
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F5F7",
};

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
      <body>
        <div className="app"><OfflineGate />
        {children}</div>
      </body>
    </html>
  );
}
