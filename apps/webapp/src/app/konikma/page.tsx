"use client";

import { useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { api } from "@/lib/api";
import type { Question } from "@/mock/quiz";

function formatRetry(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function KonikmaPage(): JSX.Element | null {
  const [data, setData] = useState<{
    questions: Question[];
    key: string | null;
    secondsPerQuestion: number;
  } | null>(null);

  useEffect(() => {
    let live = true;
    api.getSkillQuestions().then((d) => {
      if (live) setData(d);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!data) return null;

  return (
    <Quiz
      questions={data.questions}
      secondsPerQuestion={data.secondsPerQuestion}
      result={async (answers) => {
        const saved = await api.saveSkillTest(data.key, answers);
        if (saved && "error" in saved) {
          if (saved.error === "cooldown") {
            return {
              title: "Biroz kuting",
              text: `Keyingi urinish ${formatRetry(saved.retryAt)} dan keyin ochiladi. Bilimlaringizni mustahkamlab keling!`,
            };
          }
          return {
            title: "Urinishlar tugadi",
            text: "3 urinish ishlatildi. Administrator bilan bog'lanishingiz mumkin.",
          };
        }
        // Mock rejim (saved=null): 1-variant to'g'ri deb hisoblanadi.
        const score =
          saved?.score ??
          Math.round(
            (answers.filter((x) => x === 0).length / answers.length) * 100,
          );
        const passed = saved?.passed ?? score >= 60;
        const left = saved?.attemptsLeft;
        return {
          title: `${score} ball`,
          text: passed
            ? "Testdan muvaffaqiyatli o'tdingiz! Endi suhbat vaqtini tanlang."
            : left != null && left > 0
              ? `Bu safar yetmadi. 24 soatdan so'ng qayta urinib ko'ring — ${left} ta urinish qoldi.`
              : "Bilimlaringizni mustahkamlab, qayta urinib ko'ring.",
        };
      }}
    />
  );
}
