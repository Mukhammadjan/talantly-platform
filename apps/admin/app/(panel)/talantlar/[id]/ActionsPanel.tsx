"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { forceStatus, grantSeal, resetTest, revokeSeal } from "./actions";

interface StatusOption {
  value: string;
  label: string;
}

export function ActionsPanel({
  talentId,
  status,
  hasTest,
  statusOptions,
}: {
  talentId: string;
  status: string;
  hasTest: boolean;
  statusOptions: StatusOption[];
}) {
  const [nextStatus, setNextStatus] = useState("");
  const isVerified = status === "tekshirilgan";

  return (
    <div className="grid gap-4">
      <form action={isVerified ? revokeSeal : grantSeal} className="flex">
        <input type="hidden" name="talentId" value={talentId} />
        {isVerified ? (
          <ConfirmButton
            label="Muhrni bekor qilish"
            confirmLabel="Bekor qilinsinmi?"
            className="btn-ghost w-full text-red"
            armedClassName="w-full rounded-full bg-red px-4 py-2.5 text-[13px] font-semibold text-white"
          />
        ) : (
          <ConfirmButton
            label="✓ Tekshirilgan muhri berish"
            confirmLabel="Muhr berilsinmi?"
            className="w-full rounded-full bg-green px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            armedClassName="w-full rounded-full bg-green-deep px-4 py-2.5 text-[13px] font-semibold text-white"
          />
        )}
      </form>

      {hasTest ? (
        <form action={resetTest} className="flex">
          <input type="hidden" name="talentId" value={talentId} />
          <ConfirmButton
            label="Testni qayta topshirtirish"
            confirmLabel="Test o'chirilsinmi?"
            className="btn-ghost w-full"
            armedClassName="btn-primary w-full"
          />
        </form>
      ) : null}

      <form action={forceStatus} className="grid gap-2">
        <input type="hidden" name="talentId" value={talentId} />
        <label className="grid gap-1">
          <span className="label-caps">Statusni majburiy o'zgartirish</span>
          <select
            name="status"
            className="input-base cursor-pointer py-2 text-[13px]"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
          >
            <option value="">Tanlang…</option>
            {statusOptions
              .filter((o) => o.value !== status)
              .map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
          </select>
        </label>
        {nextStatus ? (
          <ConfirmButton
            label="O'zgartirish"
            confirmLabel="Tasdiqlaysizmi?"
            className="btn-ghost w-full"
            armedClassName="btn-primary w-full"
          />
        ) : null}
      </form>
    </div>
  );
}
