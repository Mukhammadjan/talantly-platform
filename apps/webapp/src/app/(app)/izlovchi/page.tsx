"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CandidateCard } from "@/components/CandidateCard";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Sheet } from "@/components/Sheet";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { DIRECTION_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { initTelegram } from "@/lib/telegram";
import type { Candidate, Direction, Level } from "@/lib/types";
import styles from "./nomzodlar.module.css";

const SALARY_STEPS = [
  { label: "4 mln+", value: 4000000 },
  { label: "6 mln+", value: 6000000 },
  { label: "8 mln+", value: 8000000 },
];

export default function NomzodlarPage(): JSX.Element {
  const router = useRouter();
  const [list, setList] = useState<Candidate[] | null>(null);
  const [query, setQuery] = useState("");
  const [dir, setDir] = useState<Direction | null>(null);

  // Kengaytirilgan filtr
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [minSalary, setMinSalary] = useState<number | null>(null);
  const [district, setDistrict] = useState<string | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getCandidates().then((c) => {
      if (live) setList(c);
    });
    return () => {
      live = false;
    };
  }, []);

  const districts = useMemo(
    () => Array.from(new Set((list ?? []).map((c) => c.district))),
    [list],
  );

  const activeCount = (level ? 1 : 0) + (minSalary ? 1 : 0) + (district ? 1 : 0);

  const visible = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      const mq =
        !q ||
        c.displayName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const md = !dir || c.direction === dir;
      const ml = !level || c.level === level;
      const ms = !minSalary || (c.salaryFrom ?? 0) >= minSalary;
      const mt = !district || c.district === district;
      return mq && md && ml && ms && mt;
    });
  }, [list, query, dir, level, minSalary, district]);

  const reset = (): void => {
    setLevel(null);
    setMinSalary(null);
    setDistrict(null);
  };

  return (
    <main className="screen">
      <div className={styles.head}>
        <h1 className={styles.h}>Nomzodlar</h1>
        <button
          type="button"
          className={styles.mapBtn}
          onClick={() => router.push("/xarita")}
        >
          <Icon name="map" size={18} />
          Xarita
        </button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.search}>
          <Icon name="search" size={20} className={styles.sicon} />
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ism, kasb yoki ko'nikma"
          />
        </div>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setOpen(true)}
          aria-label="Filtr"
        >
          <Icon name="filter" size={20} />
          {activeCount > 0 ? <span className={styles.badge}>{activeCount}</span> : null}
        </button>
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
          <Skeleton height={128} radius={18} />
          <Skeleton height={128} radius={18} />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" size={24} />}
          title="Nomzod topilmadi"
          text="Boshqa so'z yoki filtr bilan qidirib ko'ring."
        />
      ) : (
        <div className={styles.list}>
          <p className={styles.count}>{visible.length} ta nomzod</p>
          {visible.map((c) => (
            <CandidateCard key={c.id} c={c} />
          ))}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Filtr">
        <div className={styles.fsection}>
          <p className={styles.flabel}>Daraja</p>
          <div className={styles.frow}>
            <Chip label="Barchasi" active={level === null} onClick={() => setLevel(null)} />
            {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
              <Chip
                key={l}
                label={LEVEL_LABELS[l]}
                active={level === l}
                onClick={() => setLevel(l)}
              />
            ))}
          </div>
        </div>

        <div className={styles.fsection}>
          <p className={styles.flabel}>Maosh</p>
          <div className={styles.frow}>
            <Chip
              label="Barchasi"
              active={minSalary === null}
              onClick={() => setMinSalary(null)}
            />
            {SALARY_STEPS.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                active={minSalary === s.value}
                onClick={() => setMinSalary(s.value)}
              />
            ))}
          </div>
        </div>

        <div className={styles.fsection}>
          <p className={styles.flabel}>Tuman</p>
          <div className={styles.frow}>
            <Chip
              label="Barchasi"
              active={district === null}
              onClick={() => setDistrict(null)}
            />
            {districts.map((d) => (
              <Chip key={d} label={d} active={district === d} onClick={() => setDistrict(d)} />
            ))}
          </div>
        </div>

        <div className={styles.factions}>
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Tozalash
          </button>
          <button type="button" className={styles.applyBtn} onClick={() => setOpen(false)}>
            Qo&apos;llash ({visible.length})
          </button>
        </div>
      </Sheet>
    </main>
  );
}
