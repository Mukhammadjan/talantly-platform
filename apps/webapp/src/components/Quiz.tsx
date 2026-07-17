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
  result: (answers: number[]) => QuizResult | Promise<QuizResult>;
  /** Savol boshiga vaqt limiti (soniya). 0 = timer yo'q. */
  secondsPerQuestion?: number;
}

export function Quiz({
  questions,
  result,
  secondsPerQuestion = 0,
}: QuizProps): JSX.Element | null {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [res, setRes] = useState<QuizResult | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);

  useEffect(() => {
    initTelegram();
  }, []);

  // Savol taymeri (B7): vaqt tugasa javobsiz (-1) keyingi savolga o'tadi.
  useEffect(() => {
    if (!secondsPerQuestion || done) return;
    setTimeLeft(secondsPerQuestion);
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setAnswers((prev) => {
            const next = [...prev];
            if (next[index] === undefined) next[index] = -1;
            return next;
          });
          if (index + 1 < questions.length) setIndex((i) => i + 1);
          else setDone(true);
          return secondsPerQuestion;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [index, secondsPerQuestion, done, questions.length]);

  // Natija sync yoki async bo'lishi mumkin (server baholashi).
  useEffect(() => {
    if (!done || res) return;
    let live = true;
    void Promise.resolve(result(answers)).then((r) => {
      if (live) setRes(r);
    });
    return () => {
      live = false;
    };
  }, [done, res, answers, result]);

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
    if (!res) {
      return (
        <main className="screen">
          <div className={styles.result}>
            <span className={styles.grading} aria-hidden="true" />
            <p className={styles.rtext}>Natija hisoblanmoqda...</p>
          </div>
        </main>
      );
    }
    return (
      <main className="screen">
        <div className={styles.result}>
          <span className={styles.rmark}>
            <Icon name="check" size={40} />
          </span>
          <h1 className={styles.rtitle}>{res.title}</h1>
          <p className={styles.rtext}>{res.text}</p>
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
        {secondsPerQuestion ? (
          <span
            className={`${styles.timer} ${timeLeft <= 10 ? styles.timerLow : ""}`}
          >
            {timeLeft}s
          </span>
        ) : null}
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
