"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./koproq.module.css";

const ACTIONS: { icon: IconName; label: string; href: string }[] = [
  { icon: "grid", label: "Kompaniya profili", href: "/kompaniya" },
  { icon: "briefcase", label: "Mening vakansiyalarim", href: "/vakansiyalar" },
  { icon: "info", label: "Yordam", href: "/yordam" },
  { icon: "user", label: "Rolni almashtirish", href: "/rol" },
];

export default function KoproqPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <main className="screen">
      <h1 className={styles.h}>Ko&apos;proq</h1>

      <Button
        full
        icon={<Icon name="plus" size={20} />}
        onClick={() => router.push("/vakansiya/yangi")}
      >
        Vakansiya yaratish
      </Button>

      <div className={styles.group}>
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            className={styles.row}
            onClick={() => {
              haptic("light");
              router.push(a.href);
            }}
          >
            <span className={styles.ricon}>
              <Icon name={a.icon} size={20} />
            </span>
            <span className={styles.rlabel}>{a.label}</span>
            <Icon name="chevron" size={18} className={styles.chev} />
          </button>
        ))}
      </div>
    </main>
  );
}
