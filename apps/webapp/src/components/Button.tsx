"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { haptic } from "@/lib/telegram";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

/** 56px balandlik, r14. Bitta ekranda faqat bitta primary (orange). */
export function Button({
  variant = "primary",
  full = false,
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  onClick,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${full ? styles.full : ""} ${className}`}
      disabled={disabled || loading}
      onClick={(e) => {
        haptic("light");
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
