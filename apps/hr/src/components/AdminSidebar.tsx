"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
        <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
        <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
        <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
      </svg>
    ),
  },
  {
    href: "/admin/tolovlar",
    label: "To'lovlar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18M7 15h4" />
      </svg>
    ),
  },
  {
    href: "/admin/talantlar",
    label: "Talantlar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 19.5a5.5 5.5 0 0 0-2-4.3" />
      </svg>
    ),
  },
];

export function AdminSidebar(): JSX.Element {
  const pathname = usePathname();
  const activeHref =
    NAV.map((n) => n.href)
      .filter((h) => pathname === h || pathname.startsWith(`${h}/`))
      .sort((a, b) => b.length - a.length)[0] ?? "/admin";

  return (
    <aside className="w-[240px] shrink-0 bg-ink-1 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16">
        <img src="/brand/wordmark-light.svg" alt="Talantly" className="h-5 w-auto" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-action bg-white/10 rounded px-1.5 py-0.5">
          Admin
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-2">
        {NAV.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-11 px-3 rounded-md text-[15px] font-medium transition-colors ${
                active
                  ? "bg-action text-white"
                  : "text-ink-3 hover:bg-ink-nav hover:text-white"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/nomzodlar"
          className="flex items-center gap-3 h-11 px-3 rounded-md text-[15px] font-medium text-ink-3 hover:bg-ink-nav hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </svg>
          HR ko&apos;rinishi
        </Link>
      </div>
    </aside>
  );
}
