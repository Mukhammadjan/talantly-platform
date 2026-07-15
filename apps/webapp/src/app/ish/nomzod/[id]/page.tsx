"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopHeader } from "@/components/recruiter/Nav";
import { Icon } from "@/components/recruiter/icons";
import {
  Avatar,
  Button,
  ScoreBadge,
  SkillTag,
  VerifiedSeal,
} from "@/components/recruiter/ui";
import { useRecruiter } from "@/lib/recruiter/store";
import { ApiError, apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { TalentDetailPublic } from "@/lib/apiTypes";
import { detailToCandidate } from "@/lib/recruiter/adapt";
import type { Candidate } from "@/lib/recruiter/data";
import { haptic, initTelegramUi } from "@/lib/telegram";

export default function CandidateDetail(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isSaved, toggleSave } = useRecruiter();

  const [c, setC] = useState<Candidate | null>(null);
  const [failed, setFailed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setC(detailToCandidate(detail));
        setRequested(detail.requested);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router, params.id]);

  const sendRequest = async (): Promise<void> => {
    if (!c || sending || requested) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch<{ sent: boolean }>("/api/request", {
        method: "POST",
        body: JSON.stringify({ talentId: c.id }),
      });
      haptic("success");
      setRequested(true);
    } catch (err) {
      haptic("error");
      setError(
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
      <div className="flex min-h-app flex-col items-center justify-center bg-canvas px-6">
        <p className="text-center text-[14px] text-muted">
          Nomzodni yuklab bo&apos;lmadi.
        </p>
        <button
          type="button"
          onClick={() => router.push("/ish")}
          className="mt-5 rounded-pill border border-line px-5 py-2.5 text-[14px] font-semibold text-text"
        >
          Ro&apos;yxatga qaytish
        </button>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="min-h-app bg-canvas px-4 pt-16">
        <div className="skeleton h-24 w-24 rounded-full mx-auto" aria-hidden />
        <div className="skeleton mx-auto mt-4 h-6 w-1/2 rounded" aria-hidden />
        <div className="skeleton mt-6 h-40 w-full rounded-card" aria-hidden />
      </div>
    );
  }

  const saved = isSaved(c.id);

  return (
    <div className="min-h-app bg-canvas pb-28">
      <TopHeader
        title="Nomzod"
        back
        right={
          <button
            type="button"
            onClick={() => toggleSave(c.id)}
            aria-label="Saqlash"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface ${
              saved ? "text-orange" : "text-text"
            } active:bg-surface2`}
          >
            <Icon name="bookmark" size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="flex flex-col items-center rounded-card border border-line bg-surface p-5 text-center">
          <Avatar name={c.name} tone={c.tone} size={84} />
          <h2 className="mt-3 text-[21px] font-semibold text-text">{c.name}</h2>
          <p className="mt-0.5 text-[14px] text-muted">
            {c.role}
            {c.archetype ? ` · ${c.archetype}` : ""}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {c.verified ? <VerifiedSeal /> : null}
            <ScoreBadge score={c.score} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <Stat icon="pin" label="Shahar" value={c.district || "—"} />
          <Stat icon="briefcase" label="Tajriba" value={c.experience || "—"} />
          <Stat icon="star" label="Ball" value={String(c.score)} />
        </div>

        {c.skills.length > 0 ? (
          <Section title="Ko'nikmalar">
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <SkillTag key={s} label={s} />
              ))}
            </div>
          </Section>
        ) : null}

        {c.about ? (
          <Section title="Haqida">
            <p className="text-[14.5px] leading-relaxed text-muted">{c.about}</p>
          </Section>
        ) : null}
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app border-t border-line bg-surface/95 px-4 pt-3 backdrop-blur">
        {requested ? (
          <p className="rounded-input bg-green-soft p-4 text-center text-[14px] font-semibold text-green">
            So&apos;rov yuborildi ✓ 24 soat ichida bog&apos;lanamiz.
          </p>
        ) : (
          <>
            <Button
              full
              icon={<Icon name="send" size={18} />}
              onClick={() => void sendRequest()}
            >
              {sending ? "Yuborilmoqda..." : "Nomzodni so'rash"}
            </Button>
            {error ? (
              <p className="mt-2 text-center text-[12px] text-orange-deep">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: "pin" | "briefcase" | "star";
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="rounded-card border border-line bg-surface p-3 text-center">
      <Icon name={icon} size={18} className="mx-auto text-orange" />
      <p className="mt-1.5 text-[13px] font-semibold text-text">{value}</p>
      <p className="text-[11.5px] text-dim">{label}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-dim">
        {title}
      </h3>
      <div className="rounded-card border border-line bg-surface p-4">
        {children}
      </div>
    </div>
  );
}
