"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./profil.module.css";

const COMPANY = { name: "Novatech", kind: "IT kompaniya", city: "Toshkent" };

interface Item {
  icon: IconName;
  label: string;
  href: string;
  danger?: boolean;
}

const ACCOUNT: Item[] = [
  { icon: "grid", label: "Kompaniya profili", href: "/kompaniya" },
  { icon: "settings", label: "Sozlamalar", href: "/sozlamalar" },
  { icon: "info", label: "Yordam", href: "/yordam" },
];

const SECONDARY: Item[] = [
  { icon: "swap", label: "Rolni almashtirish", href: "/rol" },
];

export default function IzlovchiProfilPage(): JSX.Element {
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
      <h1 className={styles.h}>Profil</h1>

      <button
        type="button"
        className={styles.company}
        onClick={() => go("/kompaniya")}
      >
        <span className={styles.logo}>{COMPANY.name.charAt(0)}</span>
        <span className={styles.ctexts}>
          <span className={styles.cname}>{COMPANY.name}</span>
          <span className={styles.csub}>
            {COMPANY.kind} · {COMPANY.city}
          </span>
        </span>
        <Icon name="chevron" size={18} className={styles.cchev} />
      </button>

      <div className={styles.group}>
        {ACCOUNT.map((it) => (
          <button key={it.label} type="button" className={styles.row} onClick={() => go(it.href)}>
            <span className={styles.ricon}>
              <Icon name={it.icon} size={20} />
            </span>
            <span className={styles.rlabel}>{it.label}</span>
            <Icon name="chevron" size={18} className={styles.chev} />
          </button>
        ))}
      </div>

      <div className={styles.group}>
        {SECONDARY.map((it) => (
          <button key={it.label} type="button" className={styles.row} onClick={() => go(it.href)}>
            <span className={styles.ricon}>
              <Icon name={it.icon} size={20} />
            </span>
            <span className={styles.rlabel}>{it.label}</span>
            <Icon name="chevron" size={18} className={styles.chev} />
          </button>
        ))}
      </div>
    </main>
  );
}
