"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setErr(
        res?.status === 401
          ? "Login yoki parol noto'g'ri."
          : "Xatolik yuz berdi — qayta urinib ko'ring.",
      );
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-bg px-4">
      <form
        onSubmit={(e) => void submit(e)}
        className="w-full max-w-[380px] bg-white rounded-xl border border-line p-8 flex flex-col gap-5 shadow-float"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Brend belgisi — founder SVG'si, qayta chizilmaydi */}
          <img src="/brand/wordmark-dark.svg" alt="Talantly" className="h-6 w-auto" />
          <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-2">
            Admin panel
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-1">Login</span>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            autoFocus
            className="h-12 rounded-lg border border-line-strong bg-white px-4 text-[15px] text-ink-1 focus:outline-none focus:border-action"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-1">Parol</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-12 rounded-lg border border-line-strong bg-white px-4 text-[15px] text-ink-1 focus:outline-none focus:border-action"
          />
        </label>

        {err ? (
          <p className="text-[13px] font-medium text-danger-ink">{err}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !login || !password}
          className="h-12 rounded-lg bg-action text-white text-[15px] font-bold hover:bg-action/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </main>
  );
}
