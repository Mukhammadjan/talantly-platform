"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";
import { SENT_VACANCIES } from "@/mock/data";
import { haptic, initTelegram } from "@/lib/telegram";
import type { SentStatus } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./taklif.module.css";

type Tab = "all" | "accepted" | "declined";

export default function TaklifPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/doskam"));

  const v = SENT_VACANCIES.find((x) => x.id === params.id) ?? SENT_VACANCIES[0];
  if (!v) {
    return (
      <main className="screen">
        <EmptyState icon={<Icon name="doc" size={24} />} title="Taklif topilmadi" />
      </main>
    );
  }

  const accepted = v.candidates.filter((c) => c.status === "accepted");
  const declined = v.candidates.filter((c) => c.status === "declined");
  const shown =
    tab === "accepted" ? accepted : tab === "declined" ? declined : v.candidates;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "Hammasi", count: v.candidates.length },
    { key: "accepted", label: "Qabul qilingan", count: accepted.length },
    { key: "declined", label: "Rad etilgan", count: declined.length },
  ];

  const statusPill = (s: SentStatus): JSX.Element | null => {
    if (s === "accepted")
      return <span className={`${styles.pill} ${styles.pGreen}`}>Qabul qilingan</span>;
    if (s === "declined")
      return <span className={`${styles.pill} ${styles.pRed}`}>Rad etilgan</span>;
    return <span className={`${styles.pill} ${styles.pGray}`}>Kutilmoqda</span>;
  };

  return (
    <main className="screen">
      <button
        type="button"
        className={styles.edit}
        onClick={() => haptic("light")}
        aria-label="Tahrirlash"
      >
        <Icon name="edit" size={20} />
      </button>

      <h1 className={styles.title}>{v.title}</h1>
      <p className={styles.category}>{v.category}</p>

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Ish tajribasi:</span>
          <span className={styles.infoValue}>{v.experience}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Bandlik turi:</span>
          <span className={styles.infoValue}>{v.employment}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Maosh:</span>
          <span className={styles.infoValue}>
            {formatSalary(v.salaryFrom).replace(" so'm", "")} – {formatSalary(v.salaryTo)}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabOn : ""}`}
            onClick={() => {
              haptic("light");
              setTab(t.key);
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={<Icon name="users" size={24} />} title="Bu bo'limda nomzod yo'q" />
      ) : (
        <div className={styles.list}>
          {shown.map((c, i) => (
            <button
              key={`${c.cid}-${i}`}
              type="button"
              className={styles.card}
              onClick={() => {
                haptic("light");
                router.push(`/nomzod/${c.cid}`);
              }}
            >
              <div className={styles.top}>
                <Avatar name={c.name} size={40} />
                <span className={styles.name}>
                  {c.name}
                  {c.verified && (
                    <span className={styles.seal}>
                      <Icon name="check" size={10} />
                    </span>
                  )}
                </span>
                {statusPill(c.status)}
              </div>
              <div className={styles.mid}>
                <span className={styles.role}>{c.role}</span>
                <span className={styles.date}>{v.date}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statItem}>
                  Yosh: <b>{c.age}</b>
                </span>
                <span className={styles.statItem}>
                  Tajriba: <b>{c.exp} yil</b>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
