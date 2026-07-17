"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { talentView } from "@talantly/shared";
import { CandidateCard } from "@/components/CandidateCard";
import {
  DIRECTIONS,
  LEVELS,
  SALARY_STEPS,
  WORK_FORMATS,
} from "@/lib/labels";

type Candidate = talentView.CandidateView;

interface Filters {
  direction: string | null;
  level: string | null;
  minSalary: number | null;
  workFormat: string | null;
  q: string;
  sort: "score" | "recent" | "salary";
}

const EMPTY: Filters = {
  direction: null,
  level: null,
  minSalary: null,
  workFormat: null,
  q: "",
  sort: "score",
};

const PAGE = 24;

export function NomzodlarClient(): JSX.Element {
  const [f, setF] = useState<Filters>(EMPTY);
  const [items, setItems] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (f.direction) p.set("direction", f.direction);
    if (f.level) p.set("level", f.level);
    if (f.minSalary) p.set("minSalary", String(f.minSalary));
    if (f.workFormat) p.set("workFormat", f.workFormat);
    if (f.q.trim()) p.set("q", f.q.trim());
    p.set("sort", f.sort);
    p.set("limit", String(PAGE));
    return p;
  }, [f]);

  const load = useCallback(
    async (off: number, append: boolean) => {
      setLoading(true);
      const p = new URLSearchParams(qs);
      p.set("offset", String(off));
      try {
        const res = await fetch(`/api/candidates?${p.toString()}`);
        const data = (await res.json()) as { candidates: Candidate[]; total: number };
        setTotal(data.total ?? 0);
        setItems((prev) =>
          append ? [...prev, ...(data.candidates ?? [])] : data.candidates ?? [],
        );
      } finally {
        setLoading(false);
      }
    },
    [qs],
  );

  useEffect(() => {
    setOffset(0);
    void load(0, false);
  }, [load]);

  const setFilter = (patch: Partial<Filters>): void => setF((s) => ({ ...s, ...patch }));
  const activeCount =
    (f.direction ? 1 : 0) +
    (f.level ? 1 : 0) +
    (f.minSalary ? 1 : 0) +
    (f.workFormat ? 1 : 0);

  return (
    <div className="flex gap-6 items-start">
      {/* ---- Filtr paneli ---- */}
      <aside className="w-[260px] shrink-0 sticky top-6 flex flex-col gap-5">
        <div className="rounded-lg bg-white shadow-raise p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink-1">Filtr</h2>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={() => setF({ ...EMPTY, q: f.q, sort: f.sort })}
                className="text-[13px] text-action-ink font-semibold hover:underline"
              >
                Tozalash
              </button>
            ) : null}
          </div>

          <FilterGroup label="Yo'nalish">
            <Chip active={f.direction === null} onClick={() => setFilter({ direction: null })}>
              Barchasi
            </Chip>
            {DIRECTIONS.map((d) => (
              <Chip
                key={d.value}
                active={f.direction === d.value}
                onClick={() => setFilter({ direction: d.value })}
              >
                {d.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Daraja">
            <Chip active={f.level === null} onClick={() => setFilter({ level: null })}>
              Barchasi
            </Chip>
            {LEVELS.map((l) => (
              <Chip
                key={l.value}
                active={f.level === l.value}
                onClick={() => setFilter({ level: l.value })}
              >
                {l.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Maosh">
            <Chip active={f.minSalary === null} onClick={() => setFilter({ minSalary: null })}>
              Har qanday
            </Chip>
            {SALARY_STEPS.map((s) => (
              <Chip
                key={s.value}
                active={f.minSalary === s.value}
                onClick={() => setFilter({ minSalary: s.value })}
              >
                {s.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Ish formati">
            <Chip active={f.workFormat === null} onClick={() => setFilter({ workFormat: null })}>
              Barchasi
            </Chip>
            {WORK_FORMATS.map((w) => (
              <Chip
                key={w.value}
                active={f.workFormat === w.value}
                onClick={() => setFilter({ workFormat: w.value })}
              >
                {w.label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </aside>

      {/* ---- Natijalar ---- */}
      <section className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-md bg-white shadow-[inset_0_0_0_1px_var(--t-line-strong)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-3 shrink-0">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-3.8-3.8" />
            </svg>
            <input
              value={f.q}
              onChange={(e) => setFilter({ q: e.target.value })}
              placeholder="Ism yoki kasb bo'yicha qidirish"
              className="flex-1 min-w-0 outline-none bg-transparent text-[15px] text-ink-1"
            />
          </div>
          <select
            value={f.sort}
            onChange={(e) => setFilter({ sort: e.target.value as Filters["sort"] })}
            className="h-11 px-3 rounded-md bg-white shadow-[inset_0_0_0_1px_var(--t-line-strong)] text-[14px] font-medium text-ink-1 outline-none"
          >
            <option value="score">Ball bo'yicha</option>
            <option value="salary">Maosh bo'yicha</option>
            <option value="recent">Yangi qo'shilgan</option>
          </select>
        </div>

        <p className="text-[13px] text-ink-3">
          {loading && items.length === 0 ? "Yuklanmoqda..." : `${total} ta tekshirilgan nomzod`}
        </p>

        {items.length === 0 && !loading ? (
          <div className="rounded-lg bg-white shadow-raise p-12 text-center text-ink-3">
            Bu filtrlarga mos nomzod topilmadi. Filtrlarni o'zgartirib ko'ring.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}

        {items.length < total ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                const off = offset + PAGE;
                setOffset(off);
                void load(off, true);
              }}
              className="h-11 px-6 rounded-md bg-white shadow-raise text-[14px] font-semibold text-ink-1 hover:bg-fill disabled:opacity-50"
            >
              {loading ? "Yuklanmoqda..." : "Yana ko'rsatish"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-[13px] font-medium transition-colors ${
        active
          ? "bg-action text-white"
          : "bg-fill text-ink-2 hover:bg-line"
      }`}
    >
      {children}
    </button>
  );
}
