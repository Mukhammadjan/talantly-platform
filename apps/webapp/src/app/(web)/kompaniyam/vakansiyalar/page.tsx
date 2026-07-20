"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import {
  fetchMyVacancies,
  updateVacancy,
  type MyVacancy,
  type VacancyStatus,
} from "@/lib/vacancyMe";
import styles from "./vakansiyalarim.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const STATUS_LABEL: Record<VacancyStatus, string> = {
  faol: "Faol",
  yopilgan: "Yopilgan",
  qoralama: "Qoralama",
};

const TABS: { key: "all" | VacancyStatus; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "faol", label: "Faol" },
  { key: "yopilgan", label: "Yopilgan" },
  { key: "qoralama", label: "Qoralama" },
];

function money(from: number | null, to: number | null): string {
  const f = (n: number): string => n.toLocaleString("ru-RU");
  if (!from && !to) return "Kelishilgan";
  if (from && to) return `${f(from)}–${f(to)} so'm`;
  return `${f((from ?? to) as number)} so'm`;
}

export default function VakansiyalarimPage(): JSX.Element {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [list, setList] = useState<MyVacancy[] | null>(null);
  const [tab, setTab] = useState<"all" | VacancyStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback((): void => {
    void fetchMyVacancies().then((v) => setList(v ?? []));
  }, []);

  useEffect(() => {
    let live = true;
    void hasSession().then((ok) => {
      if (!live) return;
      setSignedIn(ok);
      setChecked(true);
      if (ok) load();
    });
    return () => {
      live = false;
    };
  }, [load]);

  const setStatus = async (
    v: MyVacancy,
    status: VacancyStatus,
  ): Promise<void> => {
    setBusyId(v.id);
    setErr(null);
    const r = await updateVacancy(v.id, { status });
    setBusyId(null);
    if (!r.ok) {
      setErr(
        r.error === "vacancy_limit"
          ? "Obunasiz faqat 1 ta faol vakansiya bo'ladi. Avval boshqasini yoping."
          : "Holatni o'zgartirib bo'lmadi.",
      );
      return;
    }
    load();
  };

  if (checked && !signedIn) {
    return (
      <main className={styles.centerState}>
        <span className={styles.guestIcon} aria-hidden="true">
          <Icon name="briefcase" size={26} />
        </span>
        <h1 className={styles.guestTitle}>Mening vakansiyalarim</h1>
        <p className={styles.guestText}>
          Vakansiyalarni boshqarish uchun ish beruvchi sifatida tizimga kiring.
        </p>
        <Link href="/kirish" className={styles.guestBtn}>
          Kirish
        </Link>
      </main>
    );
  }

  const shown = (list ?? []).filter((v) => tab === "all" || v.status === tab);

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <nav className={styles.crumbs} aria-label="Yo'l">
              <Link href="/kompaniyam" className={styles.crumb}>
                Kompaniya kabineti
              </Link>
              <span aria-hidden="true">/</span>
              <span>Vakansiyalar</span>
            </nav>
            <h1 className={styles.title}>Mening vakansiyalarim</h1>
          </div>
          <Link href="/kompaniyam/vakansiyalar/yangi" className={styles.newBtn}>
            <Icon name="plus" size={18} /> Yangi vakansiya
          </Link>
        </header>

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => {
            const n =
              t.key === "all"
                ? (list ?? []).length
                : (list ?? []).filter((v) => v.status === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabOn : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {list ? <span className={`${styles.tabNum} num`}>{n}</span> : null}
              </button>
            );
          })}
        </div>

        {err ? <p className={styles.error}>{err}</p> : null}

        {list === null ? (
          <div className={styles.list}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skel} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <Icon name="doc" size={24} />
            </span>
            <p className={styles.emptyTitle}>
              {list.length === 0
                ? "Hali vakansiya joylamagansiz"
                : "Bu bo'limda vakansiya yo'q"}
            </p>
            {list.length === 0 ? (
              <>
                <p className={styles.emptyText}>
                  Birinchi vakansiyangizni joylang — tekshirilgan nomzodlar uni
                  ko&apos;radi va ariza yuboradi.
                </p>
                <Link
                  href="/kompaniyam/vakansiyalar/yangi"
                  className={styles.newBtn}
                >
                  <Icon name="plus" size={18} /> Yangi vakansiya
                </Link>
              </>
            ) : null}
          </div>
        ) : (
          <div className={styles.list}>
            {shown.map((v) => (
              <article key={v.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <Link
                      href={`/kompaniyam/vakansiyalar/${v.id}`}
                      className={styles.cardTitle}
                    >
                      {v.title}
                    </Link>
                    <span
                      className={`${styles.badge} ${
                        v.status === "faol"
                          ? styles.badgeOn
                          : v.status === "qoralama"
                            ? styles.badgeDraft
                            : styles.badgeOff
                      }`}
                    >
                      {STATUS_LABEL[v.status]}
                    </span>
                  </div>
                  <p className={styles.meta}>
                    {DIRECTION_LABEL[v.direction] ?? v.direction}
                    {" · "}
                    {[v.city, v.district].filter(Boolean).join(", ")}
                  </p>
                  <p className={styles.salary}>{money(v.salaryFrom, v.salaryTo)}</p>
                </div>

                <Link
                  href={`/kompaniyam/vakansiyalar/${v.id}#arizalar`}
                  className={styles.appsBox}
                >
                  <span className={`${styles.appsNum} num`}>
                    {v.applications.total}
                  </span>
                  <span className={styles.appsLabel}>ariza</span>
                  {v.applications.fresh > 0 ? (
                    <span className={styles.fresh}>
                      +{v.applications.fresh} yangi
                    </span>
                  ) : null}
                </Link>

                <div className={styles.cardActions}>
                  <Link
                    href={`/kompaniyam/vakansiyalar/${v.id}`}
                    className={styles.actionGhost}
                  >
                    Tahrirlash
                  </Link>
                  {v.status === "faol" ? (
                    <button
                      type="button"
                      className={styles.actionGhost}
                      disabled={busyId === v.id}
                      onClick={() => void setStatus(v, "yopilgan")}
                    >
                      Yopish
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.actionPrimary}
                      disabled={busyId === v.id}
                      onClick={() => void setStatus(v, "faol")}
                    >
                      Faollashtirish
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
