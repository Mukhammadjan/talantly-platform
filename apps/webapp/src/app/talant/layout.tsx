import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/Nav";

const TALANT_NAV: NavItem[] = [
  { href: "/talant", label: "Asosiy", icon: "home" },
  { href: "/talant/testlar", label: "Testlar", icon: "doc" },
  { href: "/talant/arizalar", label: "Arizalar", icon: "briefcase" },
  { href: "/talant/profil", label: "Profil", icon: "user" },
];

export default function TalantLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      {children}
      <Nav items={TALANT_NAV} />
    </>
  );
}
