"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Progress } from "@/components/Progress";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import type { Question } from "@/mock/quiz";
import styles from "./Quiz.module.css";

interface QuizResult {
  title: string;
  text: string;
}

interface QuizProps {
  questions: Question[];
  result: (answers: number[]) => QuizResult;
}

export function Quiz({ questions, result }: QuizProps): JSX.Element | null {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  useBackButton(
    done
      ? null
      : () => {
          if (index === 0) setExitOpen(true);
          else setIndex((i) => i - 1);
        },
  );

  const pick = (opt: number): void => {
    haptic("light");
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = opt;
      return next;
    });
    window.setTimeout(() => {
      if (index + 1 < questions.length) setIndex(index + 1);
      else setDone(true);
    }, 180);
  };

  if (done) {
    const r = result(answers);
    return (
      <main className="screen">
        <div className={styles.result}>
          <span className={styles.rmark}>
            <Icon name="check" size={40} />
          </span>
          <h1 className={styles.rtitle}>{r.title}</h1>
          <p className={styles.rtext}>{r.text}</p>
          <Button full onClick={() => router.replace("/talant")}>
            Davom etish
          </Button>
        </div>
      </main>
    );
  }

  const q = questions[index];
  if (!q) return null;

  return (
    <main className="screen">
      <div className={styles.top}>
        <Progress value={index / questions.length} />
        <span className={styles.count}>
          {index + 1}/{questions.length}
        </span>
      </div>

      <h1 className={styles.q}>{q.question}</h1>

      <div className={styles.opts}>
        {q.options.map((o, idx) => (
          <button
            key={o}
            type="button"
            className={`${styles.opt} ${answers[index] === idx ? styles.optOn : ""}`}
            onClick={() => pick(idx)}
          >
            {o}
          </button>
        ))}
      </div>

      <Sheet
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Testni to'xtatasizmi?"
      >
        <p className={styles.sheetText}>Javoblaringiz saqlanmaydi.</p>
        <div className={styles.sheetBtns}>
          <Button variant="ghost" full onClick={() => setExitOpen(false)}>
            Davom etish
          </Button>
          <Button
            variant="secondary"
            full
            onClick={() => router.replace("/talant")}
          >
            Chiqish
          </Button>
        </div>
      </Sheet>
    </main>
  );
}
