"use client";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AdminHeader({ title }: { title: string }): JSX.Element {
  const logout = (): void => {
    void fetch("/api/admin/logout", { method: "POST" }).then(() => {
      window.location.href = "/admin/login";
    });
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-line flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-[20px] font-bold text-ink-1">{title}</h1>

      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-[15px]">
          A
        </span>
        <span className="text-[14px] font-semibold text-ink-1">Admin</span>
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
    </header>
  );
}
