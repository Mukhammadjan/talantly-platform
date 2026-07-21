"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyCard } from "@/components/web/CompanyCard";
import { JobCard } from "@/components/web/JobCard";
import { Reveal } from "@/components/web/Reveal";
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
  { key: "dasturlash", label: "Dasturlash", icon: "board", blurb: "Frontend · backend · mobil · full-stack" },
  { key: "dizayn", label: "Dizayn", icon: "sparkle", blurb: "UI/UX · grafik · mahsulot" },
  { key: "marketing", label: "Marketing", icon: "globe", blurb: "SMM · kontent · targeting" },
  { key: "sotuv", label: "Sotuv", icon: "briefcase", blurb: "B2B/B2C savdo · akkaunt" },
  { key: "data", label: "Data", icon: "grid", blurb: "Tahlil · analitika · hisobot" },
  { key: "boshqa", label: "Boshqa", icon: "star", blurb: "Qolgan yo'nalishlar" },
];

const PROFILES: {
  initial: string;
  name: string;
  role: string;
  skills: string[];
  match: number;
}[] = [
  { initial: "K", name: "Kamola O.", role: "UI/UX Dizayner", skills: ["Figma", "UI", "Prototip"], match: 92 },
  { initial: "J", name: "Jasur T.", role: "Frontend Dasturchi", skills: ["React", "TypeScript"], match: 88 },
  { initial: "M", name: "Malika S.", role: "SMM Marketolog", skills: ["Kontent", "Targeting"], match: 90 },
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

// Profil kartasi — hero o'ng ustunidagi avto-oqim uchun.
function ProfileMini({
  p,
}: {
  p: (typeof PROFILES)[number];
}): JSX.Element {
  return (
    <div className={styles.pcard}>
      <div className={styles.pcTop}>
        <span className={styles.pcAvatar}>{p.initial}</span>
        <span className={styles.pcId}>
          <span className={styles.pcName}>
            {p.name}
            <span className={styles.pcSeal}>
              <Icon name="check" size={10} />
            </span>
          </span>
          <span className={styles.pcRole}>{p.role}</span>
        </span>
      </div>
      <div className={styles.pcChips}>
        {p.skills.map((s) => (
          <span key={s} className={styles.pcChip}>
            {s}
          </span>
        ))}
      </div>
      <div className={styles.pcMatch}>
        <span className={styles.pcMatchLabel}>
          <Icon name="sparkle" size={13} /> AI Moslik
        </span>
        <span className={`${styles.pcMatchVal} num`}>{p.match}%</span>
      </div>
      <div className={styles.pcBar} aria-hidden="true">
        <span className={styles.pcBarFill} style={{ width: `${p.match}%` }} />
      </div>
    </div>
  );
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
    void fetchCompanies().then((c) => setCompanies(c.slice(0, 6)));
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

  // Marquee uchun ikki nusxa — uzluksiz aylanish.
  const profileStream = [...PROFILES, ...PROFILES];

  return (
    <main className={styles.page}>
      {/* ============ HERO — split + ambient glow ============ */}
      <section className={styles.hero}>
        <div className={styles.glowA} aria-hidden="true" />
        <div className={styles.glowB} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              O&apos;zbekistonda #1 tekshirilgan amaliyot
            </span>
            <h1 className={styles.h1}>
              Tajribasiz emas —{" "}
              <span className={styles.accent}>tekshirilgan.</span>
              <br />
              Salohiyatingizni dunyoga ko&apos;rsating.
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

            <ul className={styles.trustRow}>
              <li>
                <span className={`${styles.trustNum} num`}>4</span> bosqichli
                tekshiruv
              </li>
              <li>
                <span className={`${styles.trustNum} num`}>AI</span> moslik foizi
              </li>
              <li>
                <span className={styles.trustSeal}>
                  <Icon name="check" size={12} />
                </span>{" "}
                Tekshirilgan belgi
              </li>
            </ul>
          </div>

          {/* O'ng: avto-oqadigan profil kartalari (marquee). */}
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.stream}>
              {profileStream.map((p, i) => (
                <ProfileMini key={`${p.name}-${i}`} p={p} />
              ))}
            </div>
            <span className={styles.artBadge}>
              <Icon name="check" size={15} /> Tekshirildi
            </span>
          </div>
        </div>
      </section>

      {/* ============ YO'NALISHLAR — bento ============ */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <div>
            <span className={styles.kicker}>Yo&apos;nalishlar</span>
            <h2 className={styles.h2}>Sizga mos sohani tanlang</h2>
          </div>
          <Link href="/kasblar" className={styles.more}>
            Barcha kasblar <Icon name="chevron" size={16} />
          </Link>
        </div>
        <div className={styles.bento}>
          {DIRECTIONS.map((d, i) => (
            <Reveal
              key={d.key}
              delay={i * 60}
              className={`${styles.tileWrap} ${
                i === 0 || i === 4 ? styles.tileWide : ""
              }`}
            >
              <Link
                href={`/vakansiyalar?direction=${d.key}`}
                className={styles.tile}
              >
                <span className={styles.tileIcon}>
                  <Icon name={d.icon} size={22} />
                </span>
                <span className={styles.tileName}>{d.label}</span>
                <span className={styles.tileBlurb}>{d.blurb}</span>
                <span className={styles.tileGo} aria-hidden="true">
                  <Icon name="arrow" size={16} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ YANGI VAKANSIYALAR ============ */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <div>
            <span className={styles.kicker}>Yangi imkoniyatlar</span>
            <h2 className={styles.h2}>So&apos;nggi vakansiyalar</h2>
          </div>
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
            {jobs.map((v, i) => {
              const m = computeMatch(profile, toMatchVacancy(v));
              return (
                <Reveal key={v.id} delay={(i % 3) * 70}>
                  <JobCard
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
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ NEGA TALANTLY? — 4 bosqich ============ */}
      <section className={styles.trustWrap}>
        <div className={styles.glowC} aria-hidden="true" />
        <div className={styles.trust}>
          <div className={styles.trustHead}>
            <span className={styles.kickerLight}>Ishonch qanday quriladi</span>
            <h2 className={styles.h2Light}>Nega aynan Talantly?</h2>
            <p className={styles.trustLead}>
              Har bir talant 4 bosqichli tekshiruvdan o&apos;tadi — kompaniya
              tavakkal qilmaydi, siz esa tayyor ishonch bilan chiqasiz.
            </p>
          </div>
          <div className={styles.pillars}>
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className={styles.pillar}>
                <span className={`${styles.pillarNum} num`}>0{i + 1}</span>
                <span className={styles.pillarIcon}>
                  <Icon name={p.icon} size={22} />
                </span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarText}>{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TEKSHIRILGAN KOMPANIYALAR — marquee ============ */}
      <section className={styles.section}>
        <div className={styles.sechead}>
          <div>
            <span className={styles.kicker}>Ishonch panelida</span>
            <h2 className={styles.h2}>Tekshirilgan kompaniyalar</h2>
          </div>
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
          <>
            <div className={styles.marquee} aria-hidden="true">
              <div className={styles.marqueeTrack}>
                {[...companies, ...companies].map((c, i) => (
                  <span key={`${c.id}-${i}`} className={styles.logoChip}>
                    {c.logoUrl ? (
                      <img src={c.logoUrl} alt="" className={styles.logoImg} />
                    ) : (
                      <span className={styles.logoFallback}>
                        {c.name.charAt(0)}
                      </span>
                    )}
                    <span className={styles.logoName}>{c.name}</span>
                    {c.verified ? (
                      <span className={styles.logoSeal}>
                        <Icon name="check" size={11} />
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.companies}>
              {companies.slice(0, 3).map((c) => (
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
          </>
        )}
      </section>

      {/* ============ ISH BERUVCHILAR CTA ============ */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.cta}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className={styles.ctaBody}>
              <span className={styles.ctaKicker}>Ish beruvchilar uchun</span>
              <h2 className={styles.ctaTitle}>
                Tekshirilgan nomzodni tavakkalsiz oling
              </h2>
              <p className={styles.ctaText}>
                Tayyor talantlar bazasini ko&apos;ring va to&apos;g&apos;ridan-
                to&apos;g&apos;ri bog&apos;laning. To&apos;lov faqat sinov muddati
                muvaffaqiyatli tugagach.
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
        </Reveal>
      </section>
    </main>
  );
}
