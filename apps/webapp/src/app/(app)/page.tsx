"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSavedRole, saveRole, type AppRole } from "@/lib/role";
import { initTelegram, isInsideTelegram } from "@/lib/telegram";
import styles from "./page.module.css";

const HOME: Record<AppRole, string> = {
  talant: "/talant",
  izlovchi: "/izlovchi",
};

export default function SplashPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    initTelegram();

    let live = true;
    const timers: number[] = [];
    const go = (path: string): void => {
      timers.push(window.setTimeout(() => router.replace(path), 700));
    };

    if (!isInsideTelegram()) {
      // Web platforma: talantly.uz to'g'ridan-to'g'ri vakansiyalarga ochiladi
      // (guest ham erkin ko'radi — landing yo'q, platformaning o'zi).
      router.replace("/vakansiyalar");
      return () => {
        live = false;
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

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

    </main>
  );
}
