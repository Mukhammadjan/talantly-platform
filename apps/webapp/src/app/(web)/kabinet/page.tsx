"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { hasSession } from "@/lib/auth";
import {
  type Application,
  type MeSnapshot,
  fetchApplications,
  fetchMe,
} from "@/lib/me";
import styles from "./kabinet.module.css";

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
  ikkalasi: "Barcha",
};

const STATUS_LABEL: Record<string, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumot to'ldirilgan",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov tasdiqlangan",
  cv_tayyor: "CV tayyor",
  test_otgan: "Test o'tgan",
  suhbat_belgilangan: "Suhbat belgilangan",
  tekshirilgan: "Tekshirilgan",
  band: "Band",
  rad_etilgan: "Rad etilgan",
};

const RANK: Record<string, number> = {
  yangi: 0,
  malumot_toldirilgan: 1,
  tolov_kutilmoqda: 1,
  tolov_tasdiqlangan: 2,
  cv_tayyor: 2,
  test_otgan: 3,
  suhbat_belgilangan: 4,
  tekshirilgan: 5,
  band: 5,
};

const STEPS = [
  { label: "Ma'lumot", rank: 1 },
  { label: "AI CV", rank: 2 },
  { label: "Ko'nikma testi", rank: 3 },
  { label: "Suhbat", rank: 4 },
  { label: "Tekshirilgan", rank: 5 },
];

const APP_STATUS: Record<string, { label: string; tone: string }> = {
  yangi: { label: "Yuborildi", tone: "neutral" },
  korildi: { label: "Ko'rildi", tone: "info" },
  koorildi: { label: "Ko'rildi", tone: "info" },
  qabul: { label: "Qabul qilindi", tone: "good" },
  qabul_qilindi: { label: "Qabul qilindi", tone: "good" },
  rad: { label: "Rad etildi", tone: "bad" },
  rad_etildi: { label: "Rad etildi", tone: "bad" },
};

function appStatus(s: string): { label: string; tone: string } {
  return APP_STATUS[s] ?? { label: s, tone: "neutral" };
}

function dateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function KabinetPage(): JSX.Element {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [me, setMe] = useState<MeSnapshot | null>(null);
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    let live = true;
    void hasSession().then((ok) => {
      if (!live) return;
      setSignedIn(ok);
      setChecked(true);
      if (ok) {
        void fetchMe().then((m) => live && setMe(m));
        void fetchApplications().then((a) => live && setApps(a));
      }
    });
    return () => {
      live = false;
    };
  }, []);

  // Guest — kirish taklifi.
  if (checked && !signedIn) {
    return (
      <main className={styles.centerState}>
        <span className={styles.guestIcon} aria-hidden="true">
          <Icon name="user" size={26} />
        </span>
        <h1 className={styles.guestTitle}>Kabinetga kirish</h1>
        <p className={styles.guestText}>
          Profilingiz, tekshiruv holatingiz va arizalaringizni ko&apos;rish
          uchun tizimga kiring.
        </p>
        <Link href="/kirish" className={styles.guestBtn}>
          Kirish
        </Link>
      </main>
    );
  }

  if (!checked || !me) {
    return (
      <main className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.skelHero} />
          <div className={styles.skelBlock} />
        </div>
      </main>
    );
  }

  const p = me.profile;
  const rank = RANK[me.status] ?? 0;
  const verified = me.status === "tekshirilgan" || me.status === "band";
  const rejected = me.status === "rad_etilgan";
  const initial = (p.fullName || "T").charAt(0).toUpperCase();

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        {/* Hero */}
        <section className={styles.hero}>
          <span className={styles.avatar} aria-hidden="true">
            {initial}
          </span>
          <div className={styles.heroText}>
            <h1 className={styles.name}>
              {p.fullName || "Profil"}
              {verified ? (
                <span className={styles.seal} title="Tekshirilgan">
                  <Icon name="check" size={13} />
                </span>
              ) : null}
            </h1>
            <p className={styles.heroMeta}>
              {[
                p.direction ? DIRECTION_LABEL[p.direction] ?? p.direction : "",
                p.level ? LEVEL_LABEL[p.level] ?? p.level : "",
                p.city ?? "",
              ]
                .filter(Boolean)
                .join(" · ") || "Ma'lumot to'ldirilmagan"}
            </p>
          </div>
          <Link href="/profil-forma" className={styles.editBtn}>
            <Icon name="edit" size={16} /> Tahrirlash
          </Link>
        </section>

        {/* Tekshiruv yo'li */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Tekshiruv yo&apos;li</h2>
            <span
              className={`${styles.statusPill} ${rejected ? styles.pillBad : verified ? styles.pillGood : styles.pillWarn}`}
            >
              {STATUS_LABEL[me.status] ?? me.status}
            </span>
          </div>
          {rejected ? (
            <p className={styles.rejected}>
              Afsuski, tekshiruvdan o&apos;tmadingiz. Qayta urinish uchun
              profilingizni yangilab, botда davom eting.
            </p>
          ) : (
            <ol className={styles.steps}>
              {STEPS.map((s, i) => {
                const done = rank >= s.rank;
                const current = !done && rank >= s.rank - 1;
                return (
                  <li
                    key={s.label}
                    className={`${styles.step} ${done ? styles.stepDone : current ? styles.stepCurrent : ""}`}
                  >
                    <span className={styles.stepDot}>
                      {done ? <Icon name="check" size={12} /> : i + 1}
                    </span>
                    <span className={styles.stepLabel}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Statistika */}
        <section className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Ko&apos;nikma testi</span>
            <span className={`${styles.statValue} num`}>
              {me.score != null ? `${me.score}%` : "—"}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Arxetip</span>
            <span className={styles.statValue}>{me.archetype ?? "—"}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>AI CV</span>
            <span className={styles.statValue}>
              {me.cvReady ? "Tayyor" : "Tayyor emas"}
            </span>
          </div>
        </section>

        {/* Profil ma'lumotlari */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Profil</h2>
          {p.skills.length ? (
            <div className={styles.skills}>
              {p.skills.map((s) => (
                <span key={s} className={styles.skill}>
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          {p.about ? <p className={styles.about}>{p.about}</p> : null}
          {!p.skills.length && !p.about ? (
            <p className={styles.muted}>
              Profil to&apos;ldirilmagan.{" "}
              <Link href="/profil-forma" className={styles.inlineLink}>
                To&apos;ldirish
              </Link>
            </p>
          ) : null}
        </section>

        {/* Arizalarim */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Arizalarim</h2>
            <span className={`${styles.badge} num`}>{apps.length}</span>
          </div>
          {apps.length === 0 ? (
            <p className={styles.muted}>
              Hali ariza yubormadingiz.{" "}
              <Link href="/vakansiyalar" className={styles.inlineLink}>
                Vakansiyalarni ko&apos;rish
              </Link>
            </p>
          ) : (
            <div className={styles.appList}>
              {apps.map((a) => {
                const st = appStatus(a.status);
                const row = (
                  <>
                    <div className={styles.appMain}>
                      <span className={styles.appTitle}>{a.vacancyTitle}</span>
                      <span className={styles.appMeta}>
                        {a.company} · {dateShort(a.createdAt)}
                      </span>
                    </div>
                    <span
                      className={`${styles.appStatus} ${styles[`tone_${st.tone}`] ?? ""}`}
                    >
                      {st.label}
                    </span>
                  </>
                );
                return a.vacancyId ? (
                  <Link
                    key={a.id}
                    href={`/vakansiya/${a.vacancyId}`}
                    className={styles.appRow}
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={a.id} className={styles.appRow}>
                    {row}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
