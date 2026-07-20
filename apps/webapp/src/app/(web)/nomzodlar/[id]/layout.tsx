import type { Metadata } from "next";
import type { ReactNode } from "react";

// Nomzod profillari — shaxsiy ma'lumot. Ro'yxat sahifasi (/nomzodlar)
// indekslanadi, individual profillar esa hech qachon.
export const metadata: Metadata = {
  title: "Nomzod profili",
  robots: { index: false, follow: false, nocache: true },
};

export default function CandidateLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
