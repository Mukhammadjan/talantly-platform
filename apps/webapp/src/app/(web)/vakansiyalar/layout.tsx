import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Vakansiyalar va amaliyot o'rinlari",
  description:
    "O'zbekistondagi ochiq amaliyot va ish o'rinlari. Yo'nalish, daraja, maosh va ish formati bo'yicha filtrlang, AI moslik foizini ko'ring.",
  alternates: { canonical: "/vakansiyalar" },
  openGraph: {
    title: "Vakansiyalar va amaliyot o'rinlari · Talantly",
    description:
      "O'zbekistondagi ochiq amaliyot va ish o'rinlari. Yo'nalish, daraja, maosh va ish formati bo'yicha filtrlang, AI moslik foizini ko'ring.",
    url: "/vakansiyalar",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
