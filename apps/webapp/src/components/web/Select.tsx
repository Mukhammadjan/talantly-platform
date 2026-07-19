"use client";

import { Icon } from "@/lib/icons";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

/** Token-stilli native select — a11y uchun to'liq klaviatura/screen-reader. */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
}): JSX.Element {
  return (
    <span className={styles.wrap}>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron" size={18} className={styles.chevron} />
    </span>
  );
}
