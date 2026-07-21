"use client";

import Link from "next/link";
import { Icon } from "@/lib/icons";
import { AiMatchPill } from "./AiMatchPill";
import { MatchPopover } from "./MatchPopover";
import styles from "./JobCard.module.css";

export interface JobCardProps {
  id: string;
  company: string;
  verified: boolean;
  logoUrl?: string | null;
  title: string;
  employment: string; // "To'liq stavka" va h.k.
  location: string;
  workMode: string; // "Ofis" | "Masofaviy" | "Aralash"
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency?: string;
  postedAgo: string;
  matchPercent: number | null;
  matchReasons?: string[];
  matchQuote?: string;
  onOpenBreakdown?: () => void;
}

function money(min: number | null, max: number | null, cur = "so'm"): string {
  const f = (n: number): string => n.toLocaleString("ru-RU");
  if (!min && !max) return "Kelishilgan";
  if (min && max) return `${f(min)}–${f(max)} ${cur}`;
  return `${f((min ?? max) as number)} ${cur}`;
}

export function JobCard(props: JobCardProps): JSX.Element {
  const hasPopover =
    props.matchPercent != null && (props.matchReasons?.length ?? 0) > 0;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.logo} aria-hidden="true">
          {props.logoUrl ? (

            <img src={props.logoUrl} alt="" className={styles.logoImg} />
          ) : (
            props.company.charAt(0).toUpperCase()
          )}
        </span>
        <span className={styles.company}>
          {props.company}
          {props.verified ? (
            <span className={styles.seal} title="Tekshirilgan">
              <Icon name="check" size={11} />
            </span>
          ) : null}
        </span>
        <button
          type="button"
          className={styles.bookmark}
          aria-label="Saqlash"
        >
          <Icon name="bookmark" size={18} />
        </button>
      </div>

      <h3 className={styles.title}>
        <Link href={`/vakansiya/${props.id}`} className={styles.titleLink}>
          {props.title}
        </Link>
      </h3>

      <p className={styles.meta}>
        {[props.employment, props.location, props.workMode]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <p className={styles.desc}>{props.description}</p>

      <div className={styles.foot}>
        <span className={`${styles.salary} num`}>
          {money(props.salaryMin, props.salaryMax, props.currency)}
        </span>
        <span className={styles.posted}>{props.postedAgo}</span>
      </div>

      <span className={styles.pillWrap}>
        <AiMatchPill
          percent={props.matchPercent}
          onClick={props.onOpenBreakdown}
        />
        {hasPopover ? (
          <MatchPopover
            reasons={props.matchReasons ?? []}
            quote={props.matchQuote ?? ""}
          />
        ) : null}
      </span>
    </article>
  );
}
