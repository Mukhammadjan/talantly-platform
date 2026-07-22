"use client";

import { useFormState, useFormStatus } from "react-dom";
import { assignModerator, type AssignState } from "./actions";

const INIT: AssignState = { ok: false, error: null, note: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "…" : "Tayinlash"}
    </button>
  );
}

export function AssignModerator() {
  const [state, action] = useFormState(assignModerator, INIT);

  return (
    <div className="card p-5">
      <h2 className="section-title">Moderator tayinlash</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Telefon raqami bo&apos;yicha mavjud foydalanuvchini moderator qiling.
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          name="phone"
          type="tel"
          required
          placeholder="+998 90 123 45 67"
          className="input-base w-auto flex-1"
        />
        <Submit />
      </form>
      {state.error ? (
        <p className="mt-2 text-[13px] font-semibold text-red-ink">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="mt-2 text-[13px] font-semibold text-green-ink">
          Moderator tayinlandi ✓
          {state.note ? (
            <span className="block font-normal text-ink-soft">{state.note}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
