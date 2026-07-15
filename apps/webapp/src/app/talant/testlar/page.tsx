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

  const personalityDone = Boolean(snap?.archetype);
  const skillDone = snap?.score != null;

  return (
    <main className="screen">
      <h1 className={styles.h}>Testlar</h1>

      <Card className={styles.test} onClick={() => router.push("/talant/shaxsiyat")}>
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

      <Card className={styles.test} onClick={() => router.push("/talant/konikma")}>
        <IconTile tone="action">
          <Icon name="doc" size={22} />
        </IconTile>
        <span className={styles.texts}>
          <span className={styles.ttitle}>Ko&apos;nikma testi</span>
          <span className={styles.ttext}>10 savol · yo&apos;nalish bo&apos;yicha ball</span>
        </span>
        {skillDone ? (
          <Badge variant="verified" icon={<Icon name="check" size={14} />}>
            {snap?.score}
          </Badge>
        ) : (
          <Icon name="chevron" size={20} className={styles.chev} />
        )}
      </Card>
    </main>
  );
}
