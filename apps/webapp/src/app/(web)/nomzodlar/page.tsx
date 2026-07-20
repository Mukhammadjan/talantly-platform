"use client";

import { useCallback, useEffect, useState } from "react";
import { CandidateCard } from "@/components/web/CandidateCard";
import { Icon } from "@/lib/icons";
import { type CandidateView, fetchCandidates } from "@/lib/candidates";
import styles from "./nomzodlar.module.css";

const DIRECTIONS = [
  { key: "", label: "Barchasi" },
  { key: "dasturlash", label: "Dasturlash" },
  { key: "dizayn", label: "Dizayn" },
  { key: "marketing", label: "Marketing" },
  { key: "sotuv", label: "Sotuv" },
  { key: "data", label: "Data" },
];

const SORTS: { key: "score" | "recent"; label: string }[] = [
  { key: "score", label: "Ball bo'yicha" },
  { key: "recent", label: "Avval yangilari" },
];

export default function NomzodlarPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [direction, setDirection] = useState("");
  const [sort, setSort] = useState<"score" | "recent">("score");
  const [list, setList] = useState<CandidateView[] | null>(null);

  const load = useCallback((): void => {
    setList(null);
    void fetchCandidates({
      direction: direction || null,
      search: applied || null,
      sort,
    }).then(setList);
  }, [direction, applied, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Nomzodlar</h1>
          <p className={styles.sub}>
            Tekshirilgan talantlar — ko&apos;nikma bali, arxetip va yo&apos;nalish
            bilan.
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
              placeholder="Ism, kasb yoki ko'nikma"
              aria-label="Nomzod qidirish"
            />
          </form>
          <div className={styles.sortRow}>
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`${styles.sortBtn} ${sort === s.key ? styles.sortOn : ""}`}
                onClick={() => setSort(s.key)}
                aria-pressed={sort === s.key}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

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

        <p className={styles.count}>
          {list === null ? (
            "Yuklanmoqda..."
          ) : (
            <>
              <span className="num">{list.length}</span> ta nomzod
            </>
          )}
        </p>

        {list === null ? (
          <div className={styles.grid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className={styles.empty}>
            Nomzod topilmadi. Filtrlarni o&apos;zgartirib ko&apos;ring.
          </p>
        ) : (
          <div className={styles.grid}>
            {list.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
