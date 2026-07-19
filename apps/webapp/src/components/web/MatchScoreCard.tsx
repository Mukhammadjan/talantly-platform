"use client";

import { Icon } from "@/lib/icons";
import styles from "./MatchScoreCard.module.css";

/** Detail sidebar: moslik foizi + verdikt + AI tavsiyalar CTA.
 *  Guest (percent=null) → kirishga undaydi. */
export function MatchScoreCard({
  percent,
  verdict,
  summary,
  onViewSuggestions,
}: {
  percent: number | null;
  verdict: string;
  summary: string;
  onViewSuggestions: () => void;
}): JSX.Element {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <Icon name="sparkle" size={18} className={styles.spark} />
        <span className={styles.kicker}>AI moslik</span>
      </div>

      {percent != null ? (
        <>
          <p className={styles.score}>
            <span className="num">{percent}%</span>
            <span className={styles.verdict}> — {verdict}</span>
          </p>
          <p className={styles.summary}>{summary}</p>
          <button
            type="button"
            className={styles.cta}
            onClick={onViewSuggestions}
          >
            AI tavsiyalarni ko&apos;rish
          </button>
        </>
      ) : (
        <>
          <p className={styles.score}>Moslikni bilib oling</p>
          <p className={styles.summary}>
            Kirsangiz, bu vakansiya sizga qanchalik mos kelishini AI hisoblaydi.
          </p>
          <button
            type="button"
            className={styles.cta}
            onClick={onViewSuggestions}
          >
            Kirish
          </button>
        </>
      )}
    </div>
  );
}
