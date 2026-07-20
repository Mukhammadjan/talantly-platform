import Link from "next/link";
import { Icon } from "@/lib/icons";
import styles from "./CompanyCard.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

export function CompanyCard({
  id,
  name,
  verified,
  logoUrl,
  activity,
  city,
  directions,
  openVacancies,
}: {
  id: string;
  name: string;
  verified: boolean;
  logoUrl: string | null;
  activity: string;
  city: string;
  directions: string[];
  openVacancies: number;
}): JSX.Element {
  return (
    <Link href={`/kompaniya/${id}`} className={styles.card}>
      <div className={styles.head}>
        <span className={styles.logo} aria-hidden="true">
          {logoUrl ? (
            <img src={logoUrl} alt="" className={styles.logoImg} />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </span>
        <div className={styles.titles}>
          <span className={styles.name}>
            {name}
            {verified ? (
              <span className={styles.seal} title="Tekshirilgan">
                <Icon name="check" size={11} />
              </span>
            ) : null}
          </span>
          {activity || city ? (
            <span className={styles.meta}>
              {[activity, city].filter(Boolean).join(" · ")}
            </span>
          ) : null}
        </div>
      </div>

      {directions.length ? (
        <div className={styles.tags}>
          {directions.slice(0, 3).map((d) => (
            <span key={d} className={styles.tag}>
              {DIRECTION_LABEL[d] ?? d}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.foot}>
        <span className={styles.count}>
          {openVacancies > 0 ? (
            <>
              <span className="num">{openVacancies}</span> ta ochiq vakansiya
            </>
          ) : (
            "Hozircha ochiq vakansiya yo'q"
          )}
        </span>
        <span className={styles.link}>Ko&apos;rish →</span>
      </div>
    </Link>
  );
}
