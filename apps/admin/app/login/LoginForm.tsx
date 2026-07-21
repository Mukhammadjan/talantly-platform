"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MESSAGES: Record<string, string> = {
  invalid: "Telefon yoki parol noto'g'ri.",
  forbidden: "Bu hisob muzlatilgan yoki bloklangan.",
  rate_limited: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining.",
  bad_input: "Telefon va parolni to'g'ri kiriting.",
  server: "Server xatosi. Birozdan so'ng urining.",
};

export function LoginForm({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        redirect?: string;
        error?: string;
      };
      if (res.ok && data.ok) {
        router.replace(data.redirect ?? "/talantlar");
        router.refresh();
        return;
      }
      setError(MESSAGES[data.error ?? "server"] ?? MESSAGES.server);
    } catch {
      setError(MESSAGES.server);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error ? (
        <p className="rounded-input bg-red-tint px-4 py-3 text-[13px] font-medium text-red">
          {error}
        </p>
      ) : null}
      <label className="grid gap-1.5">
        <span className="label-caps">Telefon</span>
        <input
          type="tel"
          name="phone"
          required
          autoComplete="username"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-base"
          placeholder="+998 90 123 45 67"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="label-caps">Parol</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-base"
          placeholder="••••••••"
        />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Tekshirilmoqda…" : "Kirish"}
      </button>
    </form>
  );
}
