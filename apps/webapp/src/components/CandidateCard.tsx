"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/lib/icons";
import { DIRECTION_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { haptic } from "@/lib/telegram";
import type { Candidate } from "@/lib/types";
import styles from "./CandidateCard.module.css";

export function CandidateCard({ c }: { c: Candidate }): JSX.Element {
  const router = useRouter();
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => {
        haptic("light");
        router.push(`/nomzod/${c.id}`);
      }}
    >
      <div className={styles.top}>
        <Avatar name={c.displayName} photoUrl={c.photoUrl} size={48} />
        <div className={styles.texts}>
          <span className={styles.name}>
            {c.displayName}
            {c.verified ? (
              <span className={styles.seal}>
                <Icon name="check" size={11} />
              </span>
            ) : null}
          </span>
          <span className={styles.role}>
            {c.role} · {c.district}
          </span>
        </div>
        <span className={styles.score}>{c.score}</span>
      </div>

      <div className={styles.skills}>
        {c.skills.slice(0, 3).map((s) => (
          <span key={s} className={styles.skill}>
            {s}
          </span>
        ))}
        <span className={styles.level}>{LEVEL_LABELS[c.level]}</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.dir}>{DIRECTION_LABELS[c.direction]}</span>
        <span className={styles.open}>
          Profil <Icon name="chevron" size={14} />
        </span>
      </div>
    </button>
  );
}
