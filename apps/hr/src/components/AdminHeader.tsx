"use client";

import Link from "next/link";
import { useState } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AdminHeader({
  title,
  crumb,
  pendingCount = 0,
}: {
  title: string;
  /** Breadcrumb ota bo'limi (masalan "Dashboard"). */
  crumb?: string;
  /** Bell badge — kutilayotgan ishlar soni. */
  pendingCount?: number;
}): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = (): void => {
    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
      window.location.href = "/admin/login";
    });
  };

  return (
    <header className="h-[68px] shrink-0 bg-white border-b border-line flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-[16px]">
        {crumb ? (
          <>
            <span className="font-bold text-ink-1">{crumb}</span>
            <span className="w-1 h-1 rounded-full bg-ink-3" />
            <span className="text-ink-2">{title}</span>
          </>
        ) : (
          <span className="font-bold text-ink-1 text-[19px]">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/tolovlar"
          className="relative w-11 h-11 rounded-full grid place-items-center text-ink-1 hover:bg-fill transition-colors"
          aria-label="Kutilayotgan ishlar"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" {...stroke}>
            <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.5 1.3 4.8 1.3 4.8H5.2S6.5 13.5 6.5 10z" />
            <path d="M10 18.5a2 2 0 0 0 4 0" />
          </svg>
          {pendingCount > 0 ? (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[11px] font-bold grid place-items-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          ) : null}
        </Link>

        <div className="relative pl-3 border-l border-line">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full pr-1 hover:bg-fill transition-colors py-1 pl-1"
          >
            <span className="w-10 h-10 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-[16px]">
              A
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[14px] font-bold text-ink-1">
                Administrator
              </span>
              <span className="block text-[12px] text-ink-2">Talantly</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-[52px] w-44 bg-white rounded-xl border border-line shadow-float p-1.5 z-30">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2.5 h-10 px-3 rounded-lg text-[14px] font-semibold text-danger-ink hover:bg-danger-soft transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
                  <path d="M14 8.5V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2.5M10 12h10m0 0-3-3m3 3-3 3" />
                </svg>
                Chiqish
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
