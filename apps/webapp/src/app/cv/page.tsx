"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/lib/icons";
import { CV_MOCK } from "@/mock/quiz";
import { initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./cv.module.css";

export default function CvPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  const cv = CV_MOCK;

  return (
    <main className="screen">
      <h1 className={styles.h}>Sizning CV</h1>

      <Card className={styles.card}>
        <p className={styles.kicker}>Qisqacha</p>
        <p className={styles.summary}>{cv.summary}</p>
      </Card>

      <Card className={styles.card}>
        <p className={styles.kicker}>Ko&apos;nikmalar</p>
        <div className={styles.skills}>
          {cv.skills.map((s) => (
            <span key={s} className={styles.skill}>
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className={styles.card}>
        <p className={styles.kicker}>Tajriba</p>
        {cv.experience.map((e) => (
          <div key={e.title} className={styles.exp}>
            <span className={styles.etitle}>{e.title}</span>
            <span className={styles.emeta}>
              {e.org} · {e.period}
            </span>
          </div>
        ))}
      </Card>

      <Card className={styles.verdict}>
        <span className={styles.vicon}>
          <Icon name="sparkle" size={20} />
        </span>
        <p className={styles.vtext}>{cv.verdict}</p>
      </Card>

      <div className={styles.actions}>
        <Button full icon={<Icon name="download" size={20} />}>
          Yuklab olish
        </Button>
        <Button variant="secondary" full icon={<Icon name="edit" size={20} />}>
          Tahrirlash
        </Button>
      </div>
    </main>
  );
}
