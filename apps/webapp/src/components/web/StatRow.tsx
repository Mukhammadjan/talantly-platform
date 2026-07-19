import styles from "./StatRow.module.css";

/** Detail statistika qatori: Tajriba · Arizalar · Mos nomzodlar · Ko'rilgan. */
export function StatRow({
  items,
}: {
  items: { label: string; value: string }[];
}): JSX.Element {
  return (
    <div className={styles.row}>
      {items.map((it) => (
        <div key={it.label} className={styles.stat}>
          <span className={`${styles.value} num`}>{it.value}</span>
          <span className={styles.label}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
