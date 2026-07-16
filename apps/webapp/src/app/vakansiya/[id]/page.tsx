"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { DIRECTION_LABELS, formatSalary } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import {
  isAppliedVacancy,
  isSavedVacancy,
  markAppliedVacancy,
  toggleSavedVacancy,
} from "@/lib/vacancyState";
import type { Vacancy } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./vakansiya.module.css";

const LEVEL_TEXT: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
  ikkalasi: "Intern yoki Mutaxassis",
};
const FORMAT_TEXT: Record<string, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

export default function VakansiyaDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [v, setV] = useState<Vacancy | null>(null);
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [demoErr, setDemoErr] = useState(false);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getVacancy(params.id).then((x) => {
      if (!live) return;
      if (x) {
        setV(x);
        setSaved(isSavedVacancy(x.id));
        setApplied(isAppliedVacancy(x.id));
      } else {
        setFailed(true);
      }
    });
    return () => {
      live = false;
    };
  }, [params.id]);
  useBackButton(() => router.back());

  if (failed) {
    return (
      <main className="screen">
        <EmptyState
          icon={<Icon name="briefcase" size={24} />}
          title="Vakansiya topilmadi"
        />
      </main>
    );
  }
  if (!v) {
    return (
      <main className={styles.wrap}>
        <div className={styles.body} />
      </main>
    );
  }

  const apply = (): void => {
    setApplying(true);
    setDemoErr(false);
    void api.applyVacancy(v.id).then((r) => {
      setApplying(false);
      if (r.ok) {
        haptic("success");
        markAppliedVacancy(v.id);
        setApplied(true);
      } else if (r.demo) {
        haptic("error");
        setDemoErr(true);
      } else {
        haptic("error");
      }
    });
  };

  return (
    <main className={styles.wrap}>
      <div className={styles.body}>
        <div className={styles.head}>
          <h1 className={styles.title}>{v.title}</h1>
          <button
            type="button"
            className={`${styles.bookmark} ${saved ? styles.bookmarkOn : ""}`}
            aria-label="Saqlash"
            onClick={() => {
              haptic("light");
              setSaved(toggleSavedVacancy(v.id));
              void api.toggleSaveRemote("vacancy", v.id);
            }}
          >
            <Icon name="bookmark" size={20} filled={saved} />
          </button>
        </div>
        <p className={styles.category}>{DIRECTION_LABELS[v.direction]}</p>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Daraja:</span>
            <span className={styles.infoValue}>{LEVEL_TEXT[v.level]}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Ish formati:</span>
            <span className={styles.infoValue}>
              {v.workFormats.map((f) => FORMAT_TEXT[f]).join(", ")}
            </span>
          </div>
        </div>

        <div className={styles.companyCard}>
          <span className={styles.logo}>{v.company.charAt(0)}</span>
          <span className={styles.ctexts}>
            <span className={styles.cname}>{v.company}</span>
            <span className={styles.cloc}>
              {v.district} tumani, {v.city}
            </span>
          </span>
        </div>

        <div className={styles.salaryCard}>
          <span className={styles.salaryIcon}>
            <Icon name="doc" size={18} />
          </span>
          <span className={styles.salary}>
            {formatSalary(v.salaryFrom).replace(" so'm", "")}
            {v.salaryTo ? ` – ${formatSalary(v.salaryTo)}` : " so'mdan"}
          </span>
        </div>

        <section className={styles.section}>
          <h2 className={styles.skicker}>Vazifalar</h2>
          <ul className={styles.ul}>
            {v.description.map((d) => (
              <li key={d} className={styles.li}>
                {d}
              </li>
            ))}
          </ul>
        </section>

        {v.requirements.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.skicker}>Talablar</h2>
            <ul className={styles.ul}>
              {v.requirements.map((r) => (
                <li key={r} className={styles.li}>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className={styles.cta}>
        {demoErr ? (
          <p className={styles.demoBar}>Bu demo vakansiya — ariza yuborilmaydi.</p>
        ) : null}
        {applied ? (
          <p className={styles.pending}>
            <Icon name="check" size={18} />
            Arizangiz yuborildi — kompaniya ko&apos;rib chiqadi
          </p>
        ) : (
          <Button
            full
            loading={applying}
            icon={<Icon name="send" size={20} />}
            onClick={apply}
          >
            Ariza berish
          </Button>
        )}
      </div>
    </main>
  );
}
