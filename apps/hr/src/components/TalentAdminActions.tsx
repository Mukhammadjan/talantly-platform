"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TalentAdminActions({
  talentId,
  isHidden,
  isBlocked,
  hasUser,
}: {
  talentId: string;
  isHidden: boolean;
  isBlocked: boolean;
  hasUser: boolean;
}): JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (action: string): Promise<void> => {
    if (busy) return;
    setBusy(true);
    await fetch(`/api/admin/talents/${talentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void act("toggle_hidden")}
        className="h-10 px-4 rounded-lg bg-fill text-ink-1 text-[13px] font-bold hover:bg-line transition-colors disabled:opacity-50"
      >
        {isHidden ? "Feed'da ko'rsatish" : "Feed'dan yashirish"}
      </button>
      <button
        type="button"
        disabled={busy || !hasUser}
        onClick={() => void act("toggle_blocked")}
        className={`h-10 px-4 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50 ${
          isBlocked
            ? "bg-verified-soft text-verified-ink hover:bg-verified-soft/70"
            : "bg-danger-soft text-danger-ink hover:bg-danger-soft/70"
        }`}
      >
        {isBlocked ? "Blokdan chiqarish" : "Bloklash"}
      </button>
    </div>
  );
}
