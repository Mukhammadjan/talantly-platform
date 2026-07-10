"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ARCHETYPE_META,
  DIRECTION_LABELS_UZ,
  LEVEL_LABELS_UZ,
  WORK_FORMAT_LABELS_UZ,
} from "@talantly/shared";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { TalentDetailPublic } from "@/lib/apiTypes";
import { haptic, initTelegramUi } from "@/lib/telegram";

function ScoreDial({ score }: { score: number }): JSX.Element {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(1, Math.max(0, score / 100));
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--green)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-bold leading-none text-green-deep">
          {score}
        </span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-soft">
          ball
        </span>
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element | null {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="label-caps shrink-0 pt-0.5">{label}</span>
      <span className="min-w-0 break-words text-right text-[14px] font-medium">
        {value}
      </span>
    </div>
  );
}

export default function TalentDetailPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const router = useRouter();
  const [talent, setTalent] = useState<TalentDetailPublic | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    authenticate()
      .then(() => apiFetch<TalentDetailPublic>(`/api/talent/${params.id}`))
      .then((detail) => {
        if (cancelled) return;
        setTalent(detail);
        setSent(detail.requested);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router, params.id]);

  const sendRequest = async (): Promise<void> => {
    if (sending || sent || !talent) return;
    setSending(true);
    setRequestError(null);
    try {
      await apiFetch<{ sent: boolean }>("/api/request", {
        method: "POST",
        body: JSON.stringify({ talentId: talent.id }),
      });
      haptic("success");
      setSent(true);
    } catch (err) {
      haptic("error");
      setRequestError(
        err instanceof ApiError
          ? err.message
          : "Xatolik yuz berdi. Qayta urinib ko'ring.",
      );
    } finally {
      setSending(false);
    }
  };

  if (failed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-center text-[14px] text-ink-soft">
          Nomzodni yuklab bo&apos;lmadi.
        </p>
        <PillButton
          variant="ghost"
          className="mt-5 max-w-[200px]"
          onClick={() => router.push("/izlovchi")}
        >
          Ro&apos;yxatga qaytish
        </PillButton>
      </main>
    );
  }

  if (!talent) {
    return (
      <main className="px-5 pt-6">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="mt-5 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </div>
        <Skeleton className="mt-6 h-32 w-full rounded-card" />
        <Skeleton className="mt-4 h-44 w-full rounded-card" />
      </main>
    );
  }

  const archetype = talent.archetypeCode
    ? ARCHETYPE_META[talent.archetypeCode]
    : null;
  const skills = talent.cvSkills.length > 0 ? talent.cvSkills : talent.skillTags;
  const subtitleParts = [
    talent.direction ? DIRECTION_LABELS_UZ[talent.direction] : null,
    talent.level ? LEVEL_LABELS_UZ[talent.level] : null,
    talent.city,
  ].filter(Boolean);

  return (
    <main className="px-5 pb-44 pt-6">
      <button
        type="button"
        onClick={() => {
          haptic("light");
          router.back();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-[18px] text-ink-soft transition-all active:scale-95"
        aria-label="Orqaga"
      >
        ‹
      </button>

      <div className="mt-5 flex items-center gap-4">
        {talent.photoUrl ? (
          <img
            src={talent.photoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange text-[24px] font-bold text-white shadow-soft">
            {talent.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-[20px] font-bold tracking-tight">
            <span className="truncate">{talent.displayName}</span>
            <Seal size={22} className="shrink-0" />
          </h1>
          <p className="text-[13px] text-ink-soft">
            {subtitleParts.join(" · ")}
          </p>
        </div>
      </div>

      {talent.headline && (
        <p className="mt-3 text-[14px] font-medium italic text-ink-soft">
          &quot;{talent.headline}&quot;
        </p>
      )}

      <Card className="mt-5 flex items-center gap-4">
        {talent.score !== null ? (
          <ScoreDial score={talent.score} />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cream text-[13px] font-semibold text-ink-soft">
            —
          </span>
        )}
        <div className="min-w-0">
          <p className="label-caps">Skill test</p>
          <p className="mt-1 text-[14px] font-semibold text-ink">
            {talent.score !== null
              ? "Testdan muvaffaqiyatli o'tgan"
              : "Ball hali mavjud emas"}
          </p>
          {talent.rating !== null && (
            <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">
              Suhbat bahosi:{" "}
              <span className="text-orange">
                {"★".repeat(talent.rating)}
              </span>
              <span className="text-line">
                {"★".repeat(5 - talent.rating)}
              </span>
            </p>
          )}
        </div>
      </Card>

      {archetype && (
        <Card className="mt-4">
          <p className="label-caps">Xarakter</p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-tint text-[24px]"
              aria-hidden
            >
              {archetype.emoji}
            </span>
            <div>
              <p className="text-[16px] font-bold">
                {talent.archetypeLabel ?? archetype.label}
              </p>
              <p className="text-[12px] text-ink-soft">{archetype.tagline}</p>
            </div>
          </div>
          {talent.traits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {talent.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-orange-tint px-3 py-1 text-[12px] font-semibold text-orange-deep"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {(talent.aiVerdict || talent.summary) && (
        <Card className="mt-4">
          <p className="label-caps">AI xulosasi</p>
          {talent.summary && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {talent.summary}
            </p>
          )}
          {talent.aiVerdict && (
            <p className="mt-3 rounded-input bg-green-tint p-3.5 text-[13px] font-medium leading-relaxed text-green-deep">
              {talent.aiVerdict}
            </p>
          )}
        </Card>
      )}

      {skills.length > 0 && (
        <Card className="mt-4">
          <p className="label-caps">Ko&apos;nikmalar</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-line bg-cream px-3 py-1 text-[12px] font-semibold text-ink"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <DetailRow label="Ta'lim" value={talent.education} />
        <DetailRow
          label="Tajriba"
          value={
            talent.experienceYears !== null
              ? `${talent.experienceYears} yil`
              : talent.level === "intern"
                ? "Intern — endi boshlayapti"
                : null
          }
        />
        <DetailRow
          label="Ish formati"
          value={
            talent.workFormats.length > 0
              ? talent.workFormats
                  .map((format) => WORK_FORMAT_LABELS_UZ[format])
                  .join(", ")
              : null
          }
        />
      </Card>

      <div className="mt-4">
        <PillButton variant="ghost" disabled onClick={() => undefined}>
          CV ni ko&apos;rish 🔒
        </PillButton>
        <p className="mt-2 text-center text-[12px] text-ink-soft">
          So&apos;rov yuborganingizdan keyin ochiladi.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-app border-t border-line bg-cream px-5 pb-6 pt-4">
        {sent ? (
          <p className="rounded-input bg-green-tint p-4 text-center text-[14px] font-semibold text-green-deep">
            So&apos;rov yuborildi ✓ 24 soat ichida bog&apos;lanamiz.
          </p>
        ) : (
          <>
            <PillButton loading={sending} onClick={() => void sendRequest()}>
              Nomzodni so&apos;rash
            </PillButton>
            {requestError && (
              <p className="mt-2 text-center text-[12px] text-orange-deep">
                {requestError}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
