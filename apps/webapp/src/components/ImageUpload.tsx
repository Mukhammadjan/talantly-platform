"use client";

import { useRef, useState } from "react";
import { authedFetch } from "@/lib/auth";
import styles from "./ImageUpload.module.css";

const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Profil rasmi / logo yuklash. O'zi /api/upload'ga yuboradi va egasining
 * photo_url/logo_url'ini serverda saqlaydi (formaga bog'liq emas).
 */
export function ImageUpload({
  kind,
  initialUrl = null,
  label,
}: {
  kind: "avatar" | "logo";
  initialUrl?: string | null;
  label?: string;
}): JSX.Element {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("PNG, JPG yoki WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Rasm 6MB dan katta");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("read"));
        r.readAsDataURL(file);
      });
      const res = await authedFetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, kind }),
      });
      if (!res.ok) {
        setError("Yuklab bo'lmadi");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) setUrl(`${data.url}?t=${Date.now()}`);
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`${styles.frame} ${
          kind === "avatar" ? styles.round : styles.square
        }`}
        aria-label={label ?? "Rasm yuklash"}
      >
        {url ? (
          <img src={url} alt="" className={styles.img} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            +
          </span>
        )}
        <span className={styles.badge}>
          {busy ? "Yuklanmoqda…" : url ? "O'zgartirish" : "Yuklash"}
        </span>
      </button>
      {label ? <span className={styles.label}>{label}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFile}
        hidden
      />
    </div>
  );
}
