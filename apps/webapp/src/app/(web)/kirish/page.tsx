"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RegisterSheet } from "@/components/web/RegisterSheet";
import { hasSession, loginWithPassword } from "@/lib/auth";
import { getSavedRole, saveRole, type AppRole } from "@/lib/role";
import { isInsideTelegram } from "@/lib/telegram";
import styles from "./kirish.module.css";

// Kirgandan keyingi manzil. Brauzerda — web platforma bo'limlari,
// Telegram ichida — Mini App hub'lari.
function homeFor(role: AppRole | null, inTelegram: boolean): string {
  if (inTelegram) {
    return role === "talant" ? "/talant" : role === "izlovchi" ? "/izlovchi" : "/welcome";
  }
  return role === "talant" ? "/kabinet" : role === "izlovchi" ? "/kompaniyam" : "/";
}

export default function KirishPage(): JSX.Element {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);

  const submitPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const r = await loginWithPassword(phone, password);
    if (r.ok) {
      // Rolni serverdan olamiz (brauzerda localStorage bo'sh bo'lishi mumkin).
      const fromApi =
        r.preferredMode === "talant" || r.preferredMode === "izlovchi"
          ? r.preferredMode
          : null;
      if (fromApi) saveRole(fromApi);
      const role = fromApi ?? (await getSavedRole());
      router.replace(homeFor(role, isInsideTelegram()));
      return;
    }
    setBusy(false);
    setErr(
      r.status === 429
        ? "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining."
        : r.status === 409
          ? "Parol o'rnatilmagan. Botda «🔑 Login-parol olish» tugmasini bosing."
          : r.status === 403
            ? "Hisobingiz bloklangan. Administrator bilan bog'laning."
            : r.status === 400
              ? "Telefon va parolni to'ldiring."
              : "Telefon yoki parol xato.",
    );
  };

  // Sessiya bo'lsa to'g'ri bo'limga.
  useEffect(() => {
    let live = true;
    void hasSession().then((ok) => {
      if (!live || !ok) return;
      void getSavedRole().then((role) => {
        router.replace(homeFor(role, isInsideTelegram()));
      });
    });
    return () => {
      live = false;
    };
  }, [router]);

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <img
          src="/assets/brand/talantly-wordmark-dark.svg"
          alt="Talantly"
          className={styles.logo}
        />
        <h1 className={styles.title}>Platformaga kirish</h1>
        <p className={styles.sub}>
          Telefon raqami va parolingiz bilan kiring.
        </p>

        <form className={styles.form} onSubmit={(e) => void submitPassword(e)}>
          <input
            className={styles.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="Telefon raqami"
          />
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Parol"
          />
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
        {err ? <p className={styles.err}>{err}</p> : null}

        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => setRegisterOpen(true)}
        >
          Parolni unutdingizmi?
        </button>

        <div className={styles.divider}>
          <span>yoki</span>
        </div>

        <button
          type="button"
          className={styles.registerBtn}
          onClick={() => setRegisterOpen(true)}
        >
          Ro&apos;yxatdan o&apos;tish
        </button>
      </div>

      <RegisterSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Ro'yxatdan o'tish yoki parol olish"
      />
    </main>
  );
}
