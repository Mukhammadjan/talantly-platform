"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import { api, type ApiSlot } from "@/lib/api";
import { SLOTS, type Slot } from "@/mock/quiz";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./suhbat.module.css";

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];
const WEEKDAYS: Record<string, string> = {
  Mon: "Dush", Tue: "Sesh", Wed: "Chor", Thu: "Pay",
  Fri: "Jum", Sat: "Shan", Sun: "Yak",
};

/** Real slotlarni kun bo'yicha guruhlash (Asia/Tashkent). */
function groupSlots(slots: ApiSlot[]): Slot[] {
  const days = new Map<string, Slot>();
  for (const s of slots) {
    const d = new Date(s.startsAt);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tashkent",
      weekday: "short",
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const get = (t: string): string =>
      parts.find((p) => p.type === t)?.value ?? "";
    const key = `${get("day")}-${get("month")}`;
    if (!days.has(key)) {
      days.set(key, {
        id: key,
        date: `${get("day")}-${MONTHS[Number(get("month")) - 1] ?? ""}`,
        label: WEEKDAYS[get("weekday")] ?? get("weekday"),
        times: [],
      });
    }
    days.get(key)?.times.push({
      id: s.id,
      time: `${get("hour")}:${get("minute")}`,
      taken: false,
    });
  }
  return [...days.values()];
}

export default function SuhbatPage(): JSX.Element {
  const router = useRouter();
  const [days, setDays] = useState<Slot[] | null>(null);
  const [realMode, setRealMode] = useState(false);
  const [dateId, setDateId] = useState("");
  const [timeId, setTimeId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookErr, setBookErr] = useState(false);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getInterviewSlots().then((slots) => {
      if (!live) return;
      if (slots === null) {
        setDays(SLOTS); // mock rejim
        setDateId(SLOTS[0]?.id ?? "");
      } else {
        setRealMode(true);
        const grouped = groupSlots(slots);
        setDays(grouped);
        setDateId(grouped[0]?.id ?? "");
      }
    });
    return () => {
      live = false;
    };
  }, []);
  useBackButton(() => router.back());

  const day = days?.find((s) => s.id === dateId) ?? days?.[0];
  const time = day?.times.find((t) => t.id === timeId) ?? null;

  const book = (): void => {
    if (!timeId) return;
    if (!realMode) {
      router.replace("/talant");
      return;
    }
    setBooking(true);
    setBookErr(false);
    void api.bookSlot(timeId).then((r) => {
      if (r) {
        haptic("success");
        router.replace("/talant");
      } else {
        haptic("error");
        setBooking(false);
        setBookErr(true);
      }
    });
  };

  return (
    <main className="screen">
      <h1 className={styles.h}>Suhbat vaqti</h1>
      <p className={styles.sub}>Sizga qulay kun va vaqtni tanlang.</p>

      {days === null ? null : days.length === 0 ? (
        <p className={styles.sub}>
          Hozircha bo&apos;sh vaqt yo&apos;q — tez orada yangi slotlar ochiladi.
        </p>
      ) : (
        <>
          <div className={styles.dates}>
            {days.map((s) => (
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
        </>
      )}

      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Suhbatni tasdiqlaysizmi?"
      >
        <p className={styles.ctext}>
          {day?.date} · {time?.time} — moderator bilan qisqa onlayn suhbat.
          Boshlanishidan 1 soat oldin eslatma yuboramiz.
        </p>
        {bookErr ? (
          <p className={styles.ctext}>
            ⚠️ Bu vaqt endigina band bo&apos;ldi yoki xatolik yuz berdi —
            boshqa vaqtni tanlab ko&apos;ring.
          </p>
        ) : null}
        <Button full loading={booking} onClick={book}>
          Ha, tasdiqlayman
        </Button>
      </Sheet>
    </main>
  );
}
