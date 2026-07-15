"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DIRECTION_LABELS_UZ,
  LEVEL_LABELS_UZ,
  SKILL_TAG_BANK,
  WORK_FORMAT_LABELS_UZ,
  type Direction,
  type TalentLevel,
  type WorkFormat,
} from "@talantly/shared";
import { PillButton } from "@/components/PillButton";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch, isInsideTelegram } from "@/lib/api";
import {
  SALARY_CURRENCIES,
  type ProfileEditPayload,
  type TalentSnapshot,
} from "@/lib/apiTypes";
import {
  CITIES,
  DIRECTIONS,
  EXPERIENCE_YEARS_MAX,
  LEVELS,
  MAX_SKILL_TAGS,
  WORK_FORMATS,
} from "@/lib/registration";
import { haptic, initTelegramUi } from "@/lib/telegram";
import { useTelegramBackButton } from "@/lib/useTelegramBackButton";

interface FormState {
  fullName: string;
  city: string;
  direction: Direction;
  level: TalentLevel;
  experienceYears: string;
  skillTags: string[];
  workFormats: WorkFormat[];
  salaryFrom: string;
  salaryCurrency: string;
  headline: string;
  freeText: string;
  portfolioUrl: string;
}

function fromSnapshot(s: TalentSnapshot): FormState {
  return {
    fullName: s.fullName ?? "",
    city: s.city ?? CITIES[0],
    direction: s.direction ?? "dasturlash",
    level: s.level ?? "intern",
    experienceYears: s.experienceYears != null ? String(s.experienceYears) : "",
    skillTags: [...s.skillTags],
    workFormats: [...s.workFormats],
    salaryFrom: s.salaryFrom != null ? String(s.salaryFrom) : "",
    salaryCurrency: s.salaryCurrency ?? "UZS",
    headline: s.headline ?? "",
    freeText: s.freeText ?? "",
    portfolioUrl: s.portfolioUrl ?? "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <p className="label-caps">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Chip({
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
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
        active
          ? "border-orange bg-orange-soft text-orange-deep"
          : "border-line bg-surface text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProfileEditPage(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useTelegramBackButton(() => router.push("/profile"));

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    apiFetch<{ snapshot: TalentSnapshot }>("/api/me")
      .then(({ snapshot }) => {
        if (cancelled) return;
        if (snapshot.status === "yangi") {
          router.replace("/register");
          return;
        }
        setForm(fromSnapshot(snapshot));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const tagBank = useMemo(() => {
    if (!form) return [];
    const bank = SKILL_TAG_BANK[form.direction] ?? [];
    return [...new Set([...form.skillTags, ...bank])];
  }, [form]);

  const patch = (next: Partial<FormState>): void => {
    setForm((prev) => (prev ? { ...prev, ...next } : prev));
    setError(null);
  };

  const toggleTag = (tag: string): void => {
    if (!form) return;
    if (form.skillTags.includes(tag)) {
      patch({ skillTags: form.skillTags.filter((t) => t !== tag) });
      return;
    }
    if (form.skillTags.length >= MAX_SKILL_TAGS) {
      setError(`Ko'pi bilan ${MAX_SKILL_TAGS} ta ko'nikma tanlash mumkin.`);
      return;
    }
    patch({ skillTags: [...form.skillTags, tag] });
  };

  const toggleFormat = (value: WorkFormat): void => {
    if (!form) return;
    patch({
      workFormats: form.workFormats.includes(value)
        ? form.workFormats.filter((f) => f !== value)
        : [...form.workFormats, value],
    });
  };

  const save = async (): Promise<void> => {
    if (!form || saving) return;
    setSaving(true);
    setError(null);
    const payload: ProfileEditPayload = {
      fullName: form.fullName.trim(),
      city: form.city,
      direction: form.direction,
      level: form.level,
      experienceYears:
        form.level === "mutaxassis" && form.experienceYears !== ""
          ? Number(form.experienceYears)
          : null,
      skillTags: form.skillTags,
      workFormats: form.workFormats,
      headline: form.headline.trim() || null,
      freeText: form.freeText.trim() || null,
      portfolioUrl: form.portfolioUrl.trim() || null,
      salaryFrom: form.salaryFrom !== "" ? Number(form.salaryFrom) : null,
      salaryCurrency: form.salaryCurrency,
    };
    try {
      await apiFetch<{ snapshot: TalentSnapshot }>("/api/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      haptic("success");
      router.push("/profile");
    } catch (err) {
      haptic("error");
      setError(
        err instanceof ApiError
          ? err.message
          : "Saqlab bo'lmadi. Qayta urinib ko'ring.",
      );
      setSaving(false);
    }
  };

  if (failed) {
    return (
      <main className="flex min-h-app flex-col items-center justify-center px-6">
        <p className="text-center text-[14px] text-ink-soft">
          Profilni yuklab bo&apos;lmadi. Ilovani yopib, qayta oching.
        </p>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="px-5 pt-8">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="mt-4 h-24 w-full rounded-card" />
        <Skeleton className="mt-4 h-24 w-full rounded-card" />
      </main>
    );
  }

  const canSave =
    form.fullName.trim().length >= 2 && Boolean(form.city) && !saving;

  return (
    <main className="px-5 pb-28 pt-6">
      <h1 className="text-[21px] font-bold tracking-tight text-ink">
        Profilni tahrirlash
      </h1>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        O&apos;zgartirishlar darhol saqlanadi.
      </p>

      <div className="mt-6 space-y-6">
        <Field label="Ism familiya">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            maxLength={80}
            placeholder="Ism familiyangiz"
            className="input-base"
          />
        </Field>

        <Field label="Shahar">
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <Chip
                key={city}
                label={city}
                active={form.city === city}
                onToggle={() => patch({ city })}
              />
            ))}
          </div>
        </Field>

        <Field label="Yo'nalish">
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <Chip
                key={d.value}
                label={`${d.icon} ${DIRECTION_LABELS_UZ[d.value]}`}
                active={form.direction === d.value}
                onToggle={() => patch({ direction: d.value, skillTags: [] })}
              />
            ))}
          </div>
        </Field>

        <Field label="Daraja">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Chip
                key={l.value}
                label={`${l.icon} ${LEVEL_LABELS_UZ[l.value]}`}
                active={form.level === l.value}
                onToggle={() =>
                  patch({
                    level: l.value,
                    experienceYears:
                      l.value === "intern" ? "" : form.experienceYears,
                  })
                }
              />
            ))}
          </div>
        </Field>

        {form.level === "mutaxassis" && (
          <Field label="Tajriba (yil)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={EXPERIENCE_YEARS_MAX}
              value={form.experienceYears}
              onChange={(e) => patch({ experienceYears: e.target.value })}
              placeholder="Masalan: 3"
              className="input-base"
            />
          </Field>
        )}

        <Field label={`Ko'nikmalar (${form.skillTags.length}/${MAX_SKILL_TAGS})`}>
          <div className="flex flex-wrap gap-2">
            {tagBank.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                active={form.skillTags.includes(tag)}
                onToggle={() => toggleTag(tag)}
              />
            ))}
          </div>
        </Field>

        <Field label="Ish formati">
          <div className="flex flex-wrap gap-2">
            {WORK_FORMATS.map((w) => (
              <Chip
                key={w.value}
                label={`${w.icon} ${WORK_FORMAT_LABELS_UZ[w.value]}`}
                active={form.workFormats.includes(w.value)}
                onToggle={() => toggleFormat(w.value)}
              />
            ))}
          </div>
        </Field>

        <Field label="Kutilayotgan maosh (oylik)">
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.salaryFrom}
              onChange={(e) => patch({ salaryFrom: e.target.value })}
              placeholder="Masalan: 5000000"
              className="input-base flex-1"
            />
            <div className="flex shrink-0 gap-1">
              {SALARY_CURRENCIES.map((cur) => (
                <Chip
                  key={cur}
                  label={cur}
                  active={form.salaryCurrency === cur}
                  onToggle={() => patch({ salaryCurrency: cur })}
                />
              ))}
            </div>
          </div>
        </Field>

        <Field label="Qisqa ibora (kartada ko'rinadi)">
          <input
            type="text"
            value={form.headline}
            onChange={(e) => patch({ headline: e.target.value })}
            maxLength={90}
            placeholder="Masalan: Frontend dasturchi, React"
            className="input-base"
          />
        </Field>

        <Field label="Siz haqingizda">
          <textarea
            value={form.freeText}
            onChange={(e) => patch({ freeText: e.target.value })}
            maxLength={800}
            rows={4}
            placeholder="O'zingiz, tajribangiz va maqsadlaringiz haqida qisqacha."
            className="input-base resize-none"
          />
        </Field>

        <Field label="Portfolio havolasi">
          <input
            type="url"
            inputMode="url"
            value={form.portfolioUrl}
            onChange={(e) => patch({ portfolioUrl: e.target.value })}
            placeholder="https://..."
            className="input-base"
          />
        </Field>
      </div>

      {error && (
        <p className="mt-5 text-center text-[13px] text-orange-deep">{error}</p>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto max-w-app border-t border-line bg-surface px-5 pt-4">
        <PillButton disabled={!canSave} loading={saving} onClick={() => void save()}>
          Saqlash
        </PillButton>
      </div>
    </main>
  );
}
