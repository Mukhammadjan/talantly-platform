import styles from "./Progress.module.css";

interface ProgressProps {
  /** 0..1 */
  value: number;
}

/** Neytral progress — status/progress uchun yashil ISHLATILMAYDI. */
export function Progress({ value }: ProgressProps): JSX.Element {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
