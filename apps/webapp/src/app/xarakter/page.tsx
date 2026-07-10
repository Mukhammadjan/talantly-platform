"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ARCHETYPE_META, type Archetype } from "@talantly/shared";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  PersonalityAnswerResponse,
  PersonalityQuestionPublic,
  PersonalityStartResponse,
  PersonalitySummary,
  TalentSnapshot,
} from "@/lib/apiTypes";
import { haptic } from "@/lib/telegram";

type Phase =
  | { kind: "loading" }
  | {
      kind: "intro";
      questions: PersonalityQuestionPublic[];
      answered: Record<string, number>;
    }
  | {
      kind: "question";
      questions: PersonalityQuestionPublic[];
      index: number;
      submitting: boolean;
      selected: number | null;
    }
  | { kind: "result"; result: PersonalitySummary }
  | { kind: "error"; message: string };

function archetypeEmoji(code: string): string {
  return ARCHETYPE_META[code as Archetype]?.emoji ?? "✨";
}

function ResultScreen({
  result,
  onNext,
}: {
  result: PersonalitySummary;
  onNext: () => void;
}): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
      <div className="seal-pop flex h-24 w-24 items-center justify-center rounded-full bg-orange-tint text-5xl">
        {archetypeEmoji(result.archetypeCode)}
      </div>
      <span className="label-caps mt-6 text-orange">Sizning xarakteringiz</span>
      <h1 className="mt-2 text-2xl font-bold">{result.archetypeLabel}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {result.tagline}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {result.traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink"
          >
            {trait}
          </span>
        ))}
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-ink-soft">
        Bu natija kompaniyalarga sizning ish uslubingizni tushunishga yordam
        beradi va profilingizda ko&apos;rsatiladi.
      </p>
      <PillButton className="mt-8 w-full" onClick={onNext}>
        Skill testga o&apos;tish
      </PillButton>
    </main>
  );
}

export default function XarakterPage(): JSX.Element {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  const start = useCallback(async () => {
    setPhase({ kind: "loading" });
    try {
      const { snapshot } = await apiFetch<{ snapshot: TalentSnapshot }>(
        "/api/me",
      );
      if (snapshot.status === "yangi") {
        router.replace("/register");
        return;
      }
      const res = await apiFetch<PersonalityStartResponse>(
        "/api/personality/start",
        { method: "POST" },
      );
      if (res.done && res.result) {
        setPhase({ kind: "result", result: res.result });
        return;
      }
      if (res.questions.length === 0) {
        setPhase({
          kind: "error",
          message: "Savollar hozircha mavjud emas. Birozdan so'ng urinib ko'ring.",
        });
        return;
      }
      if (Object.keys(res.answered).length === 0) {
        setPhase({ kind: "intro", questions: res.questions, answered: {} });
        return;
      }
      const answeredIds = new Set(Object.keys(res.answered));
      const firstUnanswered = res.questions.findIndex(
        (q) => !answeredIds.has(q.id),
      );
      setPhase({
        kind: "question",
        questions: res.questions,
        index:
          firstUnanswered === -1 ? res.questions.length - 1 : firstUnanswered,
        submitting: false,
        selected: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Testni yuklashda xatolik yuz berdi.";
      setPhase({ kind: "error", message });
    }
  }, [router]);

  useEffect(() => {
    void start();
  }, [start]);

  async function answer(optionIndex: number): Promise<void> {
    if (phase.kind !== "question" || phase.submitting) return;
    haptic();
    const question = phase.questions[phase.index];
    if (!question) return;
    setPhase({ ...phase, submitting: true, selected: optionIndex });
    try {
      const res = await apiFetch<PersonalityAnswerResponse>(
        "/api/personality/answer",
        {
          method: "POST",
          body: JSON.stringify({ questionId: question.id, optionIndex }),
        },
      );
      if (res.done && res.result) {
        setPhase({ kind: "result", result: res.result });
        return;
      }
      setPhase({
        kind: "question",
        questions: phase.questions,
        index: phase.index + 1,
        submitting: false,
        selected: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Javobni yuborishda xatolik yuz berdi.";
      setPhase({ kind: "error", message });
    }
  }

  if (phase.kind === "loading") {
    return (
      <main className="px-5 pb-10 pt-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-2 w-full" />
        <Card className="mt-6 space-y-4">
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </main>
    );
  }

  if (phase.kind === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          {phase.message}
        </p>
        <PillButton className="mt-6" onClick={() => void start()}>
          Qayta urinish
        </PillButton>
      </main>
    );
  }

  if (phase.kind === "result") {
    return (
      <ResultScreen
        result={phase.result}
        onNext={() => router.replace("/test")}
      />
    );
  }

  if (phase.kind === "intro") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-5 text-xl font-bold">Xarakter testi</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          {phase.questions.length} ta qisqa savol — to&apos;g&apos;ri yoki
          noto&apos;g&apos;ri javob yo&apos;q. Samimiy javob bering, biz
          sizning ish uslubingizni aniqlaymiz.
        </p>
        <PillButton
          className="mt-8 w-full"
          onClick={() =>
            setPhase({
              kind: "question",
              questions: phase.questions,
              index: 0,
              submitting: false,
              selected: null,
            })
          }
        >
          Boshlash
        </PillButton>
      </main>
    );
  }

  const question = phase.questions[phase.index];
  if (!question) {
    return (
      <main className="px-5 pt-8">
        <p className="text-[14px] text-ink-soft">Savol topilmadi.</p>
      </main>
    );
  }
  const total = phase.questions.length;
  const current = phase.index + 1;

  return (
    <main className="px-5 pb-10 pt-8">
      <div className="flex items-center justify-between">
        <span className="label-caps">Xarakter testi</span>
        <span className="text-[13px] font-semibold text-ink-soft">
          Savol {current}/{total}
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={current / total} />
      </div>

      <div key={question.id} className="step-enter">
        <h1 className="mt-6 text-[17px] font-bold leading-snug">
          {question.question}
        </h1>

        <div className="mt-5 space-y-3">
          {question.options.map((option, i) => {
            const isSelected = phase.selected === i;
            return (
              <button
                key={i}
                type="button"
                disabled={phase.submitting}
                onClick={() => void answer(i)}
                className={`w-full rounded-card border p-4 text-left text-[14px] leading-snug transition-all active:scale-[0.98] disabled:opacity-60 ${
                  isSelected
                    ? "border-orange bg-orange-tint font-semibold"
                    : "border-line bg-surface"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[12px] text-ink-soft">
          Samimiy javob bering — bu yerda &quot;noto&apos;g&apos;ri&quot;
          javob yo&apos;q.
        </p>
      </div>
    </main>
  );
}
