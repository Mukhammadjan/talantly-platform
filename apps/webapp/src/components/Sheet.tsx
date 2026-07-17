"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import styles from "./Sheet.module.css";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** r24 pastki sheet + --sh-sheet. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: SheetProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // Portal: .screen (overflow scroll) iOS'da stacking context yaratadi va
  // fixed backdrop nav ostida qolib ketadi — body'ga chiqaramiz.
  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.grabber} aria-hidden="true" />
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
