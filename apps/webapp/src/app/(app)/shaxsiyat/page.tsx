"use client";

import { useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { api } from "@/lib/api";
import type { Question } from "@/mock/quiz";

const ARCHETYPES = [
  "Yaratuvchi",
  "Tahlilchi",
  "Yetakchi",
  "Aloqachi",
  "Ijrochi",
  "Kashfiyotchi",
];

export default function ShaxsiyatPage(): JSX.Element | null {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let live = true;
    api.getPersonalityQuestions().then((q) => {
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
        // Server saqlaydi va arxetipni beradi; mock rejimda lokal hisob.
        const saved = await api.savePersonality(answers);
        const arch =
          saved?.archetype ??
          ARCHETYPES[answers.reduce((s, x) => s + x, 0) % ARCHETYPES.length] ??
          "Yaratuvchi";
        return {
          title: arch,
          text: "Sizning ish arxetipingiz aniqlandi. Keyingi qadam asosiy sahifada sizni kutmoqda.",
        };
      }}
    />
  );
}
