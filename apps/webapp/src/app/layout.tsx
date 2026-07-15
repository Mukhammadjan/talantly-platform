import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

// Self-hosted fonts (next/font/local) — avoids a build-time network fetch to
// Google Fonts, which is unreliable in the Vercel build environment.
//
// VK Sans Display is Talantly's brand typeface (the only one per the brand
// kit). Five weights: Light 300, Regular 400, Medium 500, DemiBold 600,
// Bold 700. Grotesk/Onest are kept as fallbacks for legacy CSS variables.
const vksans = localFont({
  src: [
    { path: "../fonts/VKSansDisplay-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/VKSansDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/VKSansDisplay-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/VKSansDisplay-DemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/VKSansDisplay-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-vksans",
  display: "swap",
});

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
    <html
      lang="uz"
      className={`${vksans.variable} ${grotesk.variable} ${onest.variable}`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className="app-shell mx-auto min-h-app w-full max-w-app">
          {children}
        </div>
      </body>
    </html>
  );
}
