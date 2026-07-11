"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SKILL_TAG_BANK } from "@talantly/shared";
import type { Direction, TalentLevel, WorkFormat } from "@talantly/shared";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { Wordmark } from "@/components/Wordmark";
import { ApiError, apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { TalentSnapshot } from "@/lib/apiTypes";
import {
  BIRTH_YEAR_MAX,
  BIRTH_YEAR_MIN,
  CITIES,
  DIRECTIONS,
  EXPERIENCE_STEP,
  EXPERIENCE_YEARS_MAX,
  LEVELS,
  MAX_SKILL_TAGS,
  TOTAL_STEPS,
  WORK_FORMATS,
} from "@/lib/registration";
import { haptic, initTelegramUi } from "@/lib/telegram";

interface WizardValues {
  fullName: string;
  birthYear: number | null;
  city: string;
  direction: Direction | null;
  skillTags: string[];
  level: TalentLevel | null;
  experienceYears: number | null;
  experienceWhere: string;
  workFormats: WorkFormat[];
  headline: string;
  education: string;
  phoneDigits: string;
  freeText: string;
  portfolioUrl: string;
}

const STEP_TITLES: Record<number, string> = {
  1: "Ismingiz va familiyangiz?",
  2: "Qaysi yilda tug'ilgansiz?",
  3: "Qaysi shaharda yashaysiz?",
  4: "Qaysi yo'nalishda o'smoqchisiz?",
  5: "Qaysi ko'nikmalarni bilasiz?",
  6: "Darajangiz qanday?",
  7: "Ish tajribangiz haqida",
  8: "Qanday formatda ishlamoqchisiz?",
  9: "O'zingizni bir jumlada ta'riflang",
  10: "Ta'limingiz haqida ayting",
  11: "Telefon raqamingiz?",
  12: "O'zingiz haqingizda erkin yozing",
  13: "Portfolio yoki ish namunalari",
};

const STEP_HELPERS: Record<number, string> = {
  1: "Pasportdagidek to'liq yozing.",
  2: "Ro'yxatdan tanlang.",
  3: "Hozir yashab turgan shahringiz.",
  4: "Keyin skill test ham shu yo'nalishda bo'ladi.",
  5: `1 tadan ${MAX_SKILL_TAGS} tagacha tanlang.`,
  6: "Bu kompaniyalarga mos darajani tanlashga yordam beradi.",
  7: "Necha yil va qayerda ishlagansiz?",
  8: "Bir nechtasini tanlashingiz mumkin.",
  9: "Bu jumla profilingizda ko'rinadi.",
  10: "Masalan: TATU, dasturiy injiniring, 3-kurs.",
  11: "Moderator siz bilan shu raqam orqali bog'lanadi.",
  12: "Tajribangiz, loyihalaringiz haqida erkin yozing.",
  13: "Havola bo'lsa qoldiring — bu ixtiyoriy qadam.",
};

function formatPhone(digits: string): string {
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return parts.join(" ");
}

function valuesFromSnapshot(snapshot: TalentSnapshot): WizardValues {
  return {
    fullName: snapshot.fullName ?? "",
    birthYear: snapshot.birthYear,
    city: snapshot.city ?? "",
    direction: snapshot.direction,
    skillTags: snapshot.skillTags,
    level: snapshot.level,
    experienceYears: snapshot.experienceYears,
    experienceWhere: "",
    workFormats: snapshot.workFormats,
    headline: snapshot.headline ?? "",
    education: snapshot.education ?? "",
    phoneDigits: snapshot.phone?.replace(/^\+998/, "") ?? "",
    freeText: snapshot.freeText ?? "",
    portfolioUrl: snapshot.portfolioUrl ?? "",
  };
}

const YEARS: number[] = [];
for (let year = BIRTH_YEAR_MAX; year >= BIRTH_YEAR_MIN; year -= 1) {
  YEARS.push(year);
}

const EXPERIENCE_YEAR_OPTIONS: number[] = [];
for (let y = 1; y <= EXPERIENCE_YEARS_MAX; y += 1) {
  EXPERIENCE_YEAR_OPTIONS.push(y);
}

const CONFETTI_COLORS = ["#F26430", "#FF8A3D", "#23B26A", "#F0C24B"];

function Confetti(): JSX.Element {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${((i * 13) % 9) / 10}s`,
        duration: `${2.2 + ((i * 7) % 10) / 10}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? "#F26430",
      })),
    [],
  );
  return (
    <>
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </>
  );
}

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [values, setValues] = useState<WizardValues | null>(null);
  const [animBack, setAnimBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const nameRef = useRef<string>("");

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    authenticate()
      .then(({ snapshot }) => {
        if (cancelled) return;
        if (snapshot.status !== "yangi") {
          router.replace("/profile");
          return;
        }
        setValues(valuesFromSnapshot(snapshot));
        setStep(snapshot.registerStep);
      })
      .catch(() => {
        if (!cancelled) setFatal(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (fatal) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-center text-[14px] text-ink-soft">
          Ulanishda xatolik yuz berdi. Ilovani yopib, qayta oching.
        </p>
      </main>
    );
  }

  if (step === null || values === null) {
    return (
      <main className="px-5 pt-8">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="mt-10 h-7 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-8 h-14 w-full" />
      </main>
    );
  }

  const update = (patch: Partial<WizardValues>): void => {
    setValues((prev) => (prev ? { ...prev, ...patch } : prev));
    setError(null);
  };

  const goBack = (): void => {
    if (step <= 1 || submitting) return;
    haptic("light");
    setAnimBack(true);
    setError(null);
    const skipExperience =
      step === EXPERIENCE_STEP + 1 && values.level !== "mutaxassis";
    setStep(step - (skipExperience ? 2 : 1));
  };

  const stepValue = (target: number): unknown => {
    switch (target) {
      case 1:
        return values.fullName.trim();
      case 2:
        return values.birthYear;
      case 3:
        return values.city;
      case 4:
        return values.direction;
      case 5:
        return values.skillTags;
      case 6:
        return values.level;
      case 7:
        return {
          years: values.experienceYears,
          where: values.experienceWhere.trim(),
        };
      case 8:
        return values.workFormats;
      case 9:
        return values.headline.trim();
      case 10:
        return values.education.trim();
      case 11:
        return `+998${values.phoneDigits}`;
      case 12:
        return values.freeText.trim();
      case 13:
        return values.portfolioUrl.trim() === ""
          ? null
          : values.portfolioUrl.trim();
      default:
        return null;
    }
  };

  const clientValidate = (target: number): string | null => {
    switch (target) {
      case 1:
        return values.fullName.trim().length >= 3
          ? null
          : "Iltimos, ism-familiyangizni to'liq yozing.";
      case 2:
        return values.birthYear ? null : "Tug'ilgan yilingizni tanlang.";
      case 3:
        return values.city ? null : "Shaharni tanlang.";
      case 4:
        return values.direction ? null : "Yo'nalishni tanlang.";
      case 5:
        return values.skillTags.length >= 1
          ? null
          : "Kamida bitta ko'nikma tanlang.";
      case 6:
        return values.level ? null : "Darajangizni tanlang.";
      case 7:
        if (!values.experienceYears) return "Tajriba yillarini tanlang.";
        return values.experienceWhere.trim().length >= 2
          ? null
          : "Qayerda ishlaganingizni qisqacha yozing.";
      case 8:
        return values.workFormats.length >= 1
          ? null
          : "Kamida bitta formatni tanlang.";
      case 9:
        return values.headline.trim().length >= 5
          ? null
          : "Qisqa jumla yozing (kamida 5 harf).";
      case 10:
        return values.education.trim().length >= 2
          ? null
          : "Ta'limingiz haqida qisqacha yozing.";
      case 11:
        return values.phoneDigits.length === 9
          ? null
          : "Telefon raqamni to'liq kiriting.";
      case 12:
        return values.freeText.trim().length >= 10
          ? null
          : "Kamida bir-ikki jumla yozing — bu CV uchun juda muhim.";
      case 13:
        return null;
      default:
        return "Noto'g'ri qadam.";
    }
  };

  const submitStep = async (skipPortfolio = false): Promise<void> => {
    if (submitting) return;
    const value = skipPortfolio ? null : stepValue(step);
    const validationError = skipPortfolio ? null : clientValidate(step);
    if (validationError) {
      setError(validationError);
      haptic("error");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { snapshot } = await apiFetch<{ snapshot: TalentSnapshot }>(
        "/api/register/step",
        { method: "POST", body: JSON.stringify({ step, value }) },
      );
      nameRef.current = snapshot.fullName ?? "";
      haptic("light");
      if (step < TOTAL_STEPS) {
        setAnimBack(false);
        // The server decides the next step (it skips the experience screen
        // for interns).
        setStep(snapshot.registerStep > step ? snapshot.registerStep : step + 1);
      } else {
        const finish = await apiFetch<{ snapshot: TalentSnapshot }>(
          "/api/register/finish",
          { method: "POST" },
        );
        nameRef.current = finish.snapshot.fullName ?? "";
        haptic("success");
        setCelebrating(true);
        window.setTimeout(() => router.replace("/xarakter"), 3000);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Xatolik yuz berdi. Qayta urinib ko'ring.",
      );
      haptic("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (celebrating) {
    const firstName = nameRef.current.split(" ")[0] ?? "";
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <Confetti />
        <Seal size={88} className="seal-pop" />
        <h1 className="mt-6 text-center text-2xl font-bold">
          Ajoyib{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="mt-3 text-center text-[14px] leading-relaxed text-ink-soft">
          Ma&apos;lumotlaringiz qabul qilindi. Endi tekshiruv boshlanadi —
          birinchi qadam: qisqa xarakter testi.
        </p>
        <PillButton
          className="mt-8"
          onClick={() => router.replace("/xarakter")}
        >
          Xarakter testini boshlash
        </PillButton>
      </main>
    );
  }

  if (step === 0) {
    return (
      <main className="flex min-h-screen flex-col px-6 pb-8 pt-16">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Wordmark height={42} className="seal-pop" />
          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
            Iqtidoringizni tekshiramiz va tasdiqlaymiz.
            <br />
            Kompaniyalar tekshirilgan talantlarga ishonadi.
          </p>
          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === 0 ? "w-5 bg-orange" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
          <p className="label-caps mt-3">13 ta qisqa savol · 3 daqiqa</p>
        </div>
        <PillButton onClick={() => setStep(1)}>Boshlash</PillButton>
      </main>
    );
  }

  const canContinue = clientValidate(step) === null;
  const tagBank = values.direction ? SKILL_TAG_BANK[values.direction] : [];

  const toggleTag = (tag: string): void => {
    haptic("light");
    if (values.skillTags.includes(tag)) {
      update({ skillTags: values.skillTags.filter((t) => t !== tag) });
      return;
    }
    if (values.skillTags.length >= MAX_SKILL_TAGS) {
      setError(`Ko'pi bilan ${MAX_SKILL_TAGS} ta tanlash mumkin.`);
      return;
    }
    update({ skillTags: [...values.skillTags, tag] });
  };

  const toggleFormat = (format: WorkFormat): void => {
    haptic("light");
    update({
      workFormats: values.workFormats.includes(format)
        ? values.workFormats.filter((f) => f !== format)
        : [...values.workFormats, format],
    });
  };

  return (
    <main className="flex min-h-screen flex-col px-5 pb-8 pt-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step <= 1 || submitting}
          aria-label="Orqaga"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-all active:scale-95 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <ProgressBar value={step / TOTAL_STEPS} />
        <span className="label-caps num shrink-0">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      <div
        key={step}
        className={`flex flex-1 flex-col ${animBack ? "step-enter-back" : "step-enter"}`}
      >
        <h1 className="mt-8 text-[22px] font-bold leading-snug">
          {STEP_TITLES[step]}
        </h1>
        <p className="mt-2 text-[13px] text-ink-soft">{STEP_HELPERS[step]}</p>

        <div className="mt-6 flex-1">
          {step === 1 && (
            <input
              className="input-base"
              type="text"
              autoFocus
              value={values.fullName}
              placeholder="Masalan: Aziza Karimova"
              onChange={(e) => update({ fullName: e.target.value })}
            />
          )}

          {step === 2 && (
            <select
              className="input-base appearance-none"
              value={values.birthYear ?? ""}
              onChange={(e) =>
                update({
                  birthYear: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="" disabled>
                Yilni tanlang
              </option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-3">
              {CITIES.map((city) => {
                const selected = values.city === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      update({ city });
                    }}
                    className={`rounded-full border py-3.5 text-[14px] font-semibold transition-all active:scale-[0.97] ${
                      selected
                        ? "border-orange bg-orange text-white shadow-soft"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              {DIRECTIONS.map((direction) => {
                const selected = values.direction === direction.value;
                return (
                  <button
                    key={direction.value}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      // Direction change invalidates previously chosen tags.
                      update({
                        direction: direction.value,
                        ...(values.direction !== direction.value
                          ? { skillTags: [] }
                          : {}),
                      });
                    }}
                    className={`flex flex-col items-start gap-2 rounded-card border p-4 text-left transition-all active:scale-[0.97] ${
                      selected
                        ? "border-orange bg-orange-soft shadow-soft"
                        : "border-line bg-surface"
                    }`}
                  >
                    <span className="text-2xl">{direction.icon}</span>
                    <span className="text-[14px] font-semibold">
                      {direction.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="flex flex-wrap gap-2.5">
                {tagBank.map((tag) => {
                  const selected = values.skillTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.96] ${
                        selected
                          ? "border-orange bg-orange text-white shadow-soft"
                          : "border-line bg-surface text-ink"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[12px] text-ink-soft">
                Tanlandi: {values.skillTags.length}/{MAX_SKILL_TAGS}
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              {LEVELS.map((level) => {
                const selected = values.level === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      update({ level: level.value });
                    }}
                    className={`flex w-full items-center gap-4 rounded-card border p-4 text-left transition-all active:scale-[0.98] ${
                      selected
                        ? "border-orange bg-orange-soft shadow-soft"
                        : "border-line bg-surface"
                    }`}
                  >
                    <span className="text-3xl">{level.icon}</span>
                    <span>
                      <span className="font-display block text-[15px] font-bold">
                        {level.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">
                        {level.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <select
                className="input-base appearance-none"
                value={values.experienceYears ?? ""}
                onChange={(e) =>
                  update({
                    experienceYears: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              >
                <option value="" disabled>
                  Necha yil tajribangiz bor?
                </option>
                {EXPERIENCE_YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y} yil
                  </option>
                ))}
              </select>
              <input
                className="input-base"
                type="text"
                value={values.experienceWhere}
                placeholder="Qayerda ishlagansiz? Masalan: IT Park, frilanser"
                onChange={(e) => update({ experienceWhere: e.target.value })}
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              {WORK_FORMATS.map((format) => {
                const selected = values.workFormats.includes(format.value);
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => toggleFormat(format.value)}
                    className={`flex w-full items-center gap-4 rounded-card border p-4 text-left transition-all active:scale-[0.98] ${
                      selected
                        ? "border-orange bg-orange-soft shadow-soft"
                        : "border-line bg-surface"
                    }`}
                  >
                    <span className="text-2xl">{format.icon}</span>
                    <span className="text-[15px] font-semibold">
                      {format.label}
                    </span>
                    <span
                      className={`ml-auto flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold ${
                        selected
                          ? "border-orange bg-orange text-white"
                          : "border-line bg-surface-2 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 9 && (
            <div>
              <input
                className="input-base"
                type="text"
                autoFocus
                maxLength={80}
                value={values.headline}
                placeholder="Masalan: Frontend'ga oshiq, React o'rganyapman"
                onChange={(e) => update({ headline: e.target.value })}
              />
              <p className="mt-3 text-right text-[12px] text-ink-soft">
                {values.headline.trim().length}/80
              </p>
            </div>
          )}

          {step === 10 && (
            <input
              className="input-base"
              type="text"
              autoFocus
              value={values.education}
              placeholder="O'qish joyingiz va yo'nalishingiz"
              onChange={(e) => update({ education: e.target.value })}
            />
          )}

          {step === 11 && (
            <div className="flex items-center gap-2">
              <span className="num rounded-input border border-line bg-surface px-4 py-3.5 text-[15px] font-semibold">
                +998
              </span>
              <input
                className="input-base num"
                type="tel"
                inputMode="numeric"
                autoFocus
                value={formatPhone(values.phoneDigits)}
                placeholder="90 123 45 67"
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "");
                  if (digits.startsWith("998")) digits = digits.slice(3);
                  update({ phoneDigits: digits.slice(0, 9) });
                }}
              />
            </div>
          )}

          {step === 12 && (
            <textarea
              className="input-base min-h-[160px] resize-none"
              autoFocus
              value={values.freeText}
              placeholder="Qanday loyihalar qilgansiz? Nimalarni bilasiz? Nimani o'rganmoqchisiz?"
              onChange={(e) => update({ freeText: e.target.value })}
            />
          )}

          {step === 13 && (
            <input
              className="input-base"
              type="url"
              autoFocus
              value={values.portfolioUrl}
              placeholder="https://..."
              onChange={(e) => update({ portfolioUrl: e.target.value })}
            />
          )}

          {error && (
            <p className="mt-3 text-[13px] font-medium text-orange-deep">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6">
          <PillButton
            onClick={() => void submitStep()}
            disabled={!canContinue}
            loading={submitting}
          >
            {step === TOTAL_STEPS ? "Yakunlash" : "Davom etish"}
          </PillButton>
          {step === TOTAL_STEPS && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitStep(true)}
              className="mt-3 w-full py-2 text-center text-[14px] font-semibold text-ink-soft active:opacity-60"
            >
              O&apos;tkazib yuborish
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
