import type { ReactNode } from "react";
import { requirePanel } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import {
  IconBuilding,
  IconCalendar,
  IconCard,
  IconChart,
  IconDashboard,
  IconFlag,
  IconHistory,
  IconInbox,
  IconMatch,
  IconQuestion,
  IconQueue,
  IconSettings,
  IconShield,
  IconUserList,
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
  { href: "/tekshiruv", label: "Tekshiruv navbati", icon: <IconQueue /> },
  { href: "/izlovchilar", label: "Kompaniyalar", icon: <IconBuilding /> },
  { href: "/tolovlar", label: "To'lovlar", icon: <IconCard /> },
  { href: "/sorovlar", label: "So'rovlar", icon: <IconInbox /> },
  { href: "/suhbatlar", label: "Suhbatlar", icon: <IconCalendar /> },
  { href: "/shikoyatlar", label: "Shikoyatlar", icon: <IconFlag /> },
  { href: "/talantlar", label: "Talantlar", icon: <IconUsers />, adminOnly: true },
  { href: "/foydalanuvchilar", label: "Foydalanuvchilar", icon: <IconUserList />, adminOnly: true },
  { href: "/moderatorlar", label: "Moderatorlar", icon: <IconShield />, adminOnly: true },
  { href: "/moslashtirish", label: "Moslashtirish", icon: <IconMatch />, adminOnly: true },
  { href: "/savollar", label: "Savollar", icon: <IconQuestion />, adminOnly: true },
  { href: "/statistika", label: "Statistika", icon: <IconChart />, adminOnly: true },
  { href: "/sozlamalar", label: "Sozlamalar", icon: <IconSettings />, adminOnly: true },
  { href: "/audit", label: "Audit", icon: <IconHistory />, adminOnly: true },
];

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requirePanel();
  const isAdmin = user.role === "admin";
  const items = NAV.filter((n) => isAdmin || !n.adminOnly);
  const roleLabel = isAdmin ? "Administrator" : "Moderator";
  const initial = (user.phone ?? user.tg_username ?? "A").replace(/\D/g, "").slice(-2) || "A";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
      ))}
    </nav>
  );

  const account = (
    <div className="flex items-center gap-3 rounded-card border border-line bg-surface-2 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-tint text-[13px] font-bold text-orange-ink num">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{roleLabel}</p>
        <p className="truncate text-[12px] text-ink-faint">{user.phone ?? "—"}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="grid h-9 w-9 place-items-center rounded-btn text-ink-faint transition-colors hover:bg-red-tint hover:text-red-ink"
          title="Chiqish"
          aria-label="Chiqish"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
            <path d="M10 17l5-5-5-5M15 12H3" />
          </svg>
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-[256px] shrink-0 flex-col gap-5 border-r border-line bg-surface px-4 py-5 md:flex md:sticky md:top-0 md:h-screen">
        <div className="px-2">
          <Logo />
        </div>
        <p className="label-caps px-3.5">Menyu</p>
        {nav}
        {account}
      </aside>

      {/* Mobil topbar + nav */}
      <div className="sticky top-0 z-20 border-b border-line bg-surface/80 p-4 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Logo size={28} />
          <form action={signOut}>
            <button type="submit" className="btn-ghost">
              Chiqish
            </button>
          </form>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>

      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
