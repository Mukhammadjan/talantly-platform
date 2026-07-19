"use client";

import { BP } from "@/lib/bp";
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Header({
  title,
  companyName,
}: {
  title: string;
  companyName: string;
}): JSX.Element {
  const logout = (): void => {
    void fetch(`${BP}/api/logout`, { method: "POST" }).then(() => {
      window.location.href = `${BP}/login`;
    });
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-line flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-[20px] font-bold text-ink-1">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-10 h-10 rounded-full grid place-items-center text-ink-2 hover:bg-fill"
          aria-label="Bildirishnomalar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.5 1.3 4.8 1.3 4.8H5.2S6.5 13.5 6.5 10z" />
            <path d="M10 18.5a2 2 0 0 0 4 0" />
          </svg>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-line">
          <span className="w-9 h-9 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-[15px]">
            {companyName.charAt(0).toUpperCase()}
          </span>
          <span className="text-[14px] font-semibold text-ink-1 max-w-[160px] truncate">
            {companyName}
          </span>
          <button
            type="button"
            onClick={logout}
            className="ml-1 w-9 h-9 rounded-full grid place-items-center text-ink-3 hover:bg-fill hover:text-danger"
            aria-label="Chiqish"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
              <path d="M14 8.5V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2.5M10 12h10m0 0-3-3m3 3-3 3" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
