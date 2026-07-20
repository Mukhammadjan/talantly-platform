import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mening kabinetim",
  description:
    "Arizalaringiz, profilingiz va tekshiruv holatingiz.",
  alternates: { canonical: "/kabinet" },
  openGraph: {
    title: "Mening kabinetim · Talantly",
    description:
      "Arizalaringiz, profilingiz va tekshiruv holatingiz.",
    url: "/kabinet",
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
