"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasSession, loginWithPassword, setWebToken } from "@/lib/auth";
import { getSavedRole } from "@/lib/role";
import styles from "./kirish.module.css";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_BOT_USERNAME ?? "Talantly_bot";

interface WidgetUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTalantlyTelegramAuth?: (user: WidgetUser) => void;
  }
}

export default function KirishPage(): JSX.Element {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const gotoHub = async (): Promise<void> => {
    const role = await getSavedRole();
    router.replace(
      role === "talant"
        ? "/talant"
        : role === "izlovchi"
          ? "/izlovchi"
          : "/welcome",
    );
  };

  const submitPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const r = await loginWithPassword(phone, password);
    if (r.ok) {
      await gotoHub();
      return;
    }
    setBusy(false);
    setErr(
      r.status === 429
        ? "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining."
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
        router.replace(
          role === "talant"
            ? "/talant"
            : role === "izlovchi"
              ? "/izlovchi"
              : "/welcome",
        );
      });
    });
    return () => {
      live = false;
    };
  }, [router]);

  // Telegram Login Widget'ni joylash.
  useEffect(() => {
    window.onTalantlyTelegramAuth = (user: WidgetUser): void => {
      setBusy(true);
      setErr(null);
      void fetch("/api/auth/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then(async (res) => {
          if (!res.ok) {
            const d = (await res.json()) as { error?: string };
            setErr(
              d.error === "blocked"
                ? "Hisobingiz bloklangan. Administrator bilan bog'laning."
                : "Kirish tasdiqlanmadi — qayta urinib ko'ring.",
            );
            setBusy(false);
            return;
          }
          const d = (await res.json()) as { token: string };
          setWebToken(d.token);
          const role = await getSavedRole();
          router.replace(
            role === "talant"
              ? "/talant"
              : role === "izlovchi"
                ? "/izlovchi"
                : "/welcome",
          );
        })
        .catch(() => {
          setErr("Tarmoq xatosi — internetni tekshiring.");
          setBusy(false);
        });
    };

    const holder = widgetRef.current;
    if (!holder || holder.childElementCount > 0) return;
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "14");
    script.setAttribute("data-onauth", "onTalantlyTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    holder.appendChild(script);

    return () => {
      delete window.onTalantlyTelegramAuth;
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
          Telefon raqami va parolingiz bilan kiring. Parolni Telegram botda
          o&apos;rnatasiz — telefondagi Mini App bilan bitta akkaunt.
        </p>

        <form
          className={styles.form}
          onSubmit={(e) => void submitPassword(e)}
        >
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

        <p className={styles.forgot}>
          Parolni unutdingizmi? Botda{" "}
          <a
            href={`https://t.me/${BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            /parol
          </a>{" "}
          buyrug&apos;ini yuboring.
        </p>

        <div className={styles.divider}>
          <span>yoki</span>
        </div>

        <div ref={widgetRef} className={styles.widget} />

        <p className={styles.alt}>
          Akkount yo&apos;qmi?{" "}
          <a
            href={`https://t.me/${BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Botda ro&apos;yxatdan o&apos;ting
          </a>
        </p>
      </div>
    </main>
  );
}
