"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSlot, type SlotFormState } from "./actions";

const initialState: SlotFormState = { error: null, ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Qo'shilmoqda…" : "Slot qo'shish"}
    </button>
  );
}

export function SlotForm() {
  const [state, formAction] = useFormState(createSlot, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1">
        <span className="label-caps">Sana va vaqt (Toshkent)</span>
        <input
          type="datetime-local"
          name="starts_at"
          required
          step={1800}
          className="input-base py-2.5 text-[14px]"
        />
      </label>
      <p className="text-[12px] text-ink-faint">
        Daqiqalar faqat :00 yoki :30 bo'lishi mumkin.
      </p>
      {state.error ? (
        <p className="text-[13px] font-medium text-red">{state.error}</p>
      ) : null}
      {state.ok && !state.error ? (
        <p className="text-[13px] font-medium text-green-deep">
          Slot qo'shildi ✓
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
