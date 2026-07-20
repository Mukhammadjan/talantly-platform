import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kirish",
  description:
    "Telefon raqamingiz va Telegram botdan olingan parol bilan Talantly platformasiga kiring.",
  alternates: { canonical: "/kirish" },
  openGraph: {
    title: "Kirish · Talantly",
    description:
      "Telefon raqamingiz va Telegram botdan olingan parol bilan Talantly platformasiga kiring.",
    url: "/kirish",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
