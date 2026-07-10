"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type {
  Archetype,
  PersonalityOption,
  PersonalityQuestionRow,
} from "@talantly/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  deletePersonalityQuestion,
  savePersonalityQuestion,
  togglePersonalityActive,
  type QuestionFormState,
} from "./actions";

const ARCHETYPES: { key: Archetype; label: string; short: string }[] = [
  { key: "yaratuvchi", label: "Yaratuvchi", short: "Yar" },
  { key: "tahlilchi", label: "Tahlilchi", short: "Tah" },
  { key: "yetakchi", label: "Yetakchi", short: "Yet" },
  { key: "aloqachi", label: "Aloqachi", short: "Alo" },
  { key: "ijrochi", label: "Ijrochi", short: "Ijr" },
  { key: "kashfiyotchi", label: "Kashfiyotchi", short: "Kas" },
];

interface DraftOption {
  label: string;
  weights: Record<Archetype, number>;
}

const emptyWeights = (): Record<Archetype, number> => ({
  yaratuvchi: 0,
  tahlilchi: 0,
  yetakchi: 0,
  aloqachi: 0,
  ijrochi: 0,
  kashfiyotchi: 0,
});

function toDraft(options: PersonalityOption[]): DraftOption[] {
  return options.map((o) => ({
    label: o.label,
    weights: { ...emptyWeights(), ...o.weights },
  }));
}

const initialState: QuestionFormState = { error: null, ok: false };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saqlanmoqda…" : "Saqlash"}
    </button>
  );
}

function Editor({
  row,
  onClose,
}: {
  row: PersonalityQuestionRow | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(savePersonalityQuestion, {
    ...initialState,
  });
  const [options, setOptions] = useState<DraftOption[]>(
    row ? toDraft(row.options) : [
      { label: "", weights: emptyWeights() },
      { label: "", weights: emptyWeights() },
      { label: "", weights: emptyWeights() },
      { label: "", weights: emptyWeights() },
    ],
  );

  const setLabel = (i: number, label: string) => {
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, label } : o)));
  };
  const setWeight = (i: number, key: Archetype, value: number) => {
    setOptions((prev) =>
      prev.map((o, j) =>
        j === i ? { ...o, weights: { ...o.weights, [key]: value } } : o,
      ),
    );
  };

  return (
    <form
      action={formAction}
      className="card grid gap-4 border-[rgba(242,100,48,0.4)] p-5 shadow-soft"
    >
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />

      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold text-ink">
          {row ? "Savolni tahrirlash" : "Yangi savol"}
        </h3>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Yopish
        </button>
      </div>

      <label className="grid gap-1">
        <span className="label-caps">Savol matni</span>
        <textarea
          name="question"
          defaultValue={row?.question ?? ""}
          rows={2}
          required
          className="input-base resize-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="grid gap-1">
          <span className="label-caps">Tartib</span>
          <input
            type="number"
            name="ord"
            min={1}
            defaultValue={row?.ord ?? ""}
            className="input-base w-24 py-2"
          />
        </label>
        <label className="mt-5 flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={row ? row.is_active : true}
            className="h-4 w-4 accent-[#f26430]"
          />
          Faol
        </label>
      </div>

      <div className="grid gap-3">
        <span className="label-caps">Variantlar va arxetip og'irliklari</span>
        {options.map((opt, i) => (
          <div key={i} className="rounded-[14px] border border-line p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => setLabel(i, e.target.value)}
                placeholder={`Variant ${i + 1}`}
                className="input-base flex-1 py-2 text-[13px]"
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  className="btn-ghost shrink-0 px-2.5 py-1.5 text-red"
                  onClick={() =>
                    setOptions((prev) => prev.filter((_, j) => j !== i))
                  }
                  title="Variantni o'chirish"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {ARCHETYPES.map((a) => (
                <label key={a.key} className="grid gap-0.5" title={a.label}>
                  <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                    {a.short}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={opt.weights[a.key]}
                    onChange={(e) =>
                      setWeight(i, a.key, Number(e.target.value) || 0)
                    }
                    className="input-base px-1 py-1 text-center text-[13px]"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn-ghost justify-self-start"
          onClick={() =>
            setOptions((prev) => [
              ...prev,
              { label: "", weights: emptyWeights() },
            ])
          }
        >
          + Variant qo'shish
        </button>
      </div>

      {state.error ? (
        <p className="text-[13px] font-medium text-red">{state.error}</p>
      ) : null}
      {state.ok && !state.error ? (
        <p className="text-[13px] font-medium text-green-deep">Saqlandi ✓</p>
      ) : null}
      <div>
        <SaveButton />
      </div>
    </form>
  );
}

export function PersonalityManager({
  questions,
}: {
  questions: PersonalityQuestionRow[];
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const activeCount = questions.filter((q) => q.is_active).length;

  return (
    <div className="grid gap-4">
      {activeCount < 15 ? (
        <div className="rounded-card border border-[rgba(242,100,48,0.4)] bg-orange-tint p-4">
          <p className="text-[14px] font-semibold text-orange">
            Diqqat: faol savollar {activeCount} ta — arxetip testi uchun 15 ta
            kerak.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-soft">
          {questions.length} ta savol, {activeCount} tasi faol
        </p>
        {editing === null ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setEditing("new")}
          >
            + Yangi savol
          </button>
        ) : null}
      </div>

      {editing === "new" ? (
        <Editor row={null} onClose={() => setEditing(null)} />
      ) : null}

      <div className="grid gap-3">
        {questions.map((q) =>
          editing === q.id ? (
            <Editor key={q.id} row={q} onClose={() => setEditing(null)} />
          ) : (
            <article key={q.id} className="card p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">
                    {q.ord ? `${q.ord}. ` : ""}
                    {q.question}
                  </p>
                  <ul className="mt-2 grid gap-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft"
                      >
                        <span>• {opt.label}</span>
                        {Object.entries(opt.weights).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded-full bg-cream px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint"
                          >
                            {k.slice(0, 3)} +{v}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={togglePersonalityActive}>
                    <input type="hidden" name="id" value={q.id} />
                    <input
                      type="hidden"
                      name="is_active"
                      value={String(!q.is_active)}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                        q.is_active
                          ? "bg-green-tint text-green-deep"
                          : "bg-cream text-ink-faint"
                      }`}
                      title="Faollikni almashtirish"
                    >
                      {q.is_active ? "Faol" : "O'chiq"}
                    </button>
                  </form>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5"
                    onClick={() => setEditing(q.id)}
                  >
                    Tahrirlash
                  </button>
                  <form action={deletePersonalityQuestion}>
                    <input type="hidden" name="id" value={q.id} />
                    <ConfirmButton
                      label="O'chirish"
                      confirmLabel="Rostdanmi?"
                      className="btn-ghost px-3 py-1.5 text-red"
                      armedClassName="rounded-full bg-red px-3 py-1.5 text-[13px] font-semibold text-white"
                    />
                  </form>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}
