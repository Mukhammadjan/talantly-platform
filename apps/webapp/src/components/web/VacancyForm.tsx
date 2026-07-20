"use client";

import { useState } from "react";
import type { VacancyDraft } from "@/lib/vacancyMe";
import styles from "./VacancyForm.module.css";

const DIRECTIONS: { key: string; label: string }[] = [
  { key: "dasturlash", label: "Dasturlash" },
  { key: "dizayn", label: "Dizayn" },
  { key: "marketing", label: "Marketing" },
  { key: "sotuv", label: "Sotuv" },
  { key: "data", label: "Data" },
  { key: "boshqa", label: "Boshqa" },
];

const LEVELS: { key: string; label: string }[] = [
  { key: "intern", label: "Intern" },
  { key: "mutaxassis", label: "Mutaxassis" },
  { key: "ikkalasi", label: "Ikkalasi" },
];

const FORMATS: { key: string; label: string }[] = [
  { key: "ofis", label: "Ofis" },
  { key: "masofaviy", label: "Masofaviy" },
  { key: "aralash", label: "Aralash" },
];

export const EMPTY_DRAFT: VacancyDraft = {
  title: "",
  direction: "",
  level: "ikkalasi",
  salaryFrom: null,
  salaryTo: null,
  city: "Toshkent",
  district: "",
  workFormats: [],
  description: "",
};

/** Faqat raqamlarni qoldiradi — foydalanuvchi probel/vergul yozsa ham ishlaydi. */
function toNumber(v: string): number | null {
  const digits = v.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function fmt(n: number | null): string {
  return n == null ? "" : n.toLocaleString("ru-RU");
}

export function VacancyForm({
  initial,
  submitLabel,
  onSubmit,
  error,
}: {
  initial: VacancyDraft;
  submitLabel: string;
  onSubmit: (draft: VacancyDraft) => Promise<void>;
  error?: string | null;
}): JSX.Element {
  const [draft, setDraft] = useState<VacancyDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const set = <K extends keyof VacancyDraft>(
    key: K,
    value: VacancyDraft[K],
  ): void => {
    setDraft((d) => ({ ...d, [key]: value }));
    setLocalErr(null);
  };

  const toggleFormat = (key: string): void => {
    set(
      "workFormats",
      draft.workFormats.includes(key)
        ? draft.workFormats.filter((f) => f !== key)
        : [...draft.workFormats, key],
    );
  };

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (busy) return;
    if (draft.title.trim().length < 2) {
      setLocalErr("Lavozim nomini yozing (kamida 2 belgi).");
      return;
    }
    if (!draft.direction) {
      setLocalErr("Yo'nalishni tanlang.");
      return;
    }
    if (
      draft.salaryFrom != null &&
      draft.salaryTo != null &&
      draft.salaryFrom > draft.salaryTo
    ) {
      setLocalErr("Maoshning quyi chegarasi yuqorisidan katta bo'lmasin.");
      return;
    }
    setBusy(true);
    await onSubmit({ ...draft, title: draft.title.trim() });
    setBusy(false);
  };

  const shown = localErr ?? error ?? null;

  return (
    <form className={styles.form} onSubmit={(e) => void submit(e)}>
      <label className={styles.field}>
        <span className={styles.label}>Lavozim nomi *</span>
        <input
          className={styles.input}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Masalan: Frontend dasturchi"
          maxLength={140}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Yo&apos;nalish *</span>
        <div className={styles.chips}>
          {DIRECTIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`${styles.chip} ${draft.direction === d.key ? styles.chipOn : ""}`}
              onClick={() => set("direction", d.key)}
              aria-pressed={draft.direction === d.key}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Daraja</span>
        <div className={styles.chips}>
          {LEVELS.map((l) => (
            <button
              key={l.key}
              type="button"
              className={`${styles.chip} ${draft.level === l.key ? styles.chipOn : ""}`}
              onClick={() => set("level", l.key)}
              aria-pressed={draft.level === l.key}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Maosh, dan (so&apos;m)</span>
          <input
            className={styles.input}
            value={fmt(draft.salaryFrom)}
            onChange={(e) => set("salaryFrom", toNumber(e.target.value))}
            placeholder="3 000 000"
            inputMode="numeric"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Maosh, gacha (so&apos;m)</span>
          <input
            className={styles.input}
            value={fmt(draft.salaryTo)}
            onChange={(e) => set("salaryTo", toNumber(e.target.value))}
            placeholder="6 000 000"
            inputMode="numeric"
          />
        </label>
      </div>
      <p className={styles.hint}>
        Bo&apos;sh qoldirsangiz &laquo;Kelishilgan&raquo; deb ko&apos;rsatiladi.
      </p>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Shahar</span>
          <input
            className={styles.input}
            value={draft.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Toshkent"
            maxLength={80}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Tuman</span>
          <input
            className={styles.input}
            value={draft.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="Yunusobod"
            maxLength={80}
          />
        </label>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Ish formati</span>
        <div className={styles.chips}>
          {FORMATS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} ${draft.workFormats.includes(f.key) ? styles.chipOn : ""}`}
              onClick={() => toggleFormat(f.key)}
              aria-pressed={draft.workFormats.includes(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Tavsif</span>
        <textarea
          className={styles.textarea}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={
            "Vazifalar, talablar, sharoit...\nHar bandni yangi qatordan yozing."
          }
          maxLength={1500}
          rows={7}
        />
        <span className={styles.counter}>
          {draft.description.length} / 1500
        </span>
      </label>

      {shown ? <p className={styles.error}>{shown}</p> : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? "Saqlanmoqda..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
