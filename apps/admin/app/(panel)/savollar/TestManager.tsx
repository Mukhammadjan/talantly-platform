"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Direction, TestQuestionRow } from "@talantly/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  deleteTestQuestion,
  saveTestQuestion,
  toggleTestActive,
  type QuestionFormState,
} from "./actions";

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
  directions,
  defaultDirection,
  onClose,
}: {
  row: TestQuestionRow | null;
  directions: { value: Direction; label: string }[];
  defaultDirection: Direction;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(saveTestQuestion, {
    ...initialState,
  });

  return (
    <form
      action={formAction}
      className="card grid gap-4 border-[rgba(242,100,48,0.4)] p-5 shadow-soft"
    >
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold text-ink">
          {row ? "Savolni tahrirlash" : "Yangi savol"}
        </h3>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Yopish
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="grid gap-1">
          <span className="label-caps">Yo'nalish</span>
          <select
            name="direction"
            defaultValue={row?.direction ?? defaultDirection}
            className="input-base w-auto cursor-pointer py-2 pr-8 text-[13px]"
          >
            {directions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
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

      <div className="grid gap-2">
        <span className="label-caps">
          Variantlar (to'g'risini belgilang)
        </span>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct_index"
              value={i}
              defaultChecked={(row?.correct_index ?? 0) === i}
              className="h-4 w-4 accent-[#2fb86b]"
              title="To'g'ri javob"
            />
            <input
              type="text"
              name={`option_${i}`}
              defaultValue={row?.options[i] ?? ""}
              placeholder={`Variant ${i + 1}`}
              required
              className="input-base flex-1 py-2 text-[13px]"
            />
          </div>
        ))}
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

export function TestManager({
  questions,
  directions,
}: {
  questions: TestQuestionRow[];
  directions: { value: Direction; label: string }[];
}) {
  const [direction, setDirection] = useState<Direction>("dasturlash");
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const rows = questions.filter((q) => q.direction === direction);
  const activeCount = rows.filter((q) => q.is_active).length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5">
        {directions.map((d) => {
          const count = questions.filter(
            (q) => q.direction === d.value,
          ).length;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => {
                setDirection(d.value);
                setEditing(null);
              }}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                direction === d.value
                  ? "bg-orange text-white"
                  : "border border-line bg-surface text-ink-soft hover:border-orange hover:text-orange"
              }`}
            >
              {d.label} · {count}
            </button>
          );
        })}
      </div>

      {activeCount < 10 ? (
        <div className="rounded-card border border-[rgba(242,100,48,0.4)] bg-orange-tint p-4">
          <p className="text-[14px] font-semibold text-orange">
            Diqqat: bu yo'nalishda faol savollar {activeCount} ta — test uchun
            10 ta kerak.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-soft">
          {rows.length} ta savol, {activeCount} tasi faol
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
        <Editor
          row={null}
          directions={directions}
          defaultDirection={direction}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <div className="grid gap-3">
        {rows.length === 0 && editing !== "new" ? (
          <div className="rounded-card border border-dashed border-line p-8 text-center text-[13px] text-ink-faint">
            Bu yo'nalishda savollar hali yo'q.
          </div>
        ) : null}
        {rows.map((q) =>
          editing === q.id ? (
            <Editor
              key={q.id}
              row={q}
              directions={directions}
              defaultDirection={direction}
              onClose={() => setEditing(null)}
            />
          ) : (
            <article key={q.id} className="card p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">
                    {q.question}
                  </p>
                  <ul className="mt-2 grid gap-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`text-[13px] ${
                          i === q.correct_index
                            ? "font-semibold text-green-deep"
                            : "text-ink-soft"
                        }`}
                      >
                        {i === q.correct_index ? "✓ " : "• "}
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={toggleTestActive}>
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
                  <form action={deleteTestQuestion}>
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
