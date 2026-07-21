"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-btn px-3.5 py-2.5 text-[14px] transition-all ${
        active
          ? "bg-orange-tint font-bold text-orange-ink"
          : "font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
      }`}
    >
      <span
        className={`shrink-0 transition-colors ${
          active ? "text-orange-ink" : "text-ink-faint group-hover:text-ink-soft"
        }`}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
