"use client";

import { Quiz } from "@/components/Quiz";
import { PERSONALITY_QUESTIONS } from "@/mock/quiz";

const ARCHETYPES = [
  "Yaratuvchi",
  "Tahlilchi",
  "Yetakchi",
  "Aloqachi",
  "Ijrochi",
  "Kashfiyotchi",
];

export default function ShaxsiyatPage(): JSX.Element {
  return (
    <Quiz
      questions={PERSONALITY_QUESTIONS}
      result={(answers) => {
        const sum = answers.reduce((s, x) => s + x, 0);
        const arch = ARCHETYPES[sum % ARCHETYPES.length] ?? "Yaratuvchi";
        return {
          title: arch,
          text: "Sizning ish arxetipingiz aniqlandi. Endi ko'nikma testiga o'ting.",
        };
      }}
    />
  );
}
