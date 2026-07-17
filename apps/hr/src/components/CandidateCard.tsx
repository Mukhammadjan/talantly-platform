"use client";

import Link from "next/link";
import type { talentView } from "@talantly/shared";
import { DIRECTION_LABEL, LEVEL_LABEL, formatSalary } from "@/lib/labels";

type Candidate = talentView.CandidateView;

export function CandidateCard({ c }: { c: Candidate }): JSX.Element {
  const initial = c.displayName.trim().charAt(0).toUpperCase() || "N";
  return (
    <Link
      href={`/nomzod/${c.id}`}
      className="group flex flex-col gap-3 rounded-lg bg-white shadow-raise p-5 transition-shadow hover:shadow-float focus-visible:shadow-float"
    >
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 shrink-0 rounded-md bg-action-soft text-action-ink grid place-items-center font-bold text-lg">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-ink-1 text-[16px] truncate">
              {c.displayName}
            </span>
            {c.verified ? (
              <span
                className="shrink-0 w-4 h-4 rounded-full bg-verified text-white grid place-items-center"
                title="Tekshirilgan"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 12.5 10 17 18.5 7.5" />
                </svg>
              </span>
            ) : null}
            {c.isDemo ? (
              <span className="shrink-0 text-[10px] font-semibold text-ink-3 bg-fill rounded px-1.5 py-0.5">
                DEMO
              </span>
            ) : null}
          </div>
          <p className="text-[13px] text-ink-2 truncate">
            {c.role} · {c.archetype}
          </p>
        </div>
        <span className="shrink-0 min-w-[44px] h-11 px-2 rounded-md bg-verified-soft text-verified-ink grid place-items-center font-bold text-[17px] tabular-nums">
          {c.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {c.skills.slice(0, 3).map((s) => (
          <span key={s} className="text-[12px] text-ink-2 bg-fill rounded px-2 py-1">
            {s}
          </span>
        ))}
        <span className="text-[12px] text-action-ink bg-action-soft rounded px-2 py-1 font-semibold">
          {LEVEL_LABEL[c.level] ?? c.level}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line text-[13px]">
        <span className="text-ink-2">
          {DIRECTION_LABEL[c.direction] ?? c.direction}
          {c.district ? ` · ${c.district}` : ""}
        </span>
        <span className="font-semibold text-ink-1">
          {c.salaryFrom ? `${formatSalary(c.salaryFrom).replace(" so'm", "")} so'mdan` : "—"}
        </span>
      </div>
    </Link>
  );
}
