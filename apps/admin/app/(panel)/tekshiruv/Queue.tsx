"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveTalent, rejectTalent } from "./actions";
import { REJECT_LABELS, type RejectReason } from "./reasons";

export interface Candidate {
  id: string;
  name: string;
  direction: string | null;
  directionLabel: string;
  levelLabel: string | null;
  city: string | null;
  headline: string | null;
  freeText: string | null;
  portfolio: string | null;
  status: string;
  statusLabel: string;
  createdAt: string;
  score: number | null;
  cvSummary: string | null;
  aiVerdict: string | null;
  interviewRating: number | null;
}

const DIRECTIONS = [
  ["dasturlash", "Dasturlash"],
  ["dizayn", "Dizayn"],
  ["marketing", "Marketing"],
  ["sotuv", "Sotuv"],
  ["data", "Data"],
] as const;

function waited(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return "bugun";
  if (d === 1) return "1 kun";
  return `${d} kun`;
}

export function Queue({ initial }: { initial: Candidate[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Candidate[]>(initial);
  const [selId, setSelId] = useState<string | null>(initial[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [dir, setDir] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState<RejectReason>("test_yiqildi");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (c) =>
        (!dir || c.direction === dir) &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  }, [items, query, dir]);

  const selIndex = filtered.findIndex((c) => c.id === selId);
  const selected = selIndex >= 0 ? filtered[selIndex] : null;

  const move = (delta: number): void => {
    if (filtered.length === 0) return;
    const next = Math.min(
      Math.max((selIndex < 0 ? 0 : selIndex) + delta, 0),
      filtered.length - 1,
    );
    setSelId(filtered[next].id);
  };

  const afterDecision = (id: string): void => {
    const idx = filtered.findIndex((c) => c.id === id);
    const nextId =
      filtered[idx + 1]?.id ?? filtered[idx - 1]?.id ?? null;
    setItems((prev) => prev.filter((c) => c.id !== id));
    setSelId(nextId);
    router.refresh();
  };

  const doApprove = (id: string): void => {
    startTransition(async () => {
      const r = await approveTalent(id);
      if (r.ok) afterDecision(id);
    });
  };

  const submitReject = (): void => {
    if (!selected) return;
    const id = selected.id;
    startTransition(async () => {
      const r = await rejectTalent(id, reason, note);
      if (r.ok) {
        setRejectOpen(false);
        setNote("");
        setReason("test_yiqildi");
        afterDecision(id);
      }
    });
  };

  // Bulk tanlash (checkbox) → ommaviy tasdiqlash.
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggleCheck = (id: string): void => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const bulkApprove = (): void => {
    const ids = [...checked];
    if (ids.length === 0) return;
    startTransition(async () => {
      for (const id of ids) {
        await approveTalent(id);
      }
      setItems((prev) => prev.filter((c) => !ids.includes(c.id)));
      setChecked(new Set());
      setSelId(null);
      router.refresh();
    });
  };

  // Hotkeys: J/K, A, R, Esc, /
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Escape") {
        if (rejectOpen) setRejectOpen(false);
        else if (typing) (e.target as HTMLElement).blur();
        else setSelId(null);
        return;
      }
      if (typing || rejectOpen) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        move(1);
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "a" || e.key === "A") {
        if (selected) doApprove(selected.id);
      } else if (e.key === "r" || e.key === "R") {
        if (selected) setRejectOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtered, selIndex, selected, rejectOpen]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:h-[calc(100vh-96px)]">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Tekshiruv navbati</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            {filtered.length} ta nomzod ·{" "}
            <span className="text-ink-faint">
              tugmalar: J/K yurish · A tasdiq · R rad · / qidiruv
            </span>
          </p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* CHAP: navbat */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism bo'yicha qidirish  ( / )"
              className="input-base"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDir(null)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                !dir ? "bg-orange-tint text-orange-ink" : "bg-surface text-ink-soft hover:bg-surface-2"
              }`}
            >
              Barchasi
            </button>
            {DIRECTIONS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDir(dir === k ? null : k)}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                  dir === k ? "bg-orange-tint text-orange-ink" : "bg-surface text-ink-soft hover:bg-surface-2"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {checked.size > 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-btn bg-ink px-4 py-2.5">
              <span className="text-[13px] font-semibold text-white">
                <span className="num">{checked.size}</span> tanlandi
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChecked(new Set())}
                  className="text-[13px] font-semibold text-white/70 hover:text-white"
                >
                  Bekor
                </button>
                <button
                  type="button"
                  onClick={bulkApprove}
                  disabled={pending}
                  className="rounded-btn bg-green px-3 py-1 text-[13px] font-bold text-white disabled:opacity-50"
                >
                  Tasdiqlash
                </button>
              </span>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="card grid place-items-center gap-1 p-10 text-center">
                <p className="text-[14px] font-semibold text-ink">
                  Navbat bo&apos;sh
                </p>
                <p className="text-[12px] text-ink-soft">
                  Hammasi ko&apos;rib chiqildi 🎉
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const active = c.id === selId;
                const isChecked = checked.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 rounded-card border p-3 transition-all ${
                      active
                        ? "border-orange bg-orange-tint/50 shadow-raise"
                        : isChecked
                          ? "border-orange-ink/40 bg-orange-tint/30"
                          : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(c.id)}
                      aria-label={`${c.name} tanlash`}
                      className="h-4 w-4 shrink-0 accent-orange"
                    />
                    <button
                      type="button"
                      onClick={() => setSelId(c.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-bold text-ink-soft">
                        {c.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">
                          {c.name}
                        </span>
                        <span className="block truncate text-[12px] text-ink-faint">
                          {c.directionLabel} · {waited(c.createdAt)}
                        </span>
                      </span>
                      {c.score != null ? (
                        <span className="num shrink-0 text-[13px] font-bold text-ink">
                          {c.score}
                        </span>
                      ) : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* O'NG: side-panel */}
        <div className="min-h-0 overflow-y-auto">
          {!selected ? (
            <div className="card grid h-full place-items-center p-10 text-center">
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  Nomzodni tanlang
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Ro&apos;yxatdan tanlang yoki J/K bilan yuring.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-bold text-ink">
                    {selected.name}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {selected.directionLabel}
                    {selected.levelLabel ? ` · ${selected.levelLabel}` : ""}
                    {selected.city ? ` · ${selected.city}` : ""}
                  </p>
                </div>
                <span className="badge badge-orange shrink-0">
                  {selected.statusLabel}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat label="Test bali" value={selected.score != null ? String(selected.score) : "—"} />
                <Stat label="Suhbat" value={selected.interviewRating != null ? `${selected.interviewRating}/5` : "—"} />
                <Stat label="Kutish" value={waited(selected.createdAt)} />
              </div>

              {selected.cvSummary ? (
                <Block title="AI CV xulosasi">{selected.cvSummary}</Block>
              ) : null}
              {selected.aiVerdict ? (
                <Block title="AI baho">{selected.aiVerdict}</Block>
              ) : null}
              {selected.headline ? (
                <Block title="Sarlavha">{selected.headline}</Block>
              ) : null}
              {selected.freeText ? (
                <Block title="O'zi haqida">{selected.freeText}</Block>
              ) : null}
              {selected.portfolio ? (
                <a
                  href={selected.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-[13px] font-semibold text-orange-ink hover:underline"
                >
                  Portfolio →
                </a>
              ) : null}

              <div className="mt-6 flex gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => doApprove(selected.id)}
                  className="btn-primary flex-1"
                  style={{ background: "var(--green)" }}
                >
                  Tasdiqlash <span className="opacity-70">(A)</span>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setRejectOpen(true)}
                  className="btn-danger flex-1"
                >
                  Rad etish <span className="opacity-70">(R)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rad sabab modali */}
      {rejectOpen && selected ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setRejectOpen(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-card border border-line bg-surface p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold text-ink">Rad etish sababi</h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              <b>{selected.name}</b> — sabab majburiy.
            </p>
            <div className="mt-4 grid gap-2">
              {(Object.keys(REJECT_LABELS) as RejectReason[]).map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-3 rounded-input border p-3 text-[14px] transition-colors ${
                    reason === r
                      ? "border-orange bg-orange-tint/50 font-semibold text-ink"
                      : "border-line text-ink-soft hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-orange"
                  />
                  {REJECT_LABELS[r]}
                </label>
              ))}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Izoh (ixtiyoriy)"
                className="input-base resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setRejectOpen(false)}
              >
                Bekor
              </button>
              <button
                type="button"
                disabled={pending}
                className="btn-danger"
                onClick={submitReject}
              >
                Rad etish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input bg-surface-2 p-3 text-center">
      <p className="num text-[18px] font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="label-caps mb-1.5">{title}</p>
      <p className="whitespace-pre-wrap rounded-input bg-surface-2 p-3 text-[13px] leading-relaxed text-ink-soft">
        {children}
      </p>
    </div>
  );
}
