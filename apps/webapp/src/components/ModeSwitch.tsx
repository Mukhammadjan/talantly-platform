"use client";

import { useRouter } from "next/navigation";
import { haptic } from "@/lib/telegram";

export function ModeSwitch({
  className = "",
}: {
  className?: string;
}): JSX.Element {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        haptic("light");
        router.push("/rol");
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition-all duration-150 active:scale-[0.97] active:bg-surface-2 ${className}`}
    >
      <span aria-hidden>⇄</span>
      Rolni almashtirish
    </button>
  );
}
