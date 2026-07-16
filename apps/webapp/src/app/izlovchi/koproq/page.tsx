"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./koproq.module.css";

interface BoardCard {
  icon: IconName;
  label: string;
  count: number;
  kind: string;
}

const CARDS: BoardCard[] = [
  { icon: "doc", label: "Kelgan arizalar", count: 12, kind: "arizalar" },
  { icon: "calendar", label: "Suhbatlar", count: 3, kind: "suhbatlar" },
  { icon: "send", label: "Yuborilgan takliflar", count: 6, kind: "takliflar" },
  { icon: "bookmark", label: "Saqlangan nomzodlar", count: 42, kind: "saqlangan" },
];

export default function KoproqPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);

  const go = (href: string): void => {
    haptic("light");
    router.push(href);
  };

  return (
    <main className="screen">
      <h1 className={styles.h}>Ko&apos;proq</h1>
      <p className={styles.sub}>Ish jarayoningiz va vakansiyalar.</p>

      <div className={styles.grid}>
        {CARDS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={styles.card}
            onClick={() => go(`/doska/${c.kind}`)}
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

      <Button
        full
        icon={<Icon name="plus" size={20} />}
        className={styles.create}
        onClick={() => go("/vakansiya/yangi")}
      >
        Vakansiya yaratish
      </Button>

      <div className={styles.group}>
        <button type="button" className={styles.row} onClick={() => go("/vakansiyalar")}>
          <span className={styles.ricon}>
            <Icon name="briefcase" size={20} />
          </span>
          <span className={styles.rlabel}>Mening vakansiyalarim</span>
          <Icon name="chevron" size={18} className={styles.chev} />
        </button>
      </div>
    </main>
  );
}
