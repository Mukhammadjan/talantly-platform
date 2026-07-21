"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyCard } from "@/components/web/CompanyCard";
import { JobCard } from "@/components/web/JobCard";
import { Icon, type IconName } from "@/lib/icons";
import { computeMatch, type MatchProfile } from "@/lib/match";
import { fetchCompanies, type CompanyView } from "@/lib/companies";
import { getSavedRole, saveRole, type AppRole } from "@/lib/role";
import { initTelegram, isInsideTelegram } from "@/lib/telegram";
import {
  fetchMatchProfile,
  fetchVacancies,
  toMatchVacancy,
  type VacancyView,
} from "@/lib/vacancies";
import styles from "./home.module.css";

const HOME: Record<AppRole, string> = {
  talant: "/talant",
  izlovchi: "/izlovchi",
};

const DIRECTIONS: {
  key: string;
  label: string;
  icon: IconName;
  blurb: string;
}[] = [
  { key: "dasturlash", label: "Dasturlash", icon: "board", blurb: "Frontend · backend · mobil" },
  { key: "dizayn", label: "Dizayn", icon: "sparkle", blurb: "UI/UX · grafik · mahsulot" },
  { key: "marketing", label: "Marketing", icon: "globe", blurb: "SMM · kontent · targeting" },
  { key: "sotuv", label: "Sotuv", icon: "briefcase", blurb: "B2B/B2C savdo" },
  { key: "data", label: "Data", icon: "grid", blurb: "Tahlil · analitika" },
  { key: "boshqa", label: "Boshqa", icon: "star", blurb: "Qolgan yo'nalishlar" },
];

const PILLARS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "doc",
    title: "AI profil",
    text: "Sun'iy intellekt xom ma'lumotdan professional CV va profil yig'adi.",
  },
  {
    icon: "check",
    title: "Bilim testi",
    text: "Yo'nalishingiz bo'yicha test — bilimingiz raqamda tasdiqlanadi.",
  },
  {
    icon: "chat",
    title: "Jonli suhbat",
    text: "Moderator bilan suhbat: muloqot, motivatsiya va xarakter.",
  },
  {
    icon: "star",
    title: "Tekshirilgan belgi",
    text: "Yashil «Tekshirilgan» badge bilan kompaniyalarga ko'rinasiz.",
  },
];

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
  return `${Math.floor(days / 7)} hafta oldin`;
}

export function HomeClient(): JSX.Element {
  const router = useRouter();
  // null = hali aniqlanmagan. SSR web mazmunini beradi (SEO), Telegram
  // aniqlangach splash'ga o'tadi — so'rovlar esa faqat web'da boshlanadi.
  const [inTelegram, setInTelegram] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [jobs, setJobs] = useState<VacancyView[] | null>(null);
  const [companies, setCompanies] = useState<CompanyView[] | null>(null);
  const [profile, setProfile] = useState<MatchProfile | null>(null);

  // Telegram ichida — eski splash mantiqi (rol bo'yicha hub'ga o'tkazish).
  useEffect(() => {
    initTelegram();
    const tg = isInsideTelegram();
    setInTelegram(tg);
    if (!tg) return;

    let live = true;
    const param = new URLSearchParams(window.location.search).get("role");
    if (param === "talant" || param === "izlovchi") {
      saveRole(param);
      router.replace(HOME[param]);
      return;
    }
    void getSavedRole().then((saved) => {
      if (!live) return;
      router.replace(saved ? HOME[saved] : "/welcome");
    });
    return () => {
      live = false;
    };
  }, [router]);

  // Web kontenti faqat Telegramdan tashqarida yuklanadi.
  useEffect(() => {
    if (inTelegram !== false) return;
    void fetchVacancies({ sort: "recent" }).then((v) => setJobs(v.slice(0, 6)));
    void fetchCompanies().then((c) => setCompanies(c.slice(0, 4)));
    void fetchMatchProfile().then(setProfile);
  }, [inTelegram]);

  if (inTelegram === true) {
    // Splash: Telegramda hub'ga yo'naltirish kutilmoqda.
    return (
      <main className={styles.splash}>
        <img
          src="/assets/brand/talantly-wordmark-dark.svg"
          alt="Talantly"
          className={styles.splashLogo}
        />
        <p className={styles.splashMicro}>Tekshirilgan talantlar</p>
      </main>
    );
  }

  const submitSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query.trim()) p.set("search", query.trim());
    if (city.trim()) p.set("location", city.trim());
    const qs = p.toString();
    router.push(qs ? `/vakansiyalar?${qs}` : "/vakansiyalar");
  };

  return (
    <main className={styles.page}>
      {/* ---- Split hero: chapda sarlavha+qidiruv, o'ngda mahsulot ko'rinishi ---- */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>
              <Icon name="check" size={14} /> O&apos;zbekistonda #1 tekshirilgan
              amaliyot
            </span>
            <h1 className={styles.h1}>
              Tajribasiz emas —{" "}
              <span className={styles.accent}>tekshirilgan</span>
            </h1>
            <p className={styles.lead}>
              Talantlar bilim testi va jonli suhbatdan o&apos;tadi. Kompaniyalar
              tayyor, ishonchli nomzodni oladi — AI moslik foizi bilan.
            </p>

            <form
              className={styles.search}
              onSubmit={submitSearch}
              role="search"
            >
              <label className={styles.field}>
                <Icon name="search" size={18} />
                <input
                  className={styles.input}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kasb, lavozim yoki kompaniya"
                  aria-label="Qidiruv so'rovi"
                />
              </label>
              <label className={`${styles.field} ${styles.fieldCity}`}>
                <Icon name="pin" size={18} />
                <input
                  className={styles.input}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Shahar"
                  aria-label="Shahar"
                />
              </label>
              <button type="submit" className={styles.searchBtn}>
                Topish
              </button>
            </form>

            <div className={styles.popular}>
              <span className={styles.popularLabel}>Ommabop:</span>
              {DIRECTIONS.slice(0, 4).map((d) => (
                <Link
                  key={d.key}
                  href={`/vakansiyalar?direction=${d.key}`}
                  className={styles.popChip}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {/* O'ng: brendlangan mahsulot ko'rinishi (illyustratsiya). */}
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.artCard}>
              <div className={styles.artTop}>
                <span className={styles.artAvatar}>K</span>
                <div className={styles.artNameWrap}>
                  <span className={styles.artName}>
                    Kamola O.
                    <span className={styles.artSeal}>
                      <Icon name="check" size={10} />
                    </span>
                  </span>
                  <span className={styles.artRole}>Frontend dasturchi</span>
                </div>
              </div>
              <div className={styles.artChips}>
                <span className={styles.artChip}>React</span>
                <span className={styles.artChip}>TypeScript</span>
                <span className={styles.artChip}>UI</span>
              </div>
              <div className={styles.artMatch}>
                <Icon name="sparkle" size={14} />
                AI Moslik: <span className="num">92%</span>
              </div>
            </div>
            <div className={styles.artBadge}>
              <Icon name="check" size={16} /> Tekshirildi
            </div>
          </div>
        </div>
      </section>

      {/* ---- Kategoriya plitkalari ---- */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <h2 className={styles.h2}>Yo&apos;nalishlar</h2>
          <Link href="/kasblar" className={styles.more}>
            Barcha kasblar <Icon name="chevron" size={16} />
          </Link>
        </div>
        <div className={styles.tiles}>
          {DIRECTIONS.map((d) => (
            <Link
              key={d.key}
              href={`/vakansiyalar?direction=${d.key}`}
              className={styles.tile}
            >
              <span className={styles.tileIcon}>
                <Icon name={d.icon} size={22} />
              </span>
              <span className={styles.tileName}>{d.label}</span>
              <span className={styles.tileBlurb}>{d.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Yangi vakansiyalar ---- */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <h2 className={styles.h2}>Yangi vakansiyalar</h2>
          <Link href="/vakansiyalar" className={styles.more}>
            Barchasi <Icon name="chevron" size={16} />
          </Link>
        </div>
        {jobs === null ? (
          <div className={styles.cards}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className={styles.empty}>Hozircha ochiq vakansiya yo&apos;q.</p>
        ) : (
          <div className={styles.cards}>
            {jobs.map((v) => {
              const m = computeMatch(profile, toMatchVacancy(v));
              return (
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
                    v.workFormats.map((w) => FORMAT_LABEL[w] ?? w).join(", ") ||
                    "Ofis"
                  }
                  description={v.description[0] ?? ""}
                  salaryMin={v.salaryFrom}
                  salaryMax={v.salaryTo}
                  currency="so'm"
                  postedAgo={postedAgo(v.createdAt)}
                  matchPercent={m?.percent ?? null}
                  onOpenBreakdown={() => router.push(`/vakansiya/${v.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ---- Nega Talantly? (4 bosqichli tekshiruv) ---- */}
      <section className={styles.trustWrap}>
        <div className={styles.trust}>
          <div className={styles.trustHead}>
            <h2 className={styles.h2}>Nega Talantly?</h2>
            <p className={styles.trustLead}>
              Har bir talant 4 bosqichli tekshiruvdan o&apos;tadi — kompaniya
              tavakkal qilmaydi.
            </p>
          </div>
          <ol className={styles.pillars}>
            {PILLARS.map((p, i) => (
              <li key={p.title} className={styles.pillar}>
                <span className={styles.pillarIcon}>
                  <Icon name={p.icon} size={20} />
                </span>
                <span className={`${styles.pillarNum} num`}>{i + 1}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarText}>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Kompaniyalar ---- */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <h2 className={styles.h2}>Tekshirilgan kompaniyalar</h2>
          <Link href="/kompaniyalar" className={styles.more}>
            Barchasi <Icon name="chevron" size={16} />
          </Link>
        </div>
        {companies === null ? (
          <div className={styles.companies}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonSm} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <p className={styles.empty}>Kompaniyalar tez orada qo&apos;shiladi.</p>
        ) : (
          <div className={styles.companies}>
            {companies.map((c) => (
              <CompanyCard
                key={c.id}
                id={c.id}
                name={c.name}
                verified={c.verified}
                logoUrl={c.logoUrl}
                activity={c.activity}
                city={c.city}
                directions={c.directions}
                openVacancies={c.openVacancies}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- Ish beruvchilar uchun CTA ---- */}
      <section className={styles.ctaWrap}>
        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>Ish beruvchimisiz?</h2>
            <p className={styles.ctaText}>
              Tekshirilgan nomzodlar bazasini ko&apos;ring va
              to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;laning. To&apos;lov
              faqat sinov muddati muvaffaqiyatli tugagach.
            </p>
          </div>
          <div className={styles.ctaBtns}>
            <Link href="/nomzodlar" className={styles.ctaPrimary}>
              Nomzodlarni ko&apos;rish
            </Link>
            <Link href="/kompaniyam" className={styles.ctaGhost}>
              Kompaniya profili
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
