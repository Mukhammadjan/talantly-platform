"use client";

import type { ReactNode } from "react";
import { haptic } from "@/lib/telegram";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

/** r18 + --sh-raise. Bosiladigan karta <div> emas — <button>. */
export function Card({
  children,
  onClick,
  className = "",
  ariaLabel,
}: CardProps): JSX.Element {
  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className={`${styles.card} ${styles.tappable} ${className}`}
        onClick={() => {
          haptic("light");
          onClick();
        }}
      >
        {children}
      </button>
    );
  }
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
