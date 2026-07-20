import Link from "next/link";
import { Icon } from "@/lib/icons";
import type { CandidateView } from "@/lib/candidates";
import styles from "./CandidateCard.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const LEVEL_LABEL: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

export function CandidateCard({ c }: { c: CandidateView }): JSX.Element {
  const initial = (c.displayName || "N").charAt(0).toUpperCase();
  return (
    <Link href={`/nomzodlar/${c.id}`} className={styles.card}>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {c.photoUrl ? (
            <img src={c.photoUrl} alt="" className={styles.avatarImg} />
          ) : (
            initial
          )}
        </span>
        <div className={styles.titles}>
          <span className={styles.name}>
            {c.displayName}
            {c.verified ? (
              <span className={styles.seal} title="Tekshirilgan">
                <Icon name="check" size={11} />
              </span>
            ) : null}
            {c.isDemo ? <span className={styles.demo}>DEMO</span> : null}
          </span>
          <span className={styles.role}>
            {c.role} · {DIRECTION_LABEL[c.direction] ?? c.direction}
          </span>
        </div>
        <span className={`${styles.score} num`} title="Ko'nikma bali">
          {c.score}
        </span>
      </div>

      {c.skills.length ? (
        <div className={styles.tags}>
          {c.skills.slice(0, 3).map((s) => (
            <span key={s} className={styles.tag}>
              {s}
            </span>
          ))}
          <span className={styles.tagLevel}>
            {LEVEL_LABEL[c.level] ?? c.level}
          </span>
        </div>
      ) : null}

      <div className={styles.foot}>
        <span className={styles.meta}>
          {[c.district, c.archetype !== "—" ? c.archetype : ""]
            .filter(Boolean)
            .join(" · ") || "Toshkent"}
        </span>
        <span className={styles.link}>Profil →</span>
      </div>
    </Link>
  );
}
