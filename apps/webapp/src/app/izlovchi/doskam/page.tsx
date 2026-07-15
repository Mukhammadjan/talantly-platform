"use client";

import { useEffect } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./doskam.module.css";

interface BoardCard {
  icon: IconName;
  label: string;
  count: number;
}

const CARDS: BoardCard[] = [
  { icon: "doc", label: "Kelgan arizalar", count: 12 },
  { icon: "calendar", label: "Suhbatlar", count: 3 },
  { icon: "send", label: "Yuborilgan takliflar", count: 6 },
  { icon: "bookmark", label: "Saqlangan nomzodlar", count: 42 },
];

export default function DoskamPage(): JSX.Element {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <main className="screen">
      <h1 className={styles.h}>Doskam</h1>
      <p className={styles.sub}>Nomzodlar bo&apos;yicha ish jarayoningiz.</p>

      <div className={styles.grid}>
        {CARDS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={styles.card}
            onClick={() => haptic("light")}
          >
            <div className={styles.top}>
              <span className={styles.tile}>
                <Icon name={c.icon} size={24} />
              </span>
              <span className={styles.count}>{c.count}</span>
            </div>
            <span className={styles.label}>{c.label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
