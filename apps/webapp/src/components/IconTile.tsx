import type { ReactNode } from "react";
import styles from "./IconTile.module.css";

interface IconTileProps {
  children: ReactNode;
  tone?: "neutral" | "action" | "verified";
  size?: number;
}

/** 44×44, r12. */
export function IconTile({
  children,
  tone = "neutral",
  size = 44,
}: IconTileProps): JSX.Element {
  return (
    <span
      className={`${styles.tile} ${styles[tone]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
