"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import { SLOTS } from "@/mock/quiz";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./suhbat.module.css";

export default function SuhbatPage(): JSX.Element {
  const router = useRouter();
  const [dateId, setDateId] = useState(SLOTS[0]?.id ?? "");
  const [timeId, setTimeId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  const day = SLOTS.find((s) => s.id === dateId) ?? SLOTS[0];
  const time = day?.times.find((t) => t.id === timeId) ?? null;

  return (
    <main className="screen">
      <h1 className={styles.h}>Suhbat vaqti</h1>
      <p className={styles.sub}>Sizga qulay kun va vaqtni tanlang.</p>

      <div className={styles.dates}>
        {SLOTS.map((s) => (
          <Chip
            key={s.id}
            label={`${s.label} · ${s.date}`}
            active={dateId === s.id}
            onClick={() => {
              setDateId(s.id);
              setTimeId(null);
            }}
          />
        ))}
      </div>

      <div className={styles.grid}>
        {day?.times.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.taken}
            className={`${styles.time} ${timeId === t.id ? styles.timeOn : ""} ${
              t.taken ? styles.taken : ""
            }`}
            onClick={() => {
              haptic("light");
              setTimeId(t.id);
            }}
          >
            {t.time}
          </button>
        ))}
      </div>

      <div className={styles.cta}>
        <Button full disabled={!timeId} onClick={() => setConfirm(true)}>
          Tasdiqlash
        </Button>
      </div>

      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Suhbatni tasdiqlaysizmi?"
      >
        <p className={styles.ctext}>
          {day?.date} · {time?.time} — moderator bilan qisqa onlayn suhbat.
          Boshlanishidan 1 soat oldin eslatma yuboramiz.
        </p>
        <Button full onClick={() => router.replace("/talant")}>
          Ha, tasdiqlayman
        </Button>
      </Sheet>
    </main>
  );
}
