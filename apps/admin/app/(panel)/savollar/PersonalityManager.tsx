"use client";

import type { PersonalityQuestionRow } from "@talantly/shared";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  deletePersonalityQuestion,
  togglePersonalityActive,
} from "./actions";

// v2 personality_questions.options — oddiy string massiv (v1'dagi arxetip-vazn
// modeli EMAS). Bu yerda ko'rish + faollik + o'chirish; variantlarga tegilmaydi.
function optLabel(o: unknown): string {
  if (typeof o === "string") return o;
  if (o && typeof o === "object" && "label" in o) {
    return String((o as { label?: unknown }).label ?? "");
  }
  return String(o ?? "");
}

export function PersonalityManager({
  questions,
}: {
  questions: PersonalityQuestionRow[];
}) {
  return (
    <div className="grid gap-3">
      <p className="card-flat p-4 text-[13px] text-ink-soft">
        Shaxsiyat (arxetip) savollari — ko&apos;rish, faollashtirish yoki
        o&apos;chirish. Yangi savollar bot seed orqali qo&apos;shiladi.
      </p>

      {questions.length === 0 ? (
        <p className="card p-8 text-center text-[14px] text-ink-soft">
          Savol yo&apos;q.
        </p>
      ) : (
        questions.map((q, i) => {
          const opts = (q.options as unknown as unknown[]) ?? [];
          return (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[14px] font-semibold text-ink">
                  <span className="num mr-1.5 text-ink-faint">
                    {q.ord ?? i + 1}.
                  </span>
                  {q.question}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={togglePersonalityActive}>
                    <input type="hidden" name="id" value={q.id} />
                    <input
                      type="hidden"
                      name="is_active"
                      value={q.is_active ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`badge cursor-pointer ${
                        q.is_active ? "badge-green" : "badge-gray"
                      }`}
                    >
                      {q.is_active ? "Faol" : "Nofaol"}
                    </button>
                  </form>
                  <form action={deletePersonalityQuestion}>
                    <input type="hidden" name="id" value={q.id} />
                    <ConfirmButton
                      label="O'chirish"
                      confirmLabel="Aniqmi?"
                      className="text-[13px] font-semibold text-red-ink hover:underline"
                      armedClassName="btn-danger"
                    />
                  </form>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {opts.map((o, oi) => (
                  <span key={oi} className="badge badge-gray">
                    {optLabel(o)}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
