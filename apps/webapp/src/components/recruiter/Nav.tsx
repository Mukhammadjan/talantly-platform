"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { NOTIFICATIONS } from "@/lib/recruiter/data";
import { useRecruiter } from "@/lib/recruiter/store";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/ish", label: "Nomzodlar", icon: "users" },
  { href: "/ish/xarita", label: "Xarita", icon: "map" },
  { href: "/ish/doskam", label: "Doskam", icon: "board" },
  { href: "/ish/koproq", label: "Ko'proq", icon: "grid" },
];

export function TopHeader({
  title,
  subtitle,
  back,
  bell = false,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  bell?: boolean;
  right?: ReactNode;
}): JSX.Element {
  const router = useRouter();
  const { isNotifRead } = useRecruiter();
  const unread = NOTIFICATIONS.some((n) => n.unread && !isNotifRead(n.id));

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur">
      {back ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-text active:bg-surface2"
          aria-label="Orqaga"
        >
          <Icon name="back" size={22} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[19px] font-semibold leading-tight text-text">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-[13px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      {right}
      {bell ? (
        <Link
          href="/ish/bildirishnoma"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text active:bg-surface2"
          aria-label="Bildirishnomalar"
        >
          <Icon name="bell" size={21} />
          {unread ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-orange" />
          ) : null}
        </Link>
      ) : null}
    </header>
  );
}

export function BottomNav(): JSX.Element {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app border-t border-line bg-surface/95 backdrop-blur">
      <div className="safe-bottom grid grid-cols-4 px-2 pt-2">
        {NAV.map((item) => {
          const active =
            item.href === "/ish"
              ? pathname === "/ish"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span
                className={active ? "text-orange" : "text-dim"}
                style={{ transition: "color .15s" }}
              >
                <Icon name={item.icon} size={24} />
              </span>
              <span
                className={`text-[11px] font-medium ${
                  active ? "text-orange" : "text-dim"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Standard scroll area that clears the fixed bottom nav. */
export function Screen({ children }: { children: ReactNode }): JSX.Element {
  return <div className="min-h-screen bg-canvas pb-28">{children}</div>;
}
