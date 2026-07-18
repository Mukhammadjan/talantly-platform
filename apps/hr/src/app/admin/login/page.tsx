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
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Chap — forma */}
      <div className="grid place-items-center px-6 py-10">
        <form
          onSubmit={(e) => void submit(e)}
          className="w-full max-w-[360px] flex flex-col gap-5"
        >
          <div className="flex flex-col items-center gap-3 mb-2">
            <span className="w-14 h-14 rounded-full bg-action-soft border border-line grid place-items-center">
              <img src="/brand/mark.svg" alt="" className="h-7 w-7" />
            </span>
            <h1 className="text-[20px] font-bold text-ink-1">
              Admin panelga kirish
            </h1>
            <p className="text-[13px] text-ink-2 text-center">
              Platformani boshqarish uchun login va parolingizni kiriting.
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
      </div>

      {/* O'ng — brend panel (faqat katta ekranda) */}
      <div className="hidden lg:grid place-items-center relative overflow-hidden bg-ink-1">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 15%, rgba(242,100,48,.38), transparent 55%), radial-gradient(110% 80% at 15% 90%, rgba(242,100,48,.22), transparent 50%)",
          }}
        />
        <div
          className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "conic-gradient(from 200deg, rgba(242,100,48,.5), transparent 60%)",
            filter: "blur(48px)",
          }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <img
            src="/brand/wordmark-light.svg"
            alt="Talantly"
            className="h-12 w-auto"
          />
          <p className="text-[14px] text-white/80">
            Tekshirilgan talantlar platformasi
          </p>
        </div>
      </div>
    </main>
  );
}
