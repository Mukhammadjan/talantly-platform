"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./tolov.module.css";

interface PayInfo {
  card: string;
  owner: string;
  price: number;
  status: string;
  payment: { status: string; createdAt: string } | null;
}

const POLL_MS = 20_000;
const MAX_FILE_BYTES = 6 * 1024 * 1024;

/** Tasdiqlangach keyingi bosqichga o'tgan statuslar. */
const ADVANCED = new Set([
  "tolov_tasdiqlangan",
  "cv_tayyor",
  "test_otgan",
  "suhbat_belgilangan",
  "tekshirilgan",
]);

export default function TolovPage(): JSX.Element {
  const router = useRouter();
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  const load = useCallback((): void => {
    void api.getPaymentInfo().then((d) => {
      if (d) setInfo(d);
    });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const waiting =
    info?.status === "tolov_kutilmoqda" && info.payment?.status === "kutilmoqda";
  const advanced = info ? ADVANCED.has(info.status) : false;

  // Moderator tasdig'ini kutish — har 20 soniyada holat yangilanadi.
  useEffect(() => {
    if (!waiting) return;
    const t = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(t);
  }, [waiting, load]);

  const copyCard = async (): Promise<void> => {
    if (!info) return;
    haptic("light");
    const digits = info.card.replace(/\s+/g, "");
    let ok = false;
    try {
      await navigator.clipboard.writeText(digits);
      ok = true;
    } catch {
      // Eski WebView'lar uchun fallback — vaqtinchalik textarea + execCommand.
      const ta = document.createElement("textarea");
      ta.value = digits;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      setErr("Nusxalab bo'lmadi — raqamni qo'lda kiriting.");
    }
  };

  const onFile = (f: File | undefined): void => {
    setErr(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Faqat rasm (screenshot) qabul qilinadi.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setErr("Rasm juda katta (6 MB gacha).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  const send = async (): Promise<void> => {
    if (!preview || sending) return;
    haptic("light");
    setSending(true);
    setErr(null);
    const r = await api.sendPaymentReceipt(preview);
    setSending(false);
    if (r.ok) {
      setPreview(null);
      load();
    } else if (r.error === "already_pending") {
      load();
    } else {
      setErr("Yuborilmadi. Internetni tekshirib, qayta urinib ko'ring.");
    }
  };

  if (!info) {
    return (
      <main className="screen">
        <Skeleton height={28} width="60%" />
        <Skeleton height={200} radius={18} className={styles.sk} />
        <Skeleton height={160} radius={18} className={styles.sk} />
      </main>
    );
  }

  // Tasdiqlangan — keyingi bosqich hub'da.
  if (advanced) {
    return (
      <main className="screen">
        <div className={styles.center}>
          <span className={styles.okMark}>
            <Icon name="check" size={40} />
          </span>
          <h1 className={styles.h}>To&apos;lov tasdiqlandi!</h1>
          <p className={styles.sub}>
            AI CV tayyorlanmoqda — keyingi qadam asosiy sahifada.
          </p>
          <Button full onClick={() => router.replace("/talant")}>
            Davom etish
          </Button>
        </div>
      </main>
    );
  }

  // Chek yuborilgan — moderator tekshirmoqda.
  if (waiting) {
    return (
      <main className="screen">
        <div className={styles.center}>
          <span className={styles.waitSpinner} aria-hidden="true" />
          <h1 className={styles.h}>Chek tekshirilmoqda</h1>
          <p className={styles.sub}>
            Moderator to&apos;lovingizni tasdiqlashi bilan avtomatik keyingi
            bosqichga o&apos;tasiz. Odatda bu bir necha daqiqa oladi.
          </p>
          <p className={styles.hint}>
            Sahifani yopib tursangiz ham bo&apos;ladi — bot orqali xabar
            beramiz.
          </p>
        </div>
      </main>
    );
  }

  const rejected = info.payment?.status === "rad";

  return (
    <main className="screen">
      <h1 className={styles.title}>AI CV uchun to&apos;lov</h1>
      <p className={styles.lead}>
        Quyidagi kartaga{" "}
        <strong className="num">{info.price.toLocaleString("ru-RU")} so&apos;m</strong>{" "}
        o&apos;tkazing (Payme, Click yoki bank ilovasi orqali), so&apos;ng chek
        screenshot&apos;ini shu yerga yuklang.
      </p>

      {rejected ? (
        <Card className={styles.rejCard}>
          <Icon name="info" size={20} />
          <p className={styles.rejText}>
            Avvalgi chek tasdiqlanmadi. To&apos;lovni tekshirib, chekni qayta
            yuboring.
          </p>
        </Card>
      ) : null}

      <Card className={styles.cardBox}>
        <p className={styles.kicker}>Karta raqami</p>
        <p className={`${styles.cardNum} num`}>{info.card}</p>
        <p className={styles.owner}>{info.owner}</p>
        <Button variant="secondary" full onClick={copyCard}>
          {copied ? "Nusxalandi ✓" : "Raqamni nusxalash"}
        </Button>
      </Card>

      <Card className={styles.upBox}>
        <p className={styles.kicker}>To&apos;lov cheki</p>
        {preview ? (
          <>
            {/* Lokal dataURL preview — next/image shart emas */}
            <img src={preview} alt="Chek" className={styles.preview} />
            <div className={styles.upRow}>
              <Button
                variant="ghost"
                onClick={() => {
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Almashtirish
              </Button>
              <Button onClick={send} disabled={sending}>
                {sending ? "Yuborilmoqda..." : "Chekni yuborish"}
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className={styles.drop}
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="camera" size={24} />
            <span>Screenshot tanlash</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.file}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {err ? <p className={styles.err}>{err}</p> : null}
      </Card>
    </main>
  );
}
