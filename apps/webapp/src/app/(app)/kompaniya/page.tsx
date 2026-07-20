"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";

import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import { fetchMyVacancies, type MyVacancy } from "@/lib/vacancyMe";
import styles from "./kompaniya.module.css";

const COMPANY = {
  name: "Novatech",
  kind: "IT kompaniya",
  city: "Toshkent",
  about:
    "Mahsulot jamoasi — veb va mobil yechimlar. Yosh, tashabbuskor mutaxassislarni izlaymiz.",
  needed: ["Dasturlash", "Dizayn", "Marketing"],
};

type Tab = "info" | "vacancies";

export default function KompaniyaPage(): JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [vacancies, setVacancies] = useState<MyVacancy[] | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    void fetchMyVacancies().then((v) => {
      if (live) setVacancies(v ?? []);
    });
    return () => {
      live = false;
    };
  }, []);
  useBackButton(() => router.push("/izlovchi/koproq"));

  const vlist = vacancies ?? [];
  const totalCand = vlist.reduce((n, v) => n + v.applications.total, 0);

  return (
    <main className="screen">
      <div className={styles.head}>
        <span className={styles.logo}>{COMPANY.name.charAt(0)}</span>
        <div className={styles.htexts}>
          <h1 className={styles.name}>{COMPANY.name}</h1>
          <p className={styles.sub}>
            {COMPANY.kind} · {COMPANY.city}
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{vlist.length}</span>
          <span className={styles.statLabel}>Vakansiya</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{totalCand}</span>
          <span className={styles.statLabel}>Nomzod</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{COMPANY.needed.length}</span>
          <span className={styles.statLabel}>Yo&apos;nalish</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "info" ? styles.tabOn : ""}`}
          onClick={() => setTab("info")}
        >
          Ma&apos;lumot
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "vacancies" ? styles.tabOn : ""}`}
          onClick={() => setTab("vacancies")}
        >
          Vakansiyalar ({vlist.length})
        </button>
      </div>

      {tab === "info" ? (
        <>
          <Card className={styles.card}>
            <p className={styles.kicker}>Haqida</p>
            <p className={styles.about}>{COMPANY.about}</p>
          </Card>

          <Card className={styles.card}>
            <p className={styles.kicker}>Kerakli yo&apos;nalishlar</p>
            <div className={styles.tags}>
              {COMPANY.needed.map((n) => (
                <span key={n} className={styles.tag}>
                  {n}
                </span>
              ))}
            </div>
          </Card>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              full
              icon={<Icon name="edit" size={20} />}
              onClick={() => router.push("/kompaniya/tahrir")}
            >
              Profilni tahrirlash
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.vlist}>
          {vlist.length === 0 ? (
            <p className={styles.vempty}>
              {vacancies === null
                ? "Yuklanmoqda..."
                : "Hali vakansiya joylamagansiz."}
            </p>
          ) : (
            vlist.map((v) => (
              <button
                key={v.id}
                type="button"
                className={styles.vcard}
                onClick={() => {
                  haptic("light");
                  router.push(`/taklif/${v.id}`);
                }}
              >
                <div className={styles.vtop}>
                  <span className={styles.vtitle}>{v.title}</span>
                  <Icon name="chevron" size={18} className={styles.vchev} />
                </div>
                <span className={styles.vsalary}>
                  {!v.salaryFrom && !v.salaryTo
                    ? "Kelishilgan"
                    : v.salaryFrom && v.salaryTo
                      ? `${formatSalary(v.salaryFrom).replace(" so'm", "")} – ${formatSalary(v.salaryTo)}`
                      : formatSalary((v.salaryFrom ?? v.salaryTo) as number)}
                </span>
                <span className={styles.vmeta}>
                  <Icon name="users" size={14} /> {v.applications.total} nomzod
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </main>
  );
}
