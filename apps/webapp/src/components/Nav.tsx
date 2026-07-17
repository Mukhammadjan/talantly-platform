"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { haptic } from "@/lib/telegram";
import styles from "./Nav.module.css";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

function isTextField(el: unknown): boolean {
  return (
    el instanceof HTMLElement &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
  );
}

/** Qorong'i suzuvchi pill — faqat iconlar; faol icon to'ldirilgan orange doira.
 *  Klaviatura ochiq payt (matn maydoni fokusda) pastga yashirinadi. */
export function Nav({ items }: { items: NavItem[] }): JSX.Element {
  const pathname = usePathname();
  const [kbOpen, setKbOpen] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onFocusIn = (e: FocusEvent): void => {
      if (isTextField(e.target)) {
        clearTimeout(t);
        setKbOpen(true);
      }
    };
    const onFocusOut = (): void => {
      // Fokus maydonlar orasida ko'chsa lip-lip qilmasin.
      clearTimeout(t);
      t = setTimeout(() => {
        if (!isTextField(document.activeElement)) setKbOpen(false);
      }, 80);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(t);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  const activeHref = items
    .filter(
      (it) => pathname === it.href || pathname.startsWith(`${it.href}/`),
    )
    .reduce<string | null>(
      (best, it) => (best && best.length >= it.href.length ? best : it.href),
      null,
    );

  return (
    <nav
      className={`${styles.nav} ${kbOpen ? styles.navHidden : ""}`}
      aria-label="Asosiy"
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={styles.item}
            onClick={() => haptic("light")}
          >
            <span className={`${styles.dot} ${active ? styles.dotOn : ""}`}>
              <Icon name={item.icon} size={24} filled={active} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
