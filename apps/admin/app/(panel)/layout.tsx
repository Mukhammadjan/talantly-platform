import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
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

const NAV = [
  { href: "/dashboard", label: "Boshqaruv", icon: <IconDashboard /> },
  { href: "/talantlar", label: "Talantlar", icon: <IconUsers /> },
  { href: "/izlovchilar", label: "Izlovchilar", icon: <IconBuilding /> },
  { href: "/sorovlar", label: "So'rovlar", icon: <IconInbox /> },
  { href: "/suhbatlar", label: "Suhbatlar", icon: <IconCalendar /> },
  { href: "/moslashtirish", label: "Moslashtirish", icon: <IconMatch /> },
  { href: "/savollar", label: "Savollar", icon: <IconQuestion /> },
  { href: "/statistika", label: "Statistika", icon: <IconChart /> },
];

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );

  const account = (
    <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">
          {session.user.role === "admin" ? "Admin" : "Moderator"}
        </p>
        <p className="truncate text-[12px] text-ink-faint">{session.email}</p>
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
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </div>

      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
