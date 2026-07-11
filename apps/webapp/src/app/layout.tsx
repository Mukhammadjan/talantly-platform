import type { Metadata, Viewport } from "next";
import { Onest, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
