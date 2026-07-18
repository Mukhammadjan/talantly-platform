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
    <aside className="w-[264px] shrink-0 bg-ink-1 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-[68px]">
        <img src="/brand/wordmark-light.svg" alt="Talantly" className="h-5 w-auto" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-action bg-white/10 rounded-md px-2 py-1">
          Admin
        </span>
      </div>

      {/* Platforma kartasi — referansdagi org-selector pozitsiyasida */}
      <div className="mx-4 mb-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0">
          <img src="/brand/mark.svg" alt="" className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-bold leading-tight">
            Talantly platforma
          </span>
          <span className="block text-[12px] text-ink-3">Boshqaruv markazi</span>
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-3">
        {NAV.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 h-12 px-3.5 rounded-lg text-[15px] font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-ink-3 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full bg-action" />
              ) : null}
              <span className={`shrink-0 ${active ? "text-action" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-2">
        <Link
          href="/nomzodlar"
          className="flex items-center gap-3 h-11 px-3.5 rounded-lg text-[14px] font-medium text-ink-3 hover:bg-white/5 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </svg>
          HR ko&apos;rinishi
        </Link>
      </div>

      {/* Pastki blok — aloqa va versiya (referans uslubi) */}
      <div className="px-5 py-4 border-t border-white/10 flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-[13px] text-ink-3">
          <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
            <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          +998 99 030 73 22
        </span>
        <span className="flex items-center justify-between text-[12px] text-ink-3/70">
          <span>Powered by Talantly</span>
          <span>v2.0</span>
        </span>
      </div>
    </aside>
  );
}
