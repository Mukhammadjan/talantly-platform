"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/lib/icons";
import { haptic } from "@/lib/telegram";
import styles from "./Nav.module.css";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Qorong'i suzuvchi pill. Faqat faol element yorliq ko'rsatadi. */
export function Nav({ items }: { items: NavItem[] }): JSX.Element {
  const pathname = usePathname();
  // Faqat ENG UZUN mos keluvchi element faol — "/talant" barcha
  // "/talant/*" sahifani egallab olmasin.
  const activeHref = items
    .filter(
      (it) => pathname === it.href || pathname.startsWith(`${it.href}/`),
    )
    .reduce<string | null>(
      (best, it) => (best && best.length >= it.href.length ? best : it.href),
      null,
    );
  return (
    <nav className={styles.nav} aria-label="Asosiy">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`${styles.item} ${active ? styles.on : ""}`}
            onClick={() => haptic("light")}
          >
            <Icon name={item.icon} size={26} />
            <span className={styles.lbl}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
