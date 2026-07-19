"use client";

import { Icon } from "@/lib/icons";
import styles from "./AiSmartToggle.module.css";

/** AI-saralash tumbleri — yoqilsa vakansiyalar moslik bo'yicha saralanadi. */
export function AiSmartToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div className={`${styles.card} ${checked ? styles.on : ""}`}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="sparkle" size={20} />
      </span>
      <span className={styles.texts}>
        <span className={styles.title}>AI-saralash</span>
        <span className={styles.sub}>Sizga eng mos vakansiyalar tepada</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="AI-saralash"
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
