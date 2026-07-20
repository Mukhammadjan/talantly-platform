import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kompaniya kabineti",
  description:
    "Kompaniya profili, vakansiyalar va arizalarni boshqarish.",
  alternates: { canonical: "/kompaniyam" },
  openGraph: {
    title: "Kompaniya kabineti · Talantly",
    description:
      "Kompaniya profili, vakansiyalar va arizalarni boshqarish.",
    url: "/kompaniyam",
  },
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
