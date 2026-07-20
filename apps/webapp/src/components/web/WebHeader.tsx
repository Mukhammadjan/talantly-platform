"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearWebToken, hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import { isInsideTelegram } from "@/lib/telegram";
import styles from "./WebHeader.module.css";

const NAV = [
  { href: "/", label: "Asosiy" },
  { href: "/vakansiyalar", label: "Vakansiyalar" },
  { href: "/kompaniyalar", label: "Kompaniyalar" },
  { href: "/ai", label: "AI vositalar" },
  { href: "/nomzodlar", label: "Nomzodlar" },
];

export function WebHeader(): JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [inTelegram, setInTelegram] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInTelegram(isInsideTelegram());
    void hasSession().then(setAuthed);
  }, []);

  // Akkaunt menyusi: tashqariga bosish + Esc bilan yopiladi.
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent): void => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  // Telegram Mini App ichida web qobig'i ko'rsatilmaydi.
  if (inTelegram) return null;

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const logout = (): void => {
    clearWebToken();
    setAuthed(false);
    setAccountOpen(false);
    router.replace("/");
    router.refresh();
  };

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
          <span className={styles.currency}>UZS · so&apos;m</span>
          {authed ? (
            <div className={styles.account} ref={accountRef}>
              <button
                type="button"
                className={styles.user}
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className={styles.avatar} aria-hidden="true">
                  T
                </span>
                <span className={styles.userName}>Kabinet</span>
                <Icon name="chevron" size={16} />
              </button>
              {accountOpen ? (
                <div className={styles.dropdown} role="menu">
                  <Link
                    href="/kabinet"
                    className={styles.dropItem}
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Icon name="user" size={16} /> Mening kabinetim
                  </Link>
                  <Link
                    href="/kompaniyam"
                    className={styles.dropItem}
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Icon name="briefcase" size={16} /> Mening kompaniyam
                  </Link>
                  <Link
                    href="/kompaniyam/vakansiyalar"
                    className={styles.dropItem}
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Icon name="doc" size={16} /> Vakansiyalarim
                  </Link>
                  <button
                    type="button"
                    className={`${styles.dropItem} ${styles.dropDanger}`}
                    role="menuitem"
                    onClick={logout}
                  >
                    <Icon name="logout" size={16} /> Chiqish
                  </button>
                </div>
              ) : null}
            </div>
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
          {authed ? (
            <>
              <Link
                href="/kabinet"
                className={styles.mobileItem}
                onClick={() => setMenuOpen(false)}
              >
                Mening kabinetim
              </Link>
              <button
                type="button"
                className={`${styles.mobileItem} ${styles.dropDanger}`}
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Chiqish
              </button>
            </>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
