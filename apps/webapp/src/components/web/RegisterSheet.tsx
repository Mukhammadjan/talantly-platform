"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/lib/icons";
import styles from "./RegisterSheet.module.css";

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "Talantly_bot";

/**
 * Guest "ro'yxat" oynasi: bot QR + havola.
 * Ro'yxat faqat bot orqali (raqam → parol), keyin saytga kirish.
 */
export function RegisterSheet({
  open,
  onClose,
  title = "Ro'yxatdan o'ting",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
}): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Yopish"
        >
          <Icon name="close" size={18} />
        </button>

        <p className={styles.kicker}>Ro&apos;yxatdan o&apos;tish</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>
          <strong>@Talantly_bot</strong> ga kiring, telefon raqamingizni ulang.
          So&apos;ng saytga kirish uchun{" "}
          <strong>«🔑 Login-parol olish»</strong> tugmasini bosib parol
          o&apos;rnating. Keyin shu telefon va parol bilan kirasiz.
        </p>

        <div className={styles.qrWrap}>
          <img
            src="/brand/telegram-qr.svg"
            alt="Telegram bot QR"
            className={styles.qr}
          />
        </div>

        <a
          className={styles.primary}
          href={`https://t.me/${BOT_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Botni ochish
        </a>

        <p className={styles.foot}>
          Akkountingiz bormi?{" "}
          <Link href="/kirish" className={styles.link} onClick={onClose}>
            Kirish
          </Link>
        </p>
      </div>
    </div>,
    document.body,
  );
}
