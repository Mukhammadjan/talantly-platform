"use client";

import { useEffect, useState } from "react";
import styles from "./OfflineGate.module.css";

/** Ulanish yo'qolganda butun ekranni yopadigan holat (G26). */
export function OfflineGate(): JSX.Element | null {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const on = (): void => setOffline(false);
    const off = (): void => setOffline(true);
    setOffline(!window.navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={styles.wrap} role="alert">
      <span className={styles.icon} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 8.5a14 14 0 0 1 20 0M5.5 12a9 9 0 0 1 13 0M9 15.5a4.5 4.5 0 0 1 6 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
          <path d="M4 4l16 16" stroke="var(--t-danger)" />
        </svg>
      </span>
      <p className={styles.title}>Ulanish yo&apos;q</p>
      <p className={styles.text}>
        Internet aloqasini tekshirib, qayta urinib ko&apos;ring.
      </p>
      <button
        type="button"
        className={styles.retry}
        onClick={() => window.location.reload()}
      >
        Qayta urinish
      </button>
    </div>
  );
}
