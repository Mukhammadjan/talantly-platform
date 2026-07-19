"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MatchBreakdownModal } from "@/components/web/MatchBreakdownModal";
import { MatchScoreCard } from "@/components/web/MatchScoreCard";
import { RecoCard } from "@/components/web/RecoCard";
import { StatRow } from "@/components/web/StatRow";
import { Icon } from "@/lib/icons";
import { computeMatch, type MatchProfile, type MatchResult } from "@/lib/match";
import { authedFetch } from "@/lib/auth";
import {
  fetchMatchProfile,
  fetchVacancy,
  toMatchVacancy,
  type VacancyView,
} from "@/lib/vacancies";
import styles from "./vakansiya.module.css";

const FORMAT_LABEL: Record<string, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

function money(min: number | null, max: number | null, cur = "so'm"): string {
  const f = (n: number): string => n.toLocaleString("ru-RU");
  if (!min && !max) return "Kelishilgan";
  if (min && max) return `${f(min)}–${f(max)} ${cur}`;
  return `${f((min ?? max) as number)} ${cur}`;
}

export default function VakansiyaDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<{
    vacancy: VacancyView;
    recommendations: VacancyView[];
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    void fetchVacancy(id).then((d) => {
      if (d) setData(d);
      else setNotFound(true);
    });
    void fetchMatchProfile().then(setProfile);
  }, [id]);

  const match: MatchResult | null = data
    ? computeMatch(profile, toMatchVacancy(data.vacancy))
    : null;

  const apply = async (): Promise<void> => {
    if (!profile) {
      router.push("/kirish");
      return;
    }
    const res = await authedFetch("/api/vacancies/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vacancyId: id }),
    }).catch(() => null);
    if (res && (res.ok || res.status === 409)) setApplied(true);
    else router.push("/kirish");
  };

  if (notFound) {
    return (
      <main className={styles.centerState}>
        <p className={styles.emptyTitle}>Vakansiya topilmadi</p>
        <Link href="/vakansiyalar" className={styles.backLink}>
          ← Barcha vakansiyalar
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.wrap}>
        <div className={styles.grid}>
          <div className={styles.skelMain} />
          <div className={styles.skelSide} />
        </div>
      </main>
    );
  }

  const v = data.vacancy;

  return (
    <main className={styles.wrap}>
      <div className={styles.grid}>
        {/* Chap: kontent */}
        <div className={styles.content}>
          <Link href="/vakansiyalar" className={styles.back}>
            ← Vakansiyalar
          </Link>

          <div className={styles.headRow}>
            <span className={styles.logo} aria-hidden="true">
              {v.logoUrl ? (
                <img src={v.logoUrl} alt="" className={styles.logoImg} />
              ) : (
                v.company.charAt(0).toUpperCase()
              )}
            </span>
            <div className={styles.headTexts}>
              <span className={styles.company}>
                {v.company}
                {v.verified ? (
                  <span className={styles.seal} title="Tekshirilgan">
                    <Icon name="check" size={12} />
                  </span>
                ) : null}
              </span>
              <h1 className={styles.title}>{v.title}</h1>
            </div>
            <button type="button" className={styles.iconBtn} aria-label="Saqlash">
              <Icon name="bookmark" size={20} />
            </button>
          </div>

          <p className={styles.meta}>
            {[
              "To'liq stavka",
              [v.city, v.district].filter(Boolean).join(", "),
              v.workFormats.map((w) => FORMAT_LABEL[w] ?? w).join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className={`${styles.salary} num`}>
            {money(v.salaryFrom, v.salaryTo, "so'm")}
          </p>

          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => void apply()}
              disabled={applied}
            >
              {applied ? "✓ Ariza yuborildi" : "Ariza topshirish"}
            </button>
            <Link href="/kirish" className={styles.ghost}>
              Rezyume yaratish
            </Link>
          </div>

          <StatRow
            items={[
              { label: "Daraja", value: v.level === "mutaxassis" ? "Mutaxassis" : v.level === "ikkalasi" ? "Barcha" : "Intern" },
              { label: "Format", value: v.workFormats.length ? String(v.workFormats.length) : "1" },
              { label: "Joylashuv", value: v.city },
              { label: "Yo'nalish", value: v.direction },
            ]}
          />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Vakansiya haqida</h2>
            {v.description.length ? (
              <ul className={styles.list}>
                {v.description.map((d, i) => (
                  <li key={i} className={styles.li}>
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.para}>Batafsil ma&apos;lumot kiritilmagan.</p>
            )}
          </section>

          {v.companyAbout ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Kompaniya haqida</h2>
              <p className={styles.para}>{v.companyAbout}</p>
            </section>
          ) : null}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Oylik</h2>
            <p className={styles.para}>
              Taklif etilayotgan oylik:{" "}
              <strong className="num">
                {money(v.salaryFrom, v.salaryTo, "so'm")}
              </strong>
              . Yakuniy summa suhbat natijasiga ko&apos;ra kelishiladi.
            </p>
          </section>
        </div>

        {/* O'ng: sticky sidebar */}
        <aside className={styles.side}>
          <MatchScoreCard
            percent={match?.percent ?? null}
            verdict={match?.verdict ?? ""}
            summary={match?.summary ?? ""}
            onViewSuggestions={() =>
              match ? setModalOpen(true) : router.push("/kirish")
            }
          />

          {data.recommendations.length ? (
            <div className={styles.reco}>
              <p className={styles.recoHead}>Siz uchun tavsiya</p>
              <div className={styles.recoList}>
                {data.recommendations.map((r) => {
                  const rm = computeMatch(profile, toMatchVacancy(r));
                  return (
                    <RecoCard
                      key={r.id}
                      id={r.id}
                      company={r.company}
                      verified={r.verified}
                      title={r.title}
                      location={r.city}
                      salaryMin={r.salaryFrom}
                      salaryMax={r.salaryTo}
                      matchPercent={rm?.percent ?? null}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {match ? (
        <MatchBreakdownModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          jobTitle={v.title}
          company={v.company}
          percent={match.percent}
          factors={match.factors}
          improvements={match.improvements}
          onApply={() => {
            setModalOpen(false);
            void apply();
          }}
        />
      ) : null}
    </main>
  );
}
