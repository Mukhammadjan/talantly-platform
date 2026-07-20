import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tekshirilgan kompaniyalar",
  description:
    "Talantly orqali xodim izlayotgan kompaniyalar: faoliyat turi, shahar, ochiq vakansiyalar soni va tekshiruv holati.",
  alternates: { canonical: "/kompaniyalar" },
  openGraph: {
    title: "Tekshirilgan kompaniyalar · Talantly",
    description:
      "Talantly orqali xodim izlayotgan kompaniyalar: faoliyat turi, shahar, ochiq vakansiyalar soni va tekshiruv holati.",
    url: "/kompaniyalar",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
