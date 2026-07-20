"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { FilterPanel, type FilterState } from "@/components/web/FilterPanel";
import { JobCard } from "@/components/web/JobCard";
import { MatchBreakdownModal } from "@/components/web/MatchBreakdownModal";
import { RegisterSheet } from "@/components/web/RegisterSheet";
import { SearchBar, type SearchState } from "@/components/web/SearchBar";
import { Icon } from "@/lib/icons";
import { computeMatch, type MatchProfile, type MatchResult } from "@/lib/match";
import {
  fetchMatchProfile,
  fetchVacancies,
  toMatchVacancy,
  type VacancyView,
} from "@/lib/vacancies";
import styles from "./vakansiyalar.module.css";

const FORMAT_LABEL: Record<string, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

function postedAgo(iso: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000),
  );
  if (days === 0) return "Bugun";
  if (days === 1) return "Kecha";
  if (days < 7) return `${days} kun oldin`;
  const weeks = Math.floor(days / 7);
  return `${weeks} hafta oldin`;
}

function reasonsFrom(m: MatchResult): string[] {
  return m.factors
    .filter((f) => f.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((f) => `${f.label}: ${f.value}`);
}

function VakansiyalarInner(): JSX.Element {
  const router = useRouter();
  // Bosh sahifadagi qidiruv/yo'nalish chiplari URL orqali keladi.
  const params = useSearchParams();
  const [search, setSearch] = useState<SearchState>({
    query: params.get("search") ?? "",
    location: params.get("location") ?? "",
    minSalary: params.get("minSalary") ?? "",
    sort: params.get("sort") === "salary" ? "salary" : "recent",
  });
  const [filter, setFilter] = useState<FilterState>({
    direction: params.get("direction") ?? "",
    level: params.get("level") ?? "",
    workFormat: params.get("workFormat") ?? "",
    aiSort: false,
  });
  const [list, setList] = useState<VacancyView[] | null>(null);
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [modal, setModal] = useState<{
    v: VacancyView;
    m: MatchResult;
  } | null>(null);

  const load = useCallback((): void => {
    setList(null);
    void fetchVacancies({
      direction: filter.direction || null,
      level: filter.level || null,
      workFormat: filter.workFormat || null,
      minSalary: Number(search.minSalary) || null,
      search: search.query || null,
      sort: search.sort === "salary" ? "salary" : "recent",
    }).then((v) => {
      const filtered = search.location
        ? v.filter((x) => x.city === search.location)
        : v;
      setList(filtered);
    });
  }, [filter, search.minSalary, search.query, search.sort, search.location]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    void fetchMatchProfile().then(setProfile);
  }, []);

  // Har vakansiya uchun moslik (guest → null). AI-saralash yoqilsa % bo'yicha.
  const withMatch = useMemo(() => {
    if (!list) return null;
    const rows = list.map((v) => ({
      v,
      m: computeMatch(profile, toMatchVacancy(v)),
    }));
    if (filter.aiSort) {
      rows.sort((a, b) => (b.m?.percent ?? -1) - (a.m?.percent ?? -1));
    }
    return rows;
  }, [list, profile, filter.aiSort]);

  return (
    <>
      <SearchBar
        state={search}
        onChange={(n) => setSearch((s) => ({ ...s, ...n }))}
        onSubmit={load}
      />

      <main className={styles.main}>
        <div className={styles.grid}>
          <FilterPanel
            state={filter}
            onChange={(n) => setFilter((f) => ({ ...f, ...n }))}
          />

          <section className={styles.content}>
            <div className={styles.rhead}>
              <h1 className={styles.count}>
                {withMatch ? (
                  <>
                    <span className="num">{withMatch.length}</span> ta vakansiya
                    topildi
                  </>
                ) : (
                  "Yuklanmoqda..."
                )}
              </h1>
              <div className={styles.viewToggle} role="group" aria-label="Ko'rinish">
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "grid" ? styles.viewOn : ""}`}
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                  aria-label="Katak ko'rinish"
                >
                  <Icon name="grid" size={18} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${view === "list" ? styles.viewOn : ""}`}
                  onClick={() => setView("list")}
                  aria-pressed={view === "list"}
                  aria-label="Ro'yxat ko'rinish"
                >
                  <Icon name="board" size={18} />
                </button>
              </div>
            </div>

            {withMatch === null ? (
              <div className={styles.cards} data-view={view}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : withMatch.length === 0 ? (
              <p className={styles.empty}>
                Mos vakansiya topilmadi. Filtrlarni o&apos;zgartirib
                ko&apos;ring.
              </p>
            ) : (
              <div className={styles.cards} data-view={view}>
                {withMatch.map(({ v, m }) => (
                  <JobCard
                    key={v.id}
                    id={v.id}
                    company={v.company}
                    verified={v.verified}
                    logoUrl={v.logoUrl}
                    title={v.title}
                    employment="To'liq stavka"
                    location={[v.city, v.district].filter(Boolean).join(", ")}
                    workMode={
                      v.workFormats
                        .map((w) => FORMAT_LABEL[w] ?? w)
                        .join(", ") || "Ofis"
                    }
                    description={v.description[0] ?? ""}
                    salaryMin={v.salaryFrom}
                    salaryMax={v.salaryTo}
                    currency="so'm"
                    postedAgo={postedAgo(v.createdAt)}
                    matchPercent={m?.percent ?? null}
                    matchReasons={m ? reasonsFrom(m) : undefined}
                    matchQuote={m?.summary}
                    onOpenBreakdown={() =>
                      m ? setModal({ v, m }) : setRegisterOpen(true)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {modal ? (
        <MatchBreakdownModal
          open
          onClose={() => setModal(null)}
          jobTitle={modal.v.title}
          company={modal.v.company}
          percent={modal.m.percent}
          factors={modal.m.factors}
          improvements={modal.m.improvements}
          onApply={() => router.push(`/vakansiya/${modal.v.id}`)}
        />
      ) : null}

      <RegisterSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="AI moslikni ko'rish uchun ro'yxatdan o'ting"
      />
    </>
  );
}

// useSearchParams Suspense chegarasini talab qiladi (Next 14).
export default function VakansiyalarPage(): JSX.Element {
  return (
    <Suspense fallback={<div className={styles.main} />}>
      <VakansiyalarInner />
    </Suspense>
  );
}
