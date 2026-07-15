"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { CANDIDATES } from "@/mock/data";
import { initTelegram } from "@/lib/telegram";
import styles from "./doskam.module.css";

const TABS = ["Yangi", "Ko'rilgan", "Bog'langan", "Yopilgan"];

export default function DoskamPage(): JSX.Element {
  const [tab, setTab] = useState(0);
  useEffect(() => {
    initTelegram();
  }, []);

  const items =
    tab === 0
      ? CANDIDATES.slice(0, 3)
      : tab === 1
        ? CANDIDATES.slice(0, 2)
        : tab === 2
          ? CANDIDATES.slice(0, 1)
          : [];

  return (
    <main className="screen">
      <h1 className={styles.h}>Doskam</h1>
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <Chip key={t} label={t} active={tab === i} onClick={() => setTab(i)} />
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon name="board" size={24} />}
          title="Bu bosqichda nomzod yo'q"
        />
      ) : (
        <div className={styles.list}>
          {items.map((c) => (
            <div key={c.id} className={styles.item}>
              <Avatar name={c.displayName} size={40} />
              <div className={styles.texts}>
                <span className={styles.name}>{c.displayName}</span>
                <span className={styles.role}>{c.role}</span>
              </div>
              <Icon name="chevron" size={18} className={styles.chev} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
