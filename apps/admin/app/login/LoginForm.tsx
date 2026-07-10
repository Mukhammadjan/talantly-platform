"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Tekshirilmoqda…" : "Kirish"}
    </button>
  );
}

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [state, formAction] = useFormState<LoginState, FormData>(signIn, {
    error: null,
  });
  const error = state.error ?? initialError;

  return (
    <form action={formAction} className="grid gap-4">
      {error ? (
        <p className="rounded-input bg-red-tint px-4 py-3 text-[13px] font-medium text-red">
          {error}
        </p>
      ) : null}
      <label className="grid gap-1.5">
        <span className="label-caps">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="input-base"
          placeholder="admin@talantly.uz"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="label-caps">Parol</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="input-base"
          placeholder="••••••••"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
