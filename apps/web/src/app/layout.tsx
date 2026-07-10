import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/links";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "talantly — Tekshirilgan yosh talantlar",
    template: "%s · talantly",
  },
  description:
    "O'zbekistondagi tekshirilgan talantlar platformasi. Har bir nomzod 4 bosqichli tekshiruvdan o'tadi: xarakter testi, skill dalili, jonli suhbat va muhr.",
  keywords: [
    "talantly",
    "intern",
    "amaliyot",
    "ish",
    "talant",
    "Toshkent",
    "O'zbekiston",
  ],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: SITE_URL,
    siteName: "talantly",
    title: "talantly — Tekshirilgan yosh talantlar",
    description:
      "Har bir nomzod 4 bosqichli tekshiruvdan o'tadi. Ishlamasa — to'lamaysiz.",
  },
  twitter: {
    card: "summary_large_image",
    title: "talantly — Tekshirilgan yosh talantlar",
    description:
      "Har bir nomzod 4 bosqichli tekshiruvdan o'tadi. Ishlamasa — to'lamaysiz.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF6F0",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="uz">
      <body>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
