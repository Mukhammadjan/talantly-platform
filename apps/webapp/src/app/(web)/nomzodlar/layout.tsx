import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tekshirilgan nomzodlar",
  description:
    "Bilim testi va jonli suhbatdan o'tgan yosh mutaxassislar. Ish beruvchilar uchun tayyor nomzodlar bazasi.",
  alternates: { canonical: "/nomzodlar" },
  openGraph: {
    title: "Tekshirilgan nomzodlar · Talantly",
    description:
      "Bilim testi va jonli suhbatdan o'tgan yosh mutaxassislar. Ish beruvchilar uchun tayyor nomzodlar bazasi.",
    url: "/nomzodlar",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
