"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSavedRole, saveRole, type AppRole } from "@/lib/role";
import { initTelegram, isInsideTelegram } from "@/lib/telegram";
import styles from "./page.module.css";

const BOT_LINK = "https://t.me/Talantly_bot";

const HOME: Record<AppRole, string> = {
  talant: "/talant",
  izlovchi: "/izlovchi",
};

export default function SplashPage(): JSX.Element {
  const router = useRouter();
  const [outside, setOutside] = useState(false);

  useEffect(() => {
    initTelegram();
    if (!isInsideTelegram()) {
      setOutside(true);
      return;
    }

    let live = true;
    const timers: number[] = [];
    const go = (path: string): void => {
      timers.push(window.setTimeout(() => router.replace(path), 700));
    };

    // Bot tugmasidan kelgan rol (?role=talant|izlovchi) — saqlab kiramiz.
    const param = new URLSearchParams(window.location.search).get("role");
    if (param === "talant" || param === "izlovchi") {
      saveRole(param);
      go(HOME[param]);
    } else {
      // Avval tanlangan rol bo'lsa — so'ramasdan o'sha bo'limga.
      getSavedRole().then((saved) => {
        if (!live) return;
        go(saved ? HOME[saved] : "/welcome");
      });
    }

    return () => {
      live = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [router]);

  return (
    <main className={styles.wrap}>
      <img
        src="/assets/brand/talantly-wordmark-dark.svg"
        alt="Talantly"
        className={styles.logo}
      />
      <p className={styles.micro}>Tekshirilgan talantlar</p>

      {outside ? (
        <>
          <img
            src="/brand/telegram-qr.svg"
            alt="Talantly bot QR kodi"
            width={176}
            height={176}
            className={styles.qr}
          />
          <a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Telegramda oching
          </a>
          <p className={styles.hint}>@Talantly_bot</p>
        </>
      ) : null}
    </main>
  );
}
