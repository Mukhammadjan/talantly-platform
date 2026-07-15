import type { ReactNode } from "react";
import { Nav, type NavItem } from "@/components/Nav";

const IZLOVCHI_NAV: NavItem[] = [
  { href: "/izlovchi", label: "Nomzodlar", icon: "users" },
  { href: "/izlovchi/doskam", label: "Doskam", icon: "board" },
  { href: "/izlovchi/chat", label: "Chat", icon: "chat" },
  { href: "/izlovchi/koproq", label: "Ko'proq", icon: "grid" },
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
