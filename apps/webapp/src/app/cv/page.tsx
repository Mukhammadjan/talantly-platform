"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/lib/icons";
import { CV_MOCK } from "@/mock/quiz";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./cv.module.css";

export default function CvPage(): JSX.Element {
  const router = useRouter();
  const [sent, setSent] = useState(false);
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
        {sent ? (
          <p className={styles.sentBar}>
            <Icon name="check" size={18} /> CV Telegram bot orqali yuborildi
          </p>
        ) : (
          <Button
            full
            icon={<Icon name="download" size={20} />}
            onClick={() => {
              haptic("success");
              setSent(true);
            }}
          >
            Yuklab olish
          </Button>
        )}
        <Button
          variant="secondary"
          full
          icon={<Icon name="edit" size={20} />}
          onClick={() => router.push("/profil-forma")}
        >
          Tahrirlash
        </Button>
      </div>
    </main>
  );
}
