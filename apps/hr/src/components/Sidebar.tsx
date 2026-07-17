"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const NAV: NavItem[] = [
  {
    href: "/nomzodlar",
    label: "Nomzodlar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 19.5a5.5 5.5 0 0 0-2-4.3" />
      </svg>
    ),
  },
  {
    href: "/vakansiyalar",
    label: "Vakansiyalar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
        <path d="M8.5 7.5V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1M3 13.5h18M10.5 13.5h3" />
      </svg>
    ),
  },
  {
    href: "/doskam",
    label: "Doskam",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <path d="M9 4.5v15M15 4.5v15" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4.5 19.5l1.3-4.4A7.5 7.5 0 1 1 20 11.5z" />
      </svg>
    ),
  },
  {
    href: "/sozlamalar",
    label: "Sozlamalar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
      </svg>
    ),
  },
];

export function Sidebar({ companyName }: { companyName: string }): JSX.Element {
  const pathname = usePathname();
  const activeHref =
    NAV.map((n) => n.href)
      .filter((h) => pathname === h || pathname.startsWith(`${h}/`))
      .sort((a, b) => b.length - a.length)[0] ?? "/nomzodlar";

  return (
    <aside className="w-[240px] shrink-0 bg-ink-1 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16">
        <img src="/brand/wordmark-light.svg" alt="Talantly" className="h-5 w-auto" />
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

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[13px] text-ink-3 truncate">{companyName}</p>
      </div>
    </aside>
  );
}
