"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RegisterSheet } from "@/components/web/RegisterSheet";
import { Icon } from "@/lib/icons";
import { type CandidateView, fetchCandidate } from "@/lib/candidates";
import styles from "./nomzod.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const LEVEL_LABEL: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

function money(min: number | null): string {
  if (!min) return "Kelishilgan";
  return `${min.toLocaleString("ru-RU")} so'm dan`;
}

export default function NomzodDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [c, setC] = useState<CandidateView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    void fetchCandidate(id).then((d) => {
      if (d) setC(d);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <main className={styles.centerState}>
        <p className={styles.emptyTitle}>Nomzod topilmadi</p>
        <Link href="/nomzodlar" className={styles.backLink}>
          ← Barcha nomzodlar
        </Link>
      </main>
    );
  }

  if (!c) {
    return (
      <main className={styles.wrapper}>
        <div className={styles.skel} />
      </main>
    );
  }

  const initial = (c.displayName || "N").charAt(0).toUpperCase();

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/nomzodlar" className={styles.back}>
          ← Nomzodlar
        </Link>

        <section className={styles.card}>
          <div className={styles.headRow}>
            <span className={styles.avatar} aria-hidden="true">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt="" className={styles.avatarImg} />
              ) : (
                initial
              )}
            </span>
            <div className={styles.headTexts}>
              <h1 className={styles.name}>
                {c.displayName}
                {c.verified ? (
                  <span className={styles.seal} title="Tekshirilgan">
                    <Icon name="check" size={13} />
                  </span>
                ) : null}
              </h1>
              <p className={styles.role}>
                {c.role} · {DIRECTION_LABEL[c.direction] ?? c.direction}
              </p>
            </div>
            <span className={`${styles.score} num`} title="Ko'nikma bali">
              {c.score}
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Daraja</span>
              <span className={styles.statValue}>
                {LEVEL_LABEL[c.level] ?? c.level}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Arxetip</span>
              <span className={styles.statValue}>{c.archetype}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Joylashuv</span>
              <span className={styles.statValue}>{c.district || "Toshkent"}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Kutilma</span>
              <span className={`${styles.statValue} num`}>
                {money(c.salaryFrom)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={styles.cta}
            onClick={() => setRegisterOpen(true)}
          >
            <Icon name="lock" size={16} /> Kontaktni ochish
          </button>
          <p className={styles.ctaNote}>
            Nomzod bilan bog&apos;lanish uchun ish beruvchi sifatida
            ro&apos;yxatdan o&apos;ting.
          </p>
        </section>

        {c.skills.length ? (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Ko&apos;nikmalar</h2>
            <div className={styles.tags}>
              {c.skills.map((s) => (
                <span key={s} className={styles.tag}>
                  {s}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {c.about ? (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>O&apos;zi haqida</h2>
            <p className={styles.about}>{c.about}</p>
          </section>
        ) : null}
      </div>

      <RegisterSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Nomzod bilan bog'lanish uchun ro'yxatdan o'ting"
      />
    </main>
  );
}
