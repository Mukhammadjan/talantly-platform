"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initTelegram, isInsideTelegram } from "@/lib/telegram";
import styles from "./page.module.css";

const BOT_LINK = "https://t.me/Talantly_bot";

export default function SplashPage(): JSX.Element {
  const router = useRouter();
  const [outside, setOutside] = useState(false);

  useEffect(() => {
    initTelegram();
    if (!isInsideTelegram()) {
      setOutside(true);
      return;
    }
    const t = setTimeout(() => router.replace("/rol"), 900);
    return () => clearTimeout(t);
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
