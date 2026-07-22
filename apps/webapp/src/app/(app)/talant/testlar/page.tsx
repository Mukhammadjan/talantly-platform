"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { TalentSnapshot } from "@/lib/types";
import styles from "./testlar.module.css";

export default function TestlarPage(): JSX.Element {
  const router = useRouter();
  const [snap, setSnap] = useState<TalentSnapshot | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getTalent().then((s) => {
      if (live) setSnap(s);
    });
    return () => {
      live = false;
    };
  }, []);

  const PASS_SCORE = 60;
  const personalityDone = Boolean(snap?.archetype);
  const skillScore = snap?.score ?? null;
  const skillPassed = skillScore != null && skillScore >= PASS_SCORE;
  const skillFailed = skillScore != null && skillScore < PASS_SCORE;

  return (
    <main className="screen">
      <h1 className={styles.h}>Testlar</h1>

      <Card className={styles.test} onClick={() => router.push("/shaxsiyat")}>
        <IconTile tone="action">
          <Icon name="sparkle" size={22} />
        </IconTile>
        <span className={styles.texts}>
          <span className={styles.ttitle}>Shaxsiyat testi</span>
          <span className={styles.ttext}>15 savol · arxetipingizni ochadi</span>
        </span>
        {personalityDone ? (
          <Badge variant="verified" icon={<Icon name="check" size={14} />}>
            Bajarildi
          </Badge>
        ) : (
          <Icon name="chevron" size={20} className={styles.chev} />
        )}
      </Card>

      <Card className={styles.test} onClick={() => router.push("/konikma")}>
        <IconTile tone="action">
          <Icon name="doc" size={22} />
        </IconTile>
        <span className={styles.texts}>
          <span className={styles.ttitle}>Ko&apos;nikma testi</span>
          <span className={styles.ttext}>
            {skillFailed
              ? `${skillScore} ball · o'tish uchun ${PASS_SCORE} kerak — qayta urinib ko'ring`
              : skillPassed
                ? `${skillScore} ball · muvaffaqiyatli o'tildi`
                : "10 savol · yo'nalish bo'yicha ball"}
          </span>
        </span>
        {skillPassed ? (
          <Badge variant="verified" icon={<Icon name="check" size={14} />}>
            {skillScore}
          </Badge>
        ) : skillFailed ? (
          <Badge variant="danger">Qayta · {skillScore}</Badge>
        ) : (
          <Icon name="chevron" size={20} className={styles.chev} />
        )}
      </Card>
    </main>
  );
}
