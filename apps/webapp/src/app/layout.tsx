import "./globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://talantly.uz"),
  title: {
    default: "Talantly — O'zbekistondagi tekshirilgan amaliyot platformasi",
    template: "%s · Talantly",
  },
  description:
    "Tajribasiz yoshlar uchun amaliyot va ish. Har bir talant bilim testi va " +
    "jonli suhbatdan o'tadi — kompaniyalar tekshirilgan nomzodni oladi.",
  applicationName: "Talantly",
  keywords: [
    "amaliyot",
    "vakansiya",
    "ish",
    "intern",
    "Toshkent",
    "O'zbekiston",
    "talant",
    "ish beruvchi",
  ],
  authors: [{ name: "Talantly" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Talantly",
    locale: "uz_UZ",
    url: "/",
    title: "Talantly — tekshirilgan talantlar platformasi",
    description:
      "Bilim testi va jonli suhbatdan o'tgan yosh mutaxassislar. " +
      "Ish beruvchi tayyor nomzodni oladi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talantly — tekshirilgan talantlar platformasi",
    description:
      "Bilim testi va jonli suhbatdan o'tgan yosh mutaxassislar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
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
