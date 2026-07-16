"use client";

import { useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { api } from "@/lib/api";
import type { Question } from "@/mock/quiz";

export default function KonikmaPage(): JSX.Element | null {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let live = true;
    api.getSkillQuestions().then((q) => {
      if (live) setQuestions(q);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!questions) return null;

  return (
    <Quiz
      questions={questions}
      result={async (answers) => {
        // Server correct_index bilan baholaydi; mock rejimda 1-variant to'g'ri.
        const saved = await api.saveSkillTest(answers);
        const score =
          saved?.score ??
          Math.round(
            (answers.filter((x) => x === 0).length / answers.length) * 100,
          );
        const passed = saved?.passed ?? score >= 60;
        return {
          title: `${score} ball`,
          text: passed
            ? "Testdan muvaffaqiyatli o'tdingiz! Endi suhbat vaqtini tanlang."
            : "Bilimlaringizni mustahkamlab, qayta urinib ko'ring.",
        };
      }}
    />
  );
}
