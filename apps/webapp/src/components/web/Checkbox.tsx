"use client";

import styles from "./Checkbox.module.css";

/** Token-stilli checkbox — orange tik, native input ustida. */
export function Checkbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  count?: number;
}): JSX.Element {
  return (
    <label className={styles.row}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 16 16" className={styles.tick} width="12" height="12">
          <path
            d="M3 8.2 6.2 11.4 13 4.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
      {count != null ? <span className={styles.count}>{count}</span> : null}
    </label>
  );
}
