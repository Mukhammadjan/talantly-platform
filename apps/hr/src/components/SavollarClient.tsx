"use client";

import { BP } from "@/lib/bp";
import { useCallback, useEffect, useState } from "react";
import { DIRECTION_LABELS } from "@/components/admin/ui";

interface QuestionItem {
  id: string;
  direction: string;
  question: string;
  options: string[];
  correct_index: number;
  is_active: boolean;
}

const DIRECTIONS = Object.keys(DIRECTION_LABELS);

export function SavollarClient(): JSX.Element {
  const [direction, setDirection] = useState("dasturlash");
  const [items, setItems] = useState<QuestionItem[] | null>(null);
  const [editing, setEditing] = useState<Partial<QuestionItem> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback((): void => {
    setItems(null);
    void fetch(`${BP}/api/admin/questions?direction=${direction}`)
      .then((r) => r.json())
      .then((d: { items?: QuestionItem[] }) => setItems(d.items ?? []));
  }, [direction]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async (): Promise<void> => {
    if (!editing || busy) return;
    setBusy(true);
    await fetch(`${BP}/api/admin/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        direction,
        question: editing.question ?? "",
        options: editing.options ?? [],
        correctIndex: editing.correct_index ?? 0,
        isActive: editing.is_active ?? true,
      }),
    });
    setBusy(false);
    setEditing(null);
    load();
  };

  const toggleActive = async (q: QuestionItem): Promise<void> => {
    await fetch(`${BP}/api/admin/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, isActive: !q.is_active }),
    });
    load();
  };

  return (
    <section className="bg-white rounded-2xl border border-line p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <div>
          <h2 className="text-[19px] font-bold text-ink-1">Savol banki</h2>
          <p className="text-[13px] text-ink-2 mt-0.5">
            {items ? `${items.length} ta savol` : "Yuklanmoqda..."}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              question: "",
              options: ["", "", "", ""],
              correct_index: 0,
              is_active: true,
            })
          }
          className="h-11 px-5 rounded-lg bg-action text-white text-[14px] font-bold hover:bg-action/90"
        >
          + Yangi savol
        </button>
      </div>

      <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto">
        {DIRECTIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`h-11 px-4 text-[14px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
              direction === d
                ? "border-action text-action-ink"
                : "border-transparent text-ink-2 hover:text-ink-1"
            }`}
          >
            {DIRECTION_LABELS[d]}
          </button>
        ))}
      </div>

      {items === null ? (
        <p className="py-8 text-center text-[14px] text-ink-2">Yuklanmoqda...</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((q, i) => (
            <div
              key={q.id}
              className={`rounded-xl border border-line p-4 ${
                q.is_active ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-semibold text-ink-1">
                  {i + 1}. {q.question}
                </p>
                <span className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...q })}
                    className="text-[13px] font-bold text-action-ink hover:underline"
                  >
                    Tahrirlash
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleActive(q)}
                    className="text-[13px] font-bold text-ink-2 hover:underline"
                  >
                    {q.is_active ? "O'chirish" : "Yoqish"}
                  </button>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {q.options.map((o, oi) => (
                  <span
                    key={oi}
                    className={`rounded-full px-3 py-1 text-[13px] ${
                      oi === q.correct_index
                        ? "bg-verified-soft text-verified-ink font-bold"
                        : "bg-fill text-ink-2"
                    }`}
                  >
                    {oi === q.correct_index ? "✓ " : ""}
                    {o}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div
          className="fixed inset-0 z-40 bg-ink-1/40 grid place-items-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-[520px] bg-white rounded-2xl p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold text-ink-1 mb-4">
              {editing.id ? "Savolni tahrirlash" : "Yangi savol"} ·{" "}
              {DIRECTION_LABELS[direction]}
            </h3>
            <textarea
              value={editing.question ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, question: e.target.value })
              }
              placeholder="Savol matni"
              rows={2}
              className="w-full rounded-lg border border-line-strong px-3.5 py-2.5 text-[14px] text-ink-1 mb-3 resize-none focus:outline-none focus:border-action"
            />
            {(editing.options ?? []).map((o, oi) => (
              <div key={oi} className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, correct_index: oi })}
                  className={`w-9 h-9 shrink-0 rounded-full text-[14px] font-bold ${
                    editing.correct_index === oi
                      ? "bg-verified text-white"
                      : "bg-fill text-ink-2"
                  }`}
                  aria-label={`${oi + 1}-variantni to'g'ri deb belgilash`}
                >
                  {String.fromCharCode(65 + oi)}
                </button>
                <input
                  value={o}
                  onChange={(e) => {
                    const opts = [...(editing.options ?? [])];
                    opts[oi] = e.target.value;
                    setEditing({ ...editing, options: opts });
                  }}
                  placeholder={`${oi + 1}-variant`}
                  className="h-11 flex-1 rounded-lg border border-line-strong px-3.5 text-[14px] text-ink-1 focus:outline-none focus:border-action"
                />
              </div>
            ))}
            <p className="text-[12px] text-ink-2 mb-4">
              Yashil harf — to&apos;g&apos;ri javob. Ilova variantlarni har
              ko&apos;rsatishda aralashtiradi.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 px-5 rounded-full bg-fill text-ink-1 text-[14px] font-bold hover:bg-line"
              >
                Bekor
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void save()}
                className="h-11 px-5 rounded-full bg-action text-white text-[14px] font-bold hover:bg-action/90 disabled:opacity-40"
              >
                {busy ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
