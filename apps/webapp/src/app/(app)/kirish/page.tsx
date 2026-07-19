"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasSession, setWebToken } from "@/lib/auth";
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
          Telegram hisobingiz bilan bir bosishda kiring — telefondagi Mini App
          bilan bitta akkaunt.
        </p>

        <div ref={widgetRef} className={styles.widget} />
        {busy ? <p className={styles.hint}>Kirilmoqda...</p> : null}
        {err ? <p className={styles.err}>{err}</p> : null}

        <p className={styles.alt}>
          Telegram ilovasida ochmoqchimisiz?{" "}
          <a
            href={`https://t.me/${BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{BOT_USERNAME}
          </a>
        </p>
      </div>
    </main>
  );
}
