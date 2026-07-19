"use client";

import { BP } from "@/lib/bp";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Kompaniya tekshiruv belgisi tumbleri. */
export function CompanyVerifyToggle({
  companyId,
  isVerified,
}: {
  companyId: string;
  isVerified: boolean;
}): JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void fetch(`${BP}/api/admin/companies/${companyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_verified" }),
        }).then(() => {
          setBusy(false);
          router.refresh();
        });
      }}
      className={`h-9 px-3.5 rounded-full text-[13px] font-bold transition-colors disabled:opacity-50 ${
        isVerified
          ? "bg-verified-soft text-verified-ink hover:bg-verified-soft/70"
          : "bg-fill text-ink-2 hover:text-ink-1"
      }`}
    >
      {isVerified ? "✓ Tekshirilgan" : "Tasdiqlash"}
    </button>
  );
}

/** Vakansiya faol/yopiq tumbleri. */
export function VacancyStatusToggle({
  vacancyId,
  status,
}: {
  vacancyId: string;
  status: string;
}): JSX.Element {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const active = status === "faol";
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void fetch(`${BP}/api/admin/vacancies/${vacancyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: active ? "yopilgan" : "faol" }),
        }).then(() => {
          setBusy(false);
          router.refresh();
        });
      }}
      className={`h-9 px-3.5 rounded-full text-[13px] font-bold transition-colors disabled:opacity-50 ${
        active
          ? "bg-danger-soft text-danger-ink hover:bg-danger-soft/70"
          : "bg-verified-soft text-verified-ink hover:bg-verified-soft/70"
      }`}
    >
      {active ? "Yopish" : "Faollashtirish"}
    </button>
  );
}
