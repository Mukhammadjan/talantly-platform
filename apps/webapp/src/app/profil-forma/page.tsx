"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { api } from "@/lib/api";
import {
  DIRECTION_LABELS,
  LEVEL_LABELS,
  WORK_FORMAT_LABELS,
} from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Direction, Level, WorkFormat } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./forma.module.css";

const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan"];
const SKILL_BANK = ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Node", "Figma", "SQL"];
const TOTAL = 4;

interface FormState {
  fullName: string;
  birthYear: string;
  city: string;
  district: string;
  direction: Direction | null;
  level: Level | null;
  experience: string;
  skills: string[];
  workFormats: WorkFormat[];
  salary: string;
  about: string;
  portfolio: string;
}

const EMPTY: FormState = {
  fullName: "",
  birthYear: "",
  city: "",
  district: "",
  direction: null,
  level: null,
  experience: "",
  skills: [],
  workFormats: [],
  salary: "",
  about: "",
  portfolio: "",
};

export default function ProfilFormaPage(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<FormState>(EMPTY);

  useEffect(() => {
    initTelegram();
    let live = true;
    // Tahrirlash uchun mavjud profilni oldindan to'ldiramiz.
    api.getTalent().then((s) => {
      if (!live) return;
      const p = s.profile;
      if (!p.fullName) return;
      setF({
        fullName: p.fullName,
        birthYear: p.birthYear ? String(p.birthYear) : "",
        city: p.city ?? "",
        district: p.district ?? "",
        direction: p.direction,
        level: p.level,
        experience: p.experienceYears ? String(p.experienceYears) : "",
        skills: p.skills,
        workFormats: p.workFormats,
        salary: p.salaryFrom ? String(p.salaryFrom) : "",
        about: p.about ?? "",
        portfolio: p.portfolioUrl ?? "",
      });
    });
    return () => {
      live = false;
    };
  }, []);

  useBackButton(() => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  });

  const set = (patch: Partial<FormState>): void => setF((p) => ({ ...p, ...patch }));

  const toggle = <K extends "skills" | "workFormats">(
    key: K,
    value: FormState[K][number],
  ): void => {
    setF((p) => {
      const arr = p[key] as string[];
      const nextArr = arr.includes(value as string)
        ? arr.filter((x) => x !== value)
        : [...arr, value];
      return { ...p, [key]: nextArr };
    });
  };

  const next = (): void => {
    haptic("light");
    if (step < TOTAL) setStep(step + 1);
    else router.replace("/talant");
  };

  const canNext =
    step === 1
      ? f.fullName.trim().length >= 2 && f.city !== ""
      : step === 2
        ? f.direction !== null && f.level !== null
        : true;

  return (
    <main className={styles.wrap}>
      <div className={styles.top}>
        <Progress value={(step - 1) / TOTAL} />
        <span className={styles.count}>
          {step}/{TOTAL}
        </span>
      </div>

      <div className={styles.body}>
        {step === 1 ? (
          <>
            <h1 className={styles.h}>Shaxsiy ma&apos;lumot</h1>
            <Input
              label="Ism familiya"
              placeholder="Ism familiyangiz"
              value={f.fullName}
              onChange={(e) => set({ fullName: e.target.value })}
            />
            <Input
              label="Tug'ilgan yil"
              inputMode="numeric"
              placeholder="Masalan: 2003"
              value={f.birthYear}
              onChange={(e) => set({ birthYear: e.target.value })}
            />
            <Field label="Shahar">
              {CITIES.map((c) => (
                <Chip key={c} label={c} active={f.city === c} onClick={() => set({ city: c })} />
              ))}
            </Field>
            <Input
              label="Tuman"
              placeholder="Masalan: Chilonzor"
              value={f.district}
              onChange={(e) => set({ district: e.target.value })}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className={styles.h}>Kasbiy yo&apos;nalish</h1>
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
                  onClick={() => set({ level: l, experience: l === "intern" ? "" : f.experience })}
                />
              ))}
            </Field>
            {f.level === "mutaxassis" ? (
              <Input
                label="Tajriba (yil)"
                inputMode="numeric"
                placeholder="Masalan: 3"
                value={f.experience}
                onChange={(e) => set({ experience: e.target.value })}
              />
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className={styles.h}>Ko&apos;nikma va shartlar</h1>
            <Field label="Ko'nikmalar">
              {SKILL_BANK.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={f.skills.includes(s)}
                  onClick={() => toggle("skills", s)}
                />
              ))}
            </Field>
            <Field label="Ish formati">
              {(Object.keys(WORK_FORMAT_LABELS) as WorkFormat[]).map((w) => (
                <Chip
                  key={w}
                  label={WORK_FORMAT_LABELS[w]}
                  active={f.workFormats.includes(w)}
                  onClick={() => toggle("workFormats", w)}
                />
              ))}
            </Field>
            <Input
              label="Kutilayotgan maosh (so'm)"
              inputMode="numeric"
              placeholder="Masalan: 5000000"
              value={f.salary}
              onChange={(e) => set({ salary: e.target.value })}
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className={styles.h}>Yakuniy</h1>
            <label className={styles.field}>
              <span className={styles.flabel}>Siz haqingizda</span>
              <textarea
                className={styles.textarea}
                rows={4}
                maxLength={400}
                placeholder="O'zingiz va maqsadlaringiz haqida qisqacha."
                value={f.about}
                onChange={(e) => set({ about: e.target.value })}
              />
            </label>
            <Input
              label="Portfolio havolasi"
              inputMode="url"
              placeholder="https://..."
              value={f.portfolio}
              onChange={(e) => set({ portfolio: e.target.value })}
            />
          </>
        ) : null}
      </div>

      <div className={styles.cta}>
        <Button full disabled={!canNext} onClick={next}>
          {step < TOTAL ? "Davom etish" : "Yakunlash"}
        </Button>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={styles.chipField}>
      <span className={styles.flabel}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  );
}
