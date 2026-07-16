"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { DIRECTION_LABELS, formatSalary } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import { isSavedVacancy, toggleSavedVacancy } from "@/lib/vacancyState";
import type { Direction, Vacancy } from "@/lib/types";
import styles from "./vakansiyalar.module.css";

const LEVEL_TEXT: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
  ikkalasi: "Intern/Mutaxassis",
};

export default function TalantVakansiyalarPage(): JSX.Element {
  const router = useRouter();
  const [list, setList] = useState<Vacancy[] | null>(null);
  const [query, setQuery] = useState("");
  const [dir, setDir] = useState<Direction | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getVacancies().then((v) => {
      if (!live) return;
      setList(v);
      const map: Record<string, boolean> = {};
      v.forEach((x) => {
        map[x.id] = isSavedVacancy(x.id);
      });
      setSaved(map);
    });
    return () => {
      live = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase();
    return list.filter((v) => {
      const mq =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q);
      const md = !dir || v.direction === dir;
      return mq && md;
    });
  }, [list, query, dir]);

  return (
    <main className="screen">
      <h1 className={styles.h}>Vakansiyalar</h1>

      <div className={styles.search}>
        <Icon name="search" size={20} className={styles.sicon} />
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lavozim yoki kompaniya"
        />
      </div>

      <div className={styles.filters}>
        <Chip label="Barchasi" active={dir === null} onClick={() => setDir(null)} />
        {(Object.keys(DIRECTION_LABELS) as Direction[]).map((d) => (
          <Chip
            key={d}
            label={DIRECTION_LABELS[d]}
            active={dir === d}
            onClick={() => setDir(d)}
          />
        ))}
      </div>

      {!list ? (
        <div className={styles.list}>
          <Skeleton height={140} radius={18} />
          <Skeleton height={140} radius={18} />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="briefcase" size={24} />}
          title="Vakansiya topilmadi"
          text="Boshqa so'z yoki yo'nalish bilan qidirib ko'ring."
        />
      ) : (
        <div className={styles.list}>
          <p className={styles.count}>{visible.length} ta vakansiya</p>
          {visible.map((v) => (
            <button
              key={v.id}
              type="button"
              className={styles.card}
              onClick={() => {
                haptic("light");
                router.push(`/vakansiya/${v.id}`);
              }}
            >
              <div className={styles.top}>
                <span className={styles.logo}>{v.company.charAt(0)}</span>
                <span className={styles.htexts}>
                  <span className={styles.company}>{v.company}</span>
                  <span className={styles.loc}>
                    {v.district}, {v.city}
                  </span>
                </span>
                <span
                  className={`${styles.bookmark} ${saved[v.id] ? styles.bookmarkOn : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label="Saqlash"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("light");
                    const now = toggleSavedVacancy(v.id);
                    setSaved((s) => ({ ...s, [v.id]: now }));
                  }}
                >
                  <Icon name="bookmark" size={18} filled={saved[v.id]} />
                </span>
              </div>

              <span className={styles.title}>{v.title}</span>
              <span className={styles.salary}>
                {formatSalary(v.salaryFrom).replace(" so'm", "")}
                {v.salaryTo ? ` – ${formatSalary(v.salaryTo)}` : " so'mdan"}
              </span>

              <div className={styles.tags}>
                <span className={styles.tag}>{LEVEL_TEXT[v.level]}</span>
                {v.workFormats.slice(0, 2).map((f) => (
                  <span key={f} className={styles.tag}>
                    {f === "ofis" ? "Ofis" : f === "masofaviy" ? "Masofaviy" : "Aralash"}
                  </span>
                ))}
                <span className={styles.dirTag}>{DIRECTION_LABELS[v.direction]}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
