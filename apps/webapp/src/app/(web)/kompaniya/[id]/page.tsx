"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import {
  type CompanyDetail,
  type CompanyVacancy,
  fetchCompany,
} from "@/lib/companies";
import styles from "./kompaniya.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const FORMAT_LABEL: Record<string, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

function money(min: number | null, max: number | null): string {
  const f = (n: number): string => n.toLocaleString("ru-RU");
  if (!min && !max) return "Kelishilgan";
  if (min && max) return `${f(min)}–${f(max)} so'm`;
  return `${f((min ?? max) as number)} so'm`;
}

export default function KompaniyaDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<{
    company: CompanyDetail;
    vacancies: CompanyVacancy[];
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void fetchCompany(id).then((d) => {
      if (d) setData(d);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <main className={styles.centerState}>
        <p className={styles.emptyTitle}>Kompaniya topilmadi</p>
        <Link href="/kompaniyalar" className={styles.backLink}>
          ← Barcha kompaniyalar
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.wrapper}>
        <div className={styles.skelHead} />
        <div className={styles.skelBody} />
      </main>
    );
  }

  const { company: c, vacancies } = data;

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/kompaniyalar" className={styles.back}>
          ← Kompaniyalar
        </Link>

        <section className={styles.card}>
          <div className={styles.headRow}>
            <span className={styles.logo} aria-hidden="true">
              {c.logoUrl ? (
                <img src={c.logoUrl} alt="" className={styles.logoImg} />
              ) : (
                c.name.charAt(0).toUpperCase()
              )}
            </span>
            <div className={styles.headTexts}>
              <h1 className={styles.name}>
                {c.name}
                {c.verified ? (
                  <span className={styles.seal} title="Tekshirilgan">
                    <Icon name="check" size={13} />
                  </span>
                ) : null}
              </h1>
              <p className={styles.meta}>
                {[c.activity, [c.city, c.district].filter(Boolean).join(", ")]
                  .filter(Boolean)
                  .join(" · ") || "Ish beruvchi"}
              </p>
            </div>
          </div>

          {c.directions.length ? (
            <div className={styles.tags}>
              {c.directions.map((d) => (
                <span key={d} className={styles.tag}>
                  {DIRECTION_LABEL[d] ?? d}
                </span>
              ))}
            </div>
          ) : null}

          {c.about ? <p className={styles.about}>{c.about}</p> : null}
        </section>

        <section className={styles.vacBlock}>
          <h2 className={styles.blockTitle}>
            Ochiq vakansiyalar{" "}
            <span className={`${styles.badge} num`}>{vacancies.length}</span>
          </h2>

          {vacancies.length === 0 ? (
            <p className={styles.empty}>
              Hozircha ochiq vakansiya yo&apos;q.
            </p>
          ) : (
            <div className={styles.vacList}>
              {vacancies.map((v) => (
                <Link
                  key={v.id}
                  href={`/vakansiya/${v.id}`}
                  className={styles.vacRow}
                >
                  <div className={styles.vacMain}>
                    <span className={styles.vacTitle}>{v.title}</span>
                    <span className={styles.vacMeta}>
                      {[
                        DIRECTION_LABEL[v.direction] ?? v.direction,
                        [v.city, v.district].filter(Boolean).join(", "),
                        v.workFormats
                          .map((w) => FORMAT_LABEL[w] ?? w)
                          .join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <span className={`${styles.vacSalary} num`}>
                    {money(v.salaryFrom, v.salaryTo)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
