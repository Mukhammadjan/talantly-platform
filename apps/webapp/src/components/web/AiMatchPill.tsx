"use client";

import { Icon } from "@/lib/icons";
import styles from "./AiMatchPill.module.css";

/** AI-moslik pill'i — soft-orange, sparkle. Guest'da (percent=null)
 *  "moslikni ko'rish" holatida (kirishga undaydi). */
export function AiMatchPill({
  percent,
  onClick,
}: {
  percent: number | null;
  onClick?: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className={styles.pill}
      onClick={onClick}
      aria-label={
        percent != null
          ? `AI moslik ${percent} foiz, batafsil`
          : "Moslikni ko'rish uchun kiring"
      }
    >
      <Icon name="sparkle" size={14} className={styles.spark} />
      {percent != null ? (
        <span className={styles.text}>
          AI Moslik: <span className="num">{percent}%</span>
        </span>
      ) : (
        <span className={styles.text}>Moslikni ko&apos;rish — kiring</span>
      )}
    </button>
  );
}
