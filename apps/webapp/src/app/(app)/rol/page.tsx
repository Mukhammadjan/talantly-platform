"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/lib/icons";
import { saveRole } from "@/lib/role";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./rol.module.css";

interface RoleOption {
  id: "talant" | "izlovchi";
  href: string;
  icon: IconName;
  title: string;
  text: string;
}

const ROLES: RoleOption[] = [
  {
    id: "talant",
    href: "/talant",
    icon: "user",
    title: "Men talantman",
    text: "Tekshiruvdan o'ting, tasdiqlangan profil oling va takliflar oling",
  },
  {
    id: "izlovchi",
    href: "/izlovchi",
    icon: "briefcase",
    title: "Ish beruvchiman",
    text: "Tekshirilgan nomzodlarni toping va tez bog'laning",
  },
];

export default function RolPage(): JSX.Element {
  const router = useRouter();
  const [sel, setSel] = useState<RoleOption["id"] | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/welcome"));

  const chosen = ROLES.find((r) => r.id === sel) ?? null;

  return (
    <main className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.h}>Qanday davom etasiz?</h1>
        <p className={styles.sub}>
          Rolingizni tanlang — tajriba shunga moslashadi.
        </p>
      </div>

      <div className={styles.cards}>
        {ROLES.map((r) => {
          const on = sel === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`${styles.card} ${on ? styles.on : ""}`}
              aria-pressed={on}
              onClick={() => {
                haptic("light");
                setSel(r.id);
              }}
            >
              <span className={`${styles.tile} ${on ? styles.tileOn : ""}`}>
                <Icon name={r.icon} size={24} />
              </span>
              <span className={styles.texts}>
                <span className={styles.ctitle}>{r.title}</span>
                <span className={styles.ctext}>{r.text}</span>
              </span>
              <span className={`${styles.radio} ${on ? styles.radioOn : ""}`}>
                {on ? <Icon name="check" size={14} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.cta}>
        <Button
          full
          disabled={!chosen}
          iconRight={<Icon name="arrow" size={20} />}
          onClick={() => {
            if (!chosen) return;
            saveRole(chosen.id);
            router.push(chosen.href);
          }}
        >
          Davom etish
        </Button>
        <p className={styles.terms}>
          Rolni keyinchalik istalgan vaqtda almashtirishingiz mumkin.
        </p>
      </div>
    </main>
  );
}
