"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isInsideTelegram } from "@/lib/telegram";
import styles from "./WebFooter.module.css";

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "Talantly_bot";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Talantlar uchun",
    links: [
      { href: "/vakansiyalar", label: "Vakansiyalar" },
      { href: "/kasblar", label: "Kasblar" },
      { href: "/kompaniyalar", label: "Kompaniyalar" },
      { href: "/ai", label: "AI vositalar" },
      { href: "/kabinet", label: "Mening kabinetim" },
    ],
  },
  {
    title: "Ish beruvchilar uchun",
    links: [
      { href: "/nomzodlar", label: "Nomzodlar" },
      { href: "/kompaniyam", label: "Mening kompaniyam" },
      { href: "/kompaniyam/vakansiyalar", label: "Vakansiyalarim" },
      { href: "/kirish", label: "Kirish" },
    ],
  },
];

export function WebFooter(): JSX.Element | null {
  const [inTelegram, setInTelegram] = useState(false);
  useEffect(() => {
    setInTelegram(isInsideTelegram());
  }, []);
  if (inTelegram) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <img
            src="/assets/brand/talantly-wordmark-dark.svg"
            alt="Talantly"
            className={styles.logo}
          />
          <p className={styles.tagline}>
            Tekshirilgan talantlar va ishonchli ish beruvchilar bir joyda.
          </p>
          <a
            className={styles.botLink}
            href={`https://t.me/${BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{BOT_USERNAME}
          </a>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} className={styles.col} aria-label={col.title}>
            <p className={styles.colTitle}>{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Talantly</span>
        <span className={styles.dot}>·</span>
        <span>Toshkent, O&apos;zbekiston</span>
      </div>
    </footer>
  );
}
