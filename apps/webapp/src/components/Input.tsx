import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

/** 56px balandlik, r12. */
export function Input({
  label,
  hint,
  className = "",
  ...rest
}: InputProps): JSX.Element {
  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input className={`${styles.input} ${className}`} {...rest} />
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
