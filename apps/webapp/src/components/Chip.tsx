"use client";

import type { ReactNode } from "react";
import { haptic } from "@/lib/telegram";
import styles from "./Chip.module.css";

interface ChipProps {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

/** 40px balandlik, r999. */
export function Chip({
  label,
  active = false,
  icon,
  onClick,
}: ChipProps): JSX.Element {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.active : ""}`}
      aria-pressed={active}
      onClick={() => {
        haptic("light");
        onClick?.();
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
