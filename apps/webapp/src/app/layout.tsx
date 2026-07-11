import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

// Self-hosted variable fonts (next/font/local) — avoids a build-time network
// fetch to Google Fonts, which is unreliable in the Vercel build environment.
const grotesk = localFont({
  src: "../fonts/SpaceGrotesk.ttf",
  weight: "400 700",
  variable: "--font-grotesk",
  display: "swap",
});

const onest = localFont({
  src: "../fonts/Onest.ttf",
  weight: "400 700",
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "talantly",
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
    <html lang="uz" className={`${grotesk.variable} ${onest.variable}`}>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className="mx-auto min-h-screen w-full max-w-app">{children}</div>
      </body>
    </html>
  );
}
