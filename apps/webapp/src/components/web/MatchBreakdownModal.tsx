"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/lib/icons";
import type { MatchFactor, MatchImprovement } from "@/lib/match";
import styles from "./MatchBreakdownModal.module.css";

export function MatchBreakdownModal({
  open,
  onClose,
  jobTitle,
  company,
  percent,
  factors,
  improvements,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
  company: string;
  percent: number;
  factors: MatchFactor[];
  improvements: MatchImprovement[];
  onApply?: () => void;
}): JSX.Element | null {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [filled, setFilled] = useState(false);

  // Esc yopish + body scroll lock + fokus boshqaruvi (och: yopish tugmasi, yop: ochuvchi element).
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    // Barlar ochilgandan keyin to'ladi (animatsiya).
    const t = window.setTimeout(() => setFilled(true), 40);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      setFilled(false);
      // Fokusni modalni ochgan elementga qaytaramiz.
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`${jobTitle} — moslik tafsiloti`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>Nega mos keladi?</p>
            <h2 className={styles.title}>
              {jobTitle} · <span className={styles.company}>{company}</span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Yopish"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className={styles.scoreRow}>
          <span className={styles.scoreBig}>
            <span className="num">{percent}%</span>
          </span>
          <span className={styles.scoreLabel}>umumiy moslik</span>
        </div>

        <div className={styles.bars}>
          {factors.map((f) => {
            const pct = Math.round((f.contribution / f.weightMax) * 100);
            return (
              <div key={f.key} className={styles.bar}>
                <div className={styles.barTop}>
                  <span className={styles.barLabel}>{f.label}</span>
                  <span className={styles.barVal}>
                    {f.value} ·{" "}
                    <span className="num">
                      {f.contribution}/{f.weightMax}
                    </span>
                  </span>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: filled ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {improvements.length ? (
          <div className={styles.improve}>
            <p className={styles.improveHead}>Taklif etilgan yaxshilanishlar</p>
            <div className={styles.improveGrid}>
              {improvements.map((imp) => (
                <div key={imp.title} className={styles.improveCard}>
                  <p className={styles.improveTitle}>{imp.title}</p>
                  <p className={styles.improveText}>{imp.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button type="button" className={styles.cta} onClick={onApply ?? onClose}>
          Ariza topshirish
        </button>
      </div>
    </div>,
    document.body,
  );
}
