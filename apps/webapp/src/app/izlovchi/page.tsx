"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ACTIVITY_TYPES_UZ,
  COMPANY_KIND_LABELS_UZ,
  NEEDED_LEVEL_LABELS_UZ,
  URGENCY_LABELS_UZ,
  type CompanyKind,
  type NeededLevel,
  type Urgency,
} from "@talantly/shared";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { CompanySnapshot, FeedResponse } from "@/lib/apiTypes";
import { CITIES } from "@/lib/registration";
import { haptic, initTelegramUi } from "@/lib/telegram";
import { useTelegramBackButton } from "@/lib/useTelegramBackButton";

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

  useTelegramBackButton(
    step > 1
      ? () => {
          haptic("light");
          setStep((prev) => prev - 1);
        }
      : null,
  );

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
    <main className="flex min-h-app flex-col px-5 pb-10 pt-6">
      <div className="flex items-center gap-4">
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
        if (cancelled) return;
        // Company profile already exists — the new recruiter UI owns the feed.
        if (feed.company) {
          router.replace("/ish");
          return;
        }
        setData(feed);
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
      <main className="flex min-h-app flex-col items-center justify-center px-6">
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

  // Only users without a company profile reach this point.
  return <Onboarding onDone={() => router.push("/ish")} />;
}
