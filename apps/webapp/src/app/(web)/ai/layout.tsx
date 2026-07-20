import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI vositalar",
  description:
    "Sun'iy intellekt yordamida CV yaratish, vakansiyaga moslikni baholash va profilni kuchaytirish.",
  alternates: { canonical: "/ai" },
  openGraph: {
    title: "AI vositalar · Talantly",
    description:
      "Sun'iy intellekt yordamida CV yaratish, vakansiyaga moslikni baholash va profilni kuchaytirish.",
    url: "/ai",
  },
};

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
