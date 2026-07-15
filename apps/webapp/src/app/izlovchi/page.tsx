"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CandidateCard } from "@/components/CandidateCard";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { DIRECTION_LABELS } from "@/lib/labels";
import { initTelegram } from "@/lib/telegram";
import type { Candidate, Direction } from "@/lib/types";
import styles from "./nomzodlar.module.css";

export default function NomzodlarPage(): JSX.Element {
  const router = useRouter();
  const [list, setList] = useState<Candidate[] | null>(null);
  const [query, setQuery] = useState("");
  const [dir, setDir] = useState<Direction | null>(null);

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
      return mq && md;
    });
  }, [list, query, dir]);

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

      <div className={styles.search}>
        <Icon name="search" size={20} className={styles.sicon} />
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism, kasb yoki ko'nikma"
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
    </main>
  );
}
