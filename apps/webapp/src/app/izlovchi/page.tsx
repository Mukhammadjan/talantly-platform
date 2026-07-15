"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ACTIVITY_TYPES_UZ,
  ARCHETYPE_META,
  COMPANY_KIND_LABELS_UZ,
  DIRECTION_LABELS_UZ,
  LEVEL_LABELS_UZ,
  NEEDED_LEVEL_LABELS_UZ,
  URGENCY_LABELS_UZ,
  WORK_FORMAT_LABELS_UZ,
  type CompanyKind,
  type Direction,
  type NeededLevel,
  type TalentLevel,
  type Urgency,
  type WorkFormat,
} from "@talantly/shared";
import { Card } from "@/components/Card";
import { ModeSwitch } from "@/components/ModeSwitch";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { Mark } from "@/components/Wordmark";
import { ApiError, apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type {
  CompanySnapshot,
  FeedResponse,
  TalentCardPublic,
} from "@/lib/apiTypes";
import { CITIES } from "@/lib/registration";
import { haptic, initTelegramUi } from "@/lib/telegram";

const KIND_OPTIONS: { value: CompanyKind; icon: string }[] = [
  { value: "kompaniya", icon: "🏢" },
  { value: "tashkilot", icon: "🏛" },
  { value: "startup", icon: "🚀" },
  { value: "shaxsiy", icon: "👤" },
];

const ACTIVITY_ICONS: Record<string, string> = {
  Savdo: "🛍",
  IT: "💻",
  "Xizmat ko'rsatish": "🧰",
  "Ishlab chiqarish": "🏭",
  "Ta'lim": "🎓",
  Boshqa: "✨",
};

const NEEDED_LEVEL_OPTIONS: { value: NeededLevel; icon: string }[] = [
  { value: "intern", icon: "🌱" },
  { value: "mutaxassis", icon: "💼" },
  { value: "ikkalasi", icon: "🤝" },
];

const URGENCY_OPTIONS: { value: Urgency; icon: string }[] = [
  { value: "hoziroq", icon: "⚡" },
  { value: "oy_ichida", icon: "🗓" },
  { value: "korib_turibman", icon: "👀" },
];

const ONBOARDING_STEPS = 5;

interface OnboardingValues {
  kind: CompanyKind | null;
  name: string;
  city: string | null;
  activityType: string | null;
  neededLevel: NeededLevel | null;
}

function OptionCard({
  icon,
  label,
  onSelect,
}: {
  icon: string;
  label: string;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 text-left shadow-soft transition-all duration-150 active:scale-[0.98] active:border-orange active:bg-orange-soft"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-[22px]"
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-[15px] font-semibold text-ink">{label}</span>
      <span className="ml-auto text-ink-soft" aria-hidden>
        ›
      </span>
    </button>
  );
}

function Onboarding({
  onDone,
}: {
  onDone: (company: CompanySnapshot) => void;
}): JSX.Element {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<OnboardingValues>({
    kind: null,
    name: "",
    city: null,
    activityType: null,
    neededLevel: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advance = (patch: Partial<OnboardingValues>): void => {
    haptic("light");
    setValues((prev) => ({ ...prev, ...patch }));
    setStep((prev) => prev + 1);
  };

  const submit = async (urgency: Urgency): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    haptic("light");
    try {
      const { company } = await apiFetch<{ company: CompanySnapshot }>(
        "/api/company",
        {
          method: "POST",
          body: JSON.stringify({
            kind: values.kind,
            name: values.name.trim(),
            city: values.city,
            activityType: values.activityType,
            neededLevel: values.neededLevel,
            urgency,
          }),
        },
      );
      haptic("success");
      onDone(company);
    } catch (err) {
      haptic("error");
      setError(
        err instanceof ApiError ? err.message : "Xatolik yuz berdi. Qayta urinib ko'ring.",
      );
      setSubmitting(false);
    }
  };

  const titles: Record<number, { title: string; helper: string }> = {
    1: {
      title: "Siz kim sifatida izlayapsiz?",
      helper: "Bu ma'lumot nomzodlarga ko'rinmaydi.",
    },
    2: {
      title: "Nomingiz va shahringiz",
      helper: "Kompaniya yoki o'zingizning nomingizni yozing.",
    },
    3: {
      title: "Faoliyat yo'nalishingiz?",
      helper: "Mos nomzodlarni tanlashda yordam beradi.",
    },
    4: {
      title: "Kim kerak?",
      helper: "Keyinchalik o'zgartirishingiz mumkin.",
    },
    5: {
      title: "Qachon kerak?",
      helper: "Bir bosishda yakunlaysiz.",
    },
  };
  const meta = titles[step] ?? titles[1];

  return (
    <main className="flex min-h-screen flex-col px-5 pb-10 pt-6">
      <div className="flex items-center gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => {
              haptic("light");
              setStep((prev) => prev - 1);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[18px] text-ink-soft transition-all active:scale-95"
            aria-label="Orqaga"
          >
            ‹
          </button>
        ) : (
          <span className="h-9 w-9 shrink-0" />
        )}
        <div className="flex-1">
          <ProgressBar value={(step - 1) / ONBOARDING_STEPS} />
        </div>
        <span className="num shrink-0 text-[12px] font-semibold text-ink-soft">
          {step}/{ONBOARDING_STEPS}
        </span>
      </div>

      <h1 className="mt-8 text-[21px] font-bold tracking-tight text-ink">
        {meta?.title}
      </h1>
      <p className="mt-1.5 text-[13px] text-ink-soft">{meta?.helper}</p>

      <div className="mt-6 space-y-3">
        {step === 1 &&
          KIND_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={COMPANY_KIND_LABELS_UZ[option.value]}
              onSelect={() => advance({ kind: option.value })}
            />
          ))}

        {step === 2 && (
          <>
            <input
              type="text"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              maxLength={100}
              placeholder="Masalan: Novatek MChJ"
              className="input-base"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    haptic("light");
                    setValues((prev) => ({ ...prev, city }));
                  }}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
                    values.city === city
                      ? "border-orange bg-orange-soft text-orange-deep"
                      : "border-line bg-surface text-ink-soft"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <PillButton
              className="mt-4"
              disabled={values.name.trim().length < 2 || !values.city}
              onClick={() => advance({})}
            >
              Davom etish
            </PillButton>
          </>
        )}

        {step === 3 &&
          ACTIVITY_TYPES_UZ.map((activity) => (
            <OptionCard
              key={activity}
              icon={ACTIVITY_ICONS[activity] ?? "✨"}
              label={activity}
              onSelect={() => advance({ activityType: activity })}
            />
          ))}

        {step === 4 &&
          NEEDED_LEVEL_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={NEEDED_LEVEL_LABELS_UZ[option.value]}
              onSelect={() => advance({ neededLevel: option.value })}
            />
          ))}

        {step === 5 &&
          URGENCY_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={URGENCY_LABELS_UZ[option.value]}
              onSelect={() => void submit(option.value)}
            />
          ))}
      </div>

      {submitting && (
        <p className="mt-5 text-center text-[13px] text-ink-soft">
          Saqlanmoqda...
        </p>
      )}
      {error && (
        <p className="mt-5 text-center text-[13px] text-orange-deep">{error}</p>
      )}
    </main>
  );
}

type FeedTab = "mos" | "top" | "yangi";

interface FeedFilters {
  direction: Direction | null;
  level: TalentLevel | null;
  workFormat: WorkFormat | null;
  city: string | null;
  minScore: number | null;
}

const EMPTY_FILTERS: FeedFilters = {
  direction: null,
  level: null,
  workFormat: null,
  city: null,
  minScore: null,
};

const TABS: { value: FeedTab; label: string }[] = [
  { value: "mos", label: "Sizga mos" },
  { value: "top", label: "Top mutaxassislar" },
  { value: "yangi", label: "Yangi tekshirilganlar" },
];

function levelMatches(
  neededLevel: NeededLevel | null,
  level: TalentLevel | null,
): boolean {
  if (!neededLevel || neededLevel === "ikkalasi") return true;
  return level === neededLevel;
}

function sortForTab(
  tab: FeedTab,
  talents: TalentCardPublic[],
  company: CompanySnapshot,
): TalentCardPublic[] {
  const list = [...talents];
  if (tab === "top") {
    return list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }
  if (tab === "yangi") {
    return list.sort(
      (a, b) =>
        new Date(b.verifiedAt ?? 0).getTime() -
        new Date(a.verifiedAt ?? 0).getTime(),
    );
  }
  // "Sizga mos": level-matching talents, same city first, then by score.
  return list
    .filter((talent) => levelMatches(company.neededLevel, talent.level))
    .sort((a, b) => {
      const cityA = a.city === company.city ? 1 : 0;
      const cityB = b.city === company.city ? 1 : 0;
      if (cityA !== cityB) return cityB - cityA;
      return (b.score ?? -1) - (a.score ?? -1);
    });
}

function FilterChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        haptic("light");
        onToggle();
      }}
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all active:scale-95 ${
        active
          ? "border-orange bg-orange-soft text-orange-deep"
          : "border-line bg-surface text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <p className="label-caps">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FiltersPanel({
  filters,
  onChange,
}: {
  filters: FeedFilters;
  onChange: (filters: FeedFilters) => void;
}): JSX.Element {
  const toggle = <K extends keyof FeedFilters>(
    key: K,
    value: FeedFilters[K],
  ): void => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  return (
    <Card className="space-y-4">
      <FilterGroup label="Yo'nalish">
        {(Object.keys(DIRECTION_LABELS_UZ) as Direction[]).map((direction) => (
          <FilterChip
            key={direction}
            label={DIRECTION_LABELS_UZ[direction]}
            active={filters.direction === direction}
            onToggle={() => toggle("direction", direction)}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Daraja">
        {(Object.keys(LEVEL_LABELS_UZ) as TalentLevel[]).map((level) => (
          <FilterChip
            key={level}
            label={LEVEL_LABELS_UZ[level]}
            active={filters.level === level}
            onToggle={() => toggle("level", level)}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Ish formati">
        {(Object.keys(WORK_FORMAT_LABELS_UZ) as WorkFormat[]).map((format) => (
          <FilterChip
            key={format}
            label={WORK_FORMAT_LABELS_UZ[format]}
            active={filters.workFormat === format}
            onToggle={() => toggle("workFormat", format)}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Shahar">
        {CITIES.map((city) => (
          <FilterChip
            key={city}
            label={city}
            active={filters.city === city}
            onToggle={() => toggle("city", city)}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Skill ball">
        {[60, 70, 80, 90].map((score) => (
          <FilterChip
            key={score}
            label={`${score}+`}
            active={filters.minScore === score}
            onToggle={() => toggle("minScore", score)}
          />
        ))}
      </FilterGroup>
    </Card>
  );
}

function TalentCard({
  talent,
  onOpen,
}: {
  talent: TalentCardPublic;
  onOpen: () => void;
}): JSX.Element {
  const archetype = talent.archetypeCode
    ? ARCHETYPE_META[talent.archetypeCode]
    : null;
  const extraTags = talent.skillTags.length - 3;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-card border border-line bg-surface p-4 text-left shadow-soft transition-all duration-150 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        {talent.photoUrl ? (
          <img
            src={talent.photoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange text-[17px] font-bold text-white">
            {talent.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
            <span className="truncate">{talent.displayName}</span>
            <Seal size={16} className="shrink-0" />
          </p>
          <p className="truncate text-[12px] text-ink-soft">
            {[
              talent.direction ? DIRECTION_LABELS_UZ[talent.direction] : null,
              talent.city,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {talent.isDemo && (
          <span className="shrink-0 rounded-chip bg-surface-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Demo
          </span>
        )}
        {talent.level && (
          <span className="shrink-0 rounded-chip bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
            {talent.level === "intern" ? "🌱" : "💼"}{" "}
            {LEVEL_LABELS_UZ[talent.level]}
          </span>
        )}
      </div>

      {talent.headline && (
        <p className="mt-2.5 line-clamp-2 text-[13px] italic leading-relaxed text-ink-soft">
          &quot;{talent.headline}&quot;
        </p>
      )}

      {(archetype || talent.skillTags.length > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {archetype && (
            <span className="rounded-chip bg-orange-soft px-2.5 py-1 text-[11px] font-semibold text-orange-deep">
              {archetype.emoji} {talent.archetypeLabel ?? archetype.label}
            </span>
          )}
          {talent.skillTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-chip border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        {talent.score !== null && (
          <span className="num rounded-chip bg-green-soft px-2.5 py-1 text-[12px] font-bold text-green">
            {talent.score} ball
          </span>
        )}
        {talent.rating !== null && (
          <span className="text-[12px] font-semibold text-ink-soft">
            {"★".repeat(talent.rating)}
            <span className="text-line">{"★".repeat(5 - talent.rating)}</span>
          </span>
        )}
        <span className="ml-auto text-[12px] font-semibold text-orange">
          Batafsil ›
        </span>
      </div>
    </button>
  );
}

function Feed({
  company,
  talents,
}: {
  company: CompanySnapshot;
  talents: TalentCardPublic[];
}): JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<FeedTab>("mos");
  const [filters, setFilters] = useState<FeedFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== null,
  ).length;

  const visible = useMemo(() => {
    const filtered = talents.filter((talent) => {
      if (filters.direction && talent.direction !== filters.direction) {
        return false;
      }
      if (filters.level && talent.level !== filters.level) return false;
      if (
        filters.workFormat &&
        !talent.workFormats.includes(filters.workFormat)
      ) {
        return false;
      }
      if (filters.city && talent.city !== filters.city) return false;
      if (filters.minScore !== null && (talent.score ?? 0) < filters.minScore) {
        return false;
      }
      return true;
    });
    return sortForTab(tab, filtered, company);
  }, [talents, filters, tab, company]);

  return (
    <main className="px-5 pb-10 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <Mark size={26} />
        <ModeSwitch className="shrink-0" />
      </div>
      <div className="min-w-0">
        <p className="label-caps">Izlovchi</p>
        <h1 className="truncate text-[19px] font-bold tracking-tight text-ink">
          {company.name}
        </h1>
      </div>

      <div className="scrollbar-none -mx-5 mt-5 flex gap-2 overflow-x-auto px-5">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              haptic("light");
              setTab(item.value);
            }}
            className={`font-display shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
              tab === item.value
                ? "bg-orange text-white shadow-soft"
                : "border border-line bg-surface text-ink-soft"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            haptic("light");
            setFiltersOpen((prev) => !prev);
          }}
          className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
            filtersOpen || activeFilterCount > 0
              ? "border-orange bg-orange-soft text-orange-deep"
              : "border-line bg-surface text-ink-soft"
          }`}
        >
          ⚙ Filtr{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4">
          <FiltersPanel filters={filters} onChange={setFilters} />
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                haptic("light");
                setFilters(EMPTY_FILTERS);
              }}
              className="mt-3 w-full text-center text-[13px] font-semibold text-orange"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <Card className="text-center">
            <p className="text-[28px]" aria-hidden>
              🔍
            </p>
            <p className="mt-2 text-[14px] font-semibold text-ink">
              Hozircha mos nomzod topilmadi
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Filtrlarni kengaytirib ko&apos;ring — yangi tekshirilgan talantlar
              tez-tez qo&apos;shilib boradi.
            </p>
          </Card>
        ) : (
          visible.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onOpen={() => {
                haptic("light");
                router.push(`/izlovchi/talant/${talent.id}`);
              }}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default function IzlovchiPage(): JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<FeedResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    authenticate()
      .then(() => apiFetch<FeedResponse>("/api/feed"))
      .then((feed) => {
        if (!cancelled) setData(feed);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (failed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-center text-[14px] text-ink-soft">
          Ma&apos;lumotlarni yuklab bo&apos;lmadi. Ilovani yopib, qayta oching.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-40 w-full rounded-card" />
        <Skeleton className="mt-3 h-40 w-full rounded-card" />
      </main>
    );
  }

  if (!data.company) {
    return (
      <Onboarding
        onDone={(company) => setData({ company, talents: data.talents })}
      />
    );
  }

  return <Feed company={data.company} talents={data.talents} />;
}
