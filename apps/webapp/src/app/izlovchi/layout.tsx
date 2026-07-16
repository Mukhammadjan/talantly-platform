import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/Nav";

const IZLOVCHI_NAV: NavItem[] = [
  { href: "/izlovchi", label: "Nomzodlar", icon: "users" },
  { href: "/izlovchi/koproq", label: "Ko'proq", icon: "grid" },
  { href: "/izlovchi/chat", label: "Chat", icon: "chat" },
  { href: "/izlovchi/profil", label: "Profil", icon: "user" },
];

export default function IzlovchiLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      {children}
      <Nav items={IZLOVCHI_NAV} />
    </>
  );
}
