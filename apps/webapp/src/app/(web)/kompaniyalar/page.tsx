"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanyCard } from "@/components/web/CompanyCard";
import { Icon } from "@/lib/icons";
import { type CompanyView, fetchCompanies } from "@/lib/companies";
import styles from "./kompaniyalar.module.css";

const DIRECTIONS: { key: string; label: string }[] = [
  { key: "", label: "Barchasi" },
  { key: "dasturlash", label: "Dasturlash" },
  { key: "dizayn", label: "Dizayn" },
  { key: "marketing", label: "Marketing" },
  { key: "sotuv", label: "Sotuv" },
  { key: "data", label: "Data" },
];

export default function KompaniyalarPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [direction, setDirection] = useState("");
  const [list, setList] = useState<CompanyView[] | null>(null);

  const load = useCallback((): void => {
    setList(null);
    void fetchCompanies({
      direction: direction || null,
      search: applied || null,
    }).then(setList);
  }, [direction, applied]);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(() => list?.length ?? 0, [list]);

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Kompaniyalar</h1>
          <p className={styles.sub}>
            Tekshirilgan ish beruvchilar va ularning ochiq vakansiyalari.
          </p>
        </header>

        <div className={styles.controls}>
          <form
            className={styles.searchBox}
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(query.trim());
            }}
          >
            <Icon name="search" size={18} />
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kompaniya nomi yoki faoliyat turi"
              aria-label="Kompaniya qidirish"
            />
          </form>
          <div className={styles.chips} role="group" aria-label="Yo'nalish">
            {DIRECTIONS.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`${styles.chip} ${direction === d.key ? styles.chipOn : ""}`}
                onClick={() => setDirection(d.key)}
                aria-pressed={direction === d.key}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>
          {list === null ? (
            "Yuklanmoqda..."
          ) : (
            <>
              <span className="num">{total}</span> ta kompaniya
            </>
          )}
        </p>

        {list === null ? (
          <div className={styles.grid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : total === 0 ? (
          <p className={styles.empty}>
            Kompaniya topilmadi. Qidiruvni o&apos;zgartirib ko&apos;ring.
          </p>
        ) : (
          <div className={styles.grid}>
            {list.map((c) => (
              <CompanyCard
                key={c.id}
                id={c.id}
                name={c.name}
                verified={c.verified}
                logoUrl={c.logoUrl}
                activity={c.activity}
                city={c.city}
                directions={c.directions}
                openVacancies={c.openVacancies}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
