"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";
import { SENT_VACANCIES } from "@/mock/data";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./vakansiyalar.module.css";

export default function VakansiyalarPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/koproq"));

  return (
    <main className="screen">
      <h1 className={styles.h}>Mening vakansiyalarim</h1>

      <Button
        full
        icon={<Icon name="plus" size={20} />}
        onClick={() => router.push("/vakansiya/yangi")}
      >
        Yangi vakansiya
      </Button>

      <div className={styles.list}>
        {SENT_VACANCIES.map((v) => {
          const accepted = v.candidates.filter((c) => c.status === "accepted").length;
          return (
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
                <span className={styles.badge}>Faol</span>
              </div>
              <span className={styles.cat}>{v.category}</span>
              <span className={styles.salary}>
                {formatSalary(v.salaryFrom).replace(" so'm", "")} – {formatSalary(v.salaryTo)}
              </span>
              <div className={styles.foot}>
                <span className={styles.stat}>
                  <Icon name="users" size={15} /> {v.candidates.length} nomzod
                </span>
                <span className={styles.statOk}>
                  <Icon name="check" size={15} /> {accepted} qabul
                </span>
                <span className={styles.open}>
                  Ko&apos;rish <Icon name="chevron" size={14} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
