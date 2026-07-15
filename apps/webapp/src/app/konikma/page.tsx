"use client";

import { Quiz } from "@/components/Quiz";
import { SKILL_QUESTIONS } from "@/mock/quiz";

export default function KonikmaPage(): JSX.Element {
  return (
    <Quiz
      questions={SKILL_QUESTIONS}
      result={(answers) => {
        // Mock: har savolda to'g'ri javob — birinchi variant (index 0).
        const correct = answers.filter((x) => x === 0).length;
        const score = Math.round((correct / SKILL_QUESTIONS.length) * 100);
        return {
          title: `${score} ball`,
          text:
            score >= 60
              ? "Testdan muvaffaqiyatli o'tdingiz! Endi suhbat vaqtini tanlang."
              : "Bilimlaringizni mustahkamlab, qayta urinib ko'ring.",
        };
      }}
    />
  );
}
