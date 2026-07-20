"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import styles from "./WebHeader.module.css";

const NAV = [
  { href: "/", label: "Asosiy" },
  { href: "/vakansiyalar", label: "Vakansiyalar" },
  { href: "/kompaniyalar", label: "Kompaniyalar" },
  { href: "/ai", label: "AI vositalar" },
  { href: "/panel", label: "Ish beruvchilarga" },
];

export function WebHeader(): JSX.Element {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void hasSession().then(setAuthed);
  }, []);

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Talantly bosh sahifa">

          <img
            src="/assets/brand/talantly-wordmark-dark.svg"
            alt="Talantly"
            className={styles.logo}
          />
        </Link>

        <nav className={styles.nav} aria-label="Asosiy navigatsiya">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.navItem} ${isActive(n.href) ? styles.navActive : ""}`}
              aria-current={isActive(n.href) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <button type="button" className={styles.iconBtn} aria-label="Xabarlar">
            <Icon name="bell" size={20} />
          </button>
          <span className={styles.currency}>UZS · so&apos;m</span>
          {authed ? (
            <Link href="/kabinet" className={styles.user}>
              <span className={styles.avatar} aria-hidden="true">
                T
              </span>
              <span className={styles.userName}>Kabinet</span>
            </Link>
          ) : (
            <Link href="/kirish" className={styles.loginBtn}>
              Kirish
            </Link>
          )}
          <button
            type="button"
            className={styles.burger}
            aria-label="Menyu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "close" : "board"} size={22} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className={styles.mobileNav} aria-label="Mobil navigatsiya">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.mobileItem} ${isActive(n.href) ? styles.mobileActive : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
