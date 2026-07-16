"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { Icon } from "@/lib/icons";
import { DIRECTION_LABELS, LEVEL_LABELS, WORK_FORMAT_LABELS } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Direction, Level, WorkFormat } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./yangi.module.css";

const TOTAL = 2;

interface VForm {
  title: string;
  direction: Direction | null;
  level: Level | null;
  format: WorkFormat | null;
  salaryFrom: string;
  salaryTo: string;
  requirements: string;
}

const EMPTY: VForm = {
  title: "",
  direction: null,
  level: null,
  format: null,
  salaryFrom: "",
  salaryTo: "",
  requirements: "",
};

export default function VakansiyaYangiPage(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [f, setF] = useState<VForm>(EMPTY);
  const set = (p: Partial<VForm>): void => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => {
    if (step > 1 && !done) setStep((s) => s - 1);
    else router.push("/izlovchi/koproq");
  });

  const canNext =
    step === 1
      ? f.title.trim().length > 1 && f.direction !== null && f.level !== null
      : f.format !== null && f.salaryFrom.trim().length > 0;

  const next = (): void => {
    haptic("light");
    if (step < TOTAL) setStep((s) => s + 1);
    else {
      haptic("success");
      setDone(true);
    }
  };

  if (done) {
    return (
      <main className={styles.wrap}>
        <div className={styles.success}>
          <span className={styles.okIcon}>
            <Icon name="check" size={34} />
          </span>
          <h1 className={styles.okTitle}>Vakansiya yaratildi</h1>
          <p className={styles.okText}>
            <b>{f.title}</b> e&apos;lon qilindi. Jamoamiz mos tekshirilgan
            nomzodlarni tanlab, sizga yuboradi.
          </p>
        </div>
        <div className={styles.cta}>
          <Button full onClick={() => router.push("/vakansiyalar")}>
            Vakansiyalarim
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.top}>
        <Progress value={step / TOTAL} />
        <span className={styles.stepNo}>
          {step}/{TOTAL}
        </span>
      </div>

      <div className={styles.body}>
        {step === 1 && (
          <>
            <h1 className={styles.h}>Lavozim</h1>
            <Input
              label="Lavozim nomi"
              placeholder="Masalan: Frontend dasturchi"
              value={f.title}
              onChange={(e) => set({ title: e.target.value })}
            />
            <Field label="Yo'nalish">
              {(Object.keys(DIRECTION_LABELS) as Direction[]).map((d) => (
                <Chip
                  key={d}
                  label={DIRECTION_LABELS[d]}
                  active={f.direction === d}
                  onClick={() => set({ direction: d })}
                />
              ))}
            </Field>
            <Field label="Daraja">
              {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
                <Chip
                  key={l}
                  label={LEVEL_LABELS[l]}
                  active={f.level === l}
                  onClick={() => set({ level: l })}
                />
              ))}
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.h}>Shartlar</h1>
            <Field label="Ish formati">
              {(Object.keys(WORK_FORMAT_LABELS) as WorkFormat[]).map((w) => (
                <Chip
                  key={w}
                  label={WORK_FORMAT_LABELS[w]}
                  active={f.format === w}
                  onClick={() => set({ format: w })}
                />
              ))}
            </Field>
            <div className={styles.pair}>
              <Input
                label="Maosh (dan)"
                inputMode="numeric"
                placeholder="3000000"
                value={f.salaryFrom}
                onChange={(e) => set({ salaryFrom: e.target.value })}
              />
              <Input
                label="Maosh (gacha)"
                inputMode="numeric"
                placeholder="6000000"
                value={f.salaryTo}
                onChange={(e) => set({ salaryTo: e.target.value })}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.flabel}>Talablar</span>
              <textarea
                className={styles.textarea}
                rows={4}
                maxLength={400}
                placeholder="Nomzoddan kutilayotgan ko'nikma va shartlar."
                value={f.requirements}
                onChange={(e) => set({ requirements: e.target.value })}
              />
            </label>
          </>
        )}
      </div>

      <div className={styles.cta}>
        <Button full disabled={!canNext} onClick={next}>
          {step < TOTAL ? "Davom etish" : "E'lon qilish"}
        </Button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <span className={styles.flabel}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  );
}
