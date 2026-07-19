"use client";

import Link from "next/link";
import { Icon } from "@/lib/icons";
import styles from "./RecoCard.module.css";

/** "Siz uchun tavsiya" ro'yxati item'i — ixcham vakansiya kartasi. */
export function RecoCard({
  id,
  company,
  verified,
  title,
  location,
  salaryMin,
  salaryMax,
  currency = "so'm",
  matchPercent,
}: {
  id: string;
  company: string;
  verified: boolean;
  title: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency?: string;
  matchPercent: number | null;
}): JSX.Element {
  const money =
    salaryMin && salaryMax
      ? `${salaryMin.toLocaleString("ru-RU")}–${salaryMax.toLocaleString("ru-RU")} ${currency}`
      : salaryMin || salaryMax
        ? `${((salaryMin ?? salaryMax) as number).toLocaleString("ru-RU")} ${currency}`
        : "Kelishilgan";

  return (
    <Link href={`/vakansiya/${id}`} className={styles.card}>
      <div className={styles.head}>
        <span className={styles.company}>
          {company}
          {verified ? (
            <span className={styles.seal} title="Tekshirilgan">
              <Icon name="check" size={10} />
            </span>
          ) : null}
        </span>
        {matchPercent != null ? (
          <span className={styles.match}>
            <span className="num">{matchPercent}%</span>
          </span>
        ) : null}
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.meta}>{location}</p>
      <p className={`${styles.salary} num`}>{money}</p>
    </Link>
  );
}
