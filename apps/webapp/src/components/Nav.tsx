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

/** Qorong'i suzuvchi pill — faqat iconlar; faol icon to'ldirilgan orange doira. */
export function Nav({ items }: { items: NavItem[] }): JSX.Element {
  const pathname = usePathname();
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
