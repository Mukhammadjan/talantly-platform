"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  TalentSnapshot,
  TestAnswerResponse,
  TestQuestionPublic,
  TestStartResponse,
} from "@/lib/apiTypes";
import { haptic } from "@/lib/telegram";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

type TestPhase =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | {
      kind: "question";
      questions: TestQuestionPublic[];
      index: number;
      submitting: boolean;
      selected: number | null;
    }
  | { kind: "result"; score: number }
  | { kind: "error"; message: string };

function encouragement(score: number): { title: string; body: string } {
  if (score >= 70) {
    return {
      title: "Zo'r natija!",
      body: "Siz bilimingizni isbotladingiz. Endi jonli suhbat bosqichiga o'ting — sizni kutamiz!",
    };
  }
  if (score >= 40) {
    return {
      title: "Yaxshi harakat!",
      body: "Natijangiz yomon emas. Suhbatda o'zingizni ko'rsating — jamoamiz sizni baholaydi.",
    };
  }
  return {
    title: "Boshlanish shunday bo'ladi",
    body: "Har bir mutaxassis shu yo'ldan o'tgan. Suhbatda motivatsiyangizni ko'rsating — bu ham muhim mezon.",
  };
}

function ScoreDial({ score }: { score: number }): JSX.Element {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - score / 100);
  const color = score >= 70 ? "var(--green)" : "var(--orange)";
  return (
    <svg width={140} height={140} viewBox="0 0 140 140" role="img" aria-label={`${score} ball`}>
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke="var(--line)"
        strokeWidth={10}
      />
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 900ms ease" }}
      />
      <text
        x={70}
        y={66}
        textAnchor="middle"
        fontSize={30}
        fontWeight={700}
        fill="var(--ink)"
      >
        {score}
      </text>
      <text
        x={70}
        y={88}
        textAnchor="middle"
        fontSize={12}
        fill="var(--ink-soft)"
      >
        / 100 ball
      </text>
    </svg>
  );
}

export default function TestPage(): JSX.Element {
  const router = useRouter();
  const [phase, setPhase] = useState<TestPhase>({ kind: "loading" });

  const start = useCallback(async () => {
    setPhase({ kind: "loading" });
    try {
      const { snapshot } = await apiFetch<{ snapshot: TalentSnapshot }>("/api/me");
      if (snapshot.status === "test_otgan") {
        router.replace("/booking");
        return;
      }
      const eligible =
        (snapshot.status === "malumot_toldirilgan" && snapshot.personality) ||
        snapshot.status === "cv_tayyor";
      if (!eligible) {
        router.replace(
          snapshot.status === "malumot_toldirilgan" ? "/xarakter" : "/profile",
        );
        return;
      }
      const res = await apiFetch<TestStartResponse>("/api/test/start", {
        method: "POST",
      });
      if (!res.available || res.questions.length === 0) {
        setPhase({ kind: "unavailable" });
        return;
      }
      const answeredIds = new Set(Object.keys(res.answered));
      const firstUnanswered = res.questions.findIndex(
        (q) => !answeredIds.has(q.id),
      );
      setPhase({
        kind: "question",
        questions: res.questions,
        index: firstUnanswered === -1 ? res.questions.length - 1 : firstUnanswered,
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
      const res = await apiFetch<TestAnswerResponse>("/api/test/answer", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          answerIndex: optionIndex,
        }),
      });
      if (res.done && res.score !== null) {
        setPhase({ kind: "result", score: res.score });
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
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-2 w-full" />
        <Card className="mt-6 space-y-4">
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </main>
    );
  }

  if (phase.kind === "unavailable") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <div className="text-5xl">🛠️</div>
        <h1 className="mt-5 text-xl font-bold">Test tez orada</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Sizning yo&apos;nalishingiz uchun test savollari tayyorlanmoqda.
          Tayyor bo&apos;lishi bilan sizga xabar beramiz.
        </p>
        <PillButton
          variant="ghost"
          className="mt-8"
          onClick={() => router.replace("/profile")}
        >
          Profilga qaytish
        </PillButton>
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
    const { title, body } = encouragement(phase.score);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <div className="seal-pop">
          <ScoreDial score={phase.score} />
        </div>
        <h1 className="mt-6 text-xl font-bold">{title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{body}</p>
        <PillButton
          variant="green"
          className="mt-8"
          onClick={() => router.replace("/booking")}
        >
          Suhbat vaqtini tanlash
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
        <span className="label-caps">Skill test</span>
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
                className={`flex w-full items-center gap-3 rounded-card border p-4 text-left text-[14px] leading-snug transition-all active:scale-[0.98] disabled:opacity-60 ${
                  isSelected
                    ? "border-orange bg-orange-tint font-semibold"
                    : "border-line bg-surface"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                    isSelected
                      ? "bg-orange text-white"
                      : "bg-cream text-ink-soft"
                  }`}
                >
                  {OPTION_LETTERS[i] ?? i + 1}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[12px] text-ink-soft">
          Javobni tanlagach, keyingi savolga o&apos;tiladi. Orqaga qaytib
          bo&apos;lmaydi.
        </p>
      </div>
    </main>
  );
}
