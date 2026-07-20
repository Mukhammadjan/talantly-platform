"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import {
  fetchMyVacancies,
  type MyVacancy,
  type VacancyStatus,
} from "@/lib/vacancyMe";
import styles from "./vakansiyalar.module.css";

const STATUS_LABEL: Record<VacancyStatus, string> = {
  faol: "Faol",
  yopilgan: "Yopilgan",
  qoralama: "Qoralama",
};

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

function salaryText(from: number | null, to: number | null): string {
  if (!from && !to) return "Kelishilgan";
  if (from && to) {
    return `${formatSalary(from).replace(" so'm", "")} – ${formatSalary(to)}`;
  }
  return formatSalary((from ?? to) as number);
}

export default function VakansiyalarPage(): JSX.Element {
  const router = useRouter();
  const [list, setList] = useState<MyVacancy[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const load = useCallback((): void => {
    void fetchMyVacancies().then((v) => setList(v ?? []));
  }, []);

  useEffect(() => {
    initTelegram();
    let live = true;
    void hasSession().then((ok) => {
      if (!live) return;
      setSignedIn(ok);
      if (ok) load();
      else setList([]);
    });
    return () => {
      live = false;
    };
  }, [load]);

  useBackButton(() => router.push("/izlovchi/koproq"));

  return (
    <main className="screen">
      <h1 className={styles.h}>Mening vakansiyalarim</h1>

      <Button
        full
        icon={<Icon name="plus" size={20} />}
        onClick={() => router.push("/izlovchi/vakansiya-yangi")}
      >
        Yangi vakansiya
      </Button>

      {list === null ? (
        <div className={styles.list}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.skel} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<Icon name="doc" size={24} />}
            title={
              signedIn === false
                ? "Avval tizimga kiring"
                : "Hali vakansiya joylamagansiz"
            }
            text={
              signedIn === false
                ? "Vakansiyalaringizni ko'rish uchun profilingizga kiring."
                : "Birinchi vakansiyangizni joylang — tekshirilgan nomzodlar uni ko'radi."
            }
          />
        </div>
      ) : (
        <div className={styles.list}>
          {list.map((v) => (
            <button
              key={v.id}
              type="button"
              className={styles.card}
              onClick={() => {
                haptic("light");
                router.push(`/taklif/${v.id}`);
              }}
            >
              <div className={styles.top}>
                <span className={styles.title}>{v.title}</span>
                <span
                  className={`${styles.badge} ${
                    v.status === "qoralama"
                      ? styles.badgeDraft
                      : v.status === "yopilgan"
                        ? styles.badgeOff
                        : ""
                  }`}
                >
                  {STATUS_LABEL[v.status]}
                </span>
              </div>
              <span className={styles.cat}>
                {DIRECTION_LABEL[v.direction] ?? v.direction}
                {v.city
                  ? ` · ${[v.city, v.district].filter(Boolean).join(", ")}`
                  : ""}
              </span>
              <span className={styles.salary}>
                {salaryText(v.salaryFrom, v.salaryTo)}
              </span>
              <div className={styles.foot}>
                <span className={styles.stat}>
                  <Icon name="users" size={15} /> {v.applications.total} nomzod
                </span>
                {v.applications.fresh > 0 ? (
                  <span className={styles.statNew}>
                    +{v.applications.fresh} yangi
                  </span>
                ) : null}
                <span className={styles.open}>
                  Ko&apos;rish <Icon name="chevron" size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
