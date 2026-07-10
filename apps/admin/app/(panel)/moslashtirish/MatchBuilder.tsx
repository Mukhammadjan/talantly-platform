"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createShareLink, type ShareLinkState } from "./actions";

export interface CompanyOption {
  id: string;
  name: string;
  directions: string[];
}

export interface TalentOption {
  id: string;
  name: string;
  headline: string | null;
  direction: string | null;
  directionLabel: string;
  levelLabel: string;
  city: string | null;
  score: number | null;
}

const initialState: ShareLinkState = { url: null, error: null };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={disabled || pending}
    >
      {pending ? "Yaratilmoqda…" : "Havola yaratish"}
    </button>
  );
}

export function MatchBuilder({
  companies,
  talents,
}: {
  companies: CompanyOption[];
  talents: TalentOption[];
}) {
  const [companyId, setCompanyId] = useState("");
  const [onlyMatching, setOnlyMatching] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, formAction] = useFormState(createShareLink, initialState);
  const [copied, setCopied] = useState(false);

  const company = companies.find((c) => c.id === companyId) ?? null;
  const visibleTalents = useMemo(() => {
    if (!company || !onlyMatching || company.directions.length === 0) {
      return talents;
    }
    return talents.filter(
      (t) => t.direction && company.directions.includes(t.direction),
    );
  }, [talents, company, onlyMatching]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <form action={formAction} className="grid gap-5">
      <div className="card grid gap-4 p-5 shadow-soft">
        <label className="grid max-w-[420px] gap-1">
          <span className="label-caps">1. Izlovchini tanlang</span>
          <select
            name="companyId"
            className="input-base cursor-pointer py-2.5 text-[14px]"
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setSelected(new Set());
            }}
          >
            <option value="">Tanlang…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {company && company.directions.length > 0 ? (
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={onlyMatching}
              onChange={(e) => setOnlyMatching(e.target.checked)}
              className="h-4 w-4 accent-[#f26430]"
            />
            Faqat mos yo'nalishdagi talantlar
          </label>
        ) : null}
      </div>

      <div className="card p-5 shadow-soft">
        <p className="label-caps mb-3">
          2. Tekshirilgan talantlarni tanlang ({selected.size} ta tanlandi)
        </p>
        {visibleTalents.length === 0 ? (
          <p className="text-[13px] text-ink-faint">
            Mos tekshirilgan talantlar topilmadi.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {visibleTalents.map((t) => {
              const checked = selected.has(t.id);
              return (
                <li key={t.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-[14px] border p-3 transition-colors ${
                      checked
                        ? "border-[rgba(242,100,48,0.5)] bg-orange-tint"
                        : "border-line hover:border-[rgba(242,100,48,0.3)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="talentIds"
                      value={t.id}
                      checked={checked}
                      onChange={() => toggle(t.id)}
                      className="mt-1 h-4 w-4 accent-[#f26430]"
                    />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-ink">
                        {t.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-soft">
                        {t.headline ?? t.directionLabel}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-ink-faint">
                        {[
                          t.directionLabel,
                          t.levelLabel,
                          t.city,
                          t.score !== null ? `${t.score} ball` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton disabled={!companyId || selected.size === 0} />
        <p className="text-[12px] text-ink-faint">
          Havola 7 kun amal qiladi. Telefon raqamlar ko'rsatilmaydi.
        </p>
      </div>

      {state.error ? (
        <p className="text-[13px] font-medium text-red">{state.error}</p>
      ) : null}
      {state.url ? (
        <div className="card flex flex-wrap items-center gap-3 p-4 shadow-soft">
          <p className="min-w-0 flex-1 break-all text-[13px] font-medium text-ink">
            {state.url}
          </p>
          <button
            type="button"
            className="btn-ghost shrink-0"
            onClick={async () => {
              await navigator.clipboard.writeText(state.url ?? "");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Nusxalandi ✓" : "Nusxalash"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
