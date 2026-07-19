import styles from "./MatchPopover.module.css";

/** JobCard hover/fokusda: "Nega mos keladi?" + sabablar + AI iqtibos. */
export function MatchPopover({
  reasons,
  quote,
}: {
  reasons: string[];
  quote: string;
}): JSX.Element {
  return (
    <div className={styles.popover} role="tooltip">
      <p className={styles.head}>Nega mos keladi?</p>
      <ul className={styles.list}>
        {reasons.map((r) => (
          <li key={r} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            {r}
          </li>
        ))}
      </ul>
      <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>
    </div>
  );
}
