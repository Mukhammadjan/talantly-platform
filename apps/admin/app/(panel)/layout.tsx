import type { ReactNode } from "react";
import { requirePanel } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import {
  IconBuilding,
  IconCalendar,
  IconChart,
  IconDashboard,
  IconInbox,
  IconMatch,
  IconQuestion,
  IconUsers,
} from "@/components/icons";
import { signOut } from "@/app/login/actions";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

// Rol-asosli navigatsiya. Moderator adminOnly elementlarni UMUMAN ko'rmaydi;
// haqiqiy himoya middleware (403) + har action'da requireRole/requirePanel.
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Boshqaruv", icon: <IconDashboard />, adminOnly: true },
  { href: "/talantlar", label: "Talantlar", icon: <IconUsers /> },
  { href: "/izlovchilar", label: "Kompaniyalar", icon: <IconBuilding /> },
  { href: "/sorovlar", label: "So'rovlar", icon: <IconInbox /> },
  { href: "/suhbatlar", label: "Suhbatlar", icon: <IconCalendar /> },
  { href: "/moslashtirish", label: "Moslashtirish", icon: <IconMatch />, adminOnly: true },
  { href: "/savollar", label: "Savollar", icon: <IconQuestion />, adminOnly: true },
  { href: "/statistika", label: "Statistika", icon: <IconChart />, adminOnly: true },
];

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requirePanel();
  const isAdmin = user.role === "admin";
  const items = NAV.filter((n) => isAdmin || !n.adminOnly);
  const roleLabel = isAdmin ? "Admin" : "Moderator";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
      ))}
    </nav>
  );

  const account = (
    <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">{roleLabel}</p>
        <p className="truncate text-[12px] text-ink-faint">
          {user.phone ?? user.tg_username ?? "—"}
        </p>
      </div>
      <form action={signOut}>
        <button type="submit" className="btn-ghost shrink-0">
          Chiqish
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col gap-6 border-r border-line bg-surface p-5 md:flex md:sticky md:top-0 md:h-screen">
        <Logo />
        {nav}
        {account}
      </aside>

      <div className="border-b border-line bg-surface p-4 md:hidden">
        <div className="flex items-center justify-between">
          <Logo size={28} />
          <form action={signOut}>
            <button type="submit" className="btn-ghost">
              Chiqish
            </button>
          </form>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>

      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
