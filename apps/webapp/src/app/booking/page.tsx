"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { ApiError, apiFetch } from "@/lib/api";
import type { SlotPublic, TalentSnapshot } from "@/lib/apiTypes";
import {
  dayKeyTashkent,
  dayTitleUz,
  formatDateTimeUz,
  formatTimeUz,
} from "@/lib/format";
import { haptic } from "@/lib/telegram";

type BookingPhase =
  | { kind: "loading" }
  | { kind: "pick"; slots: SlotPublic[]; selected: string | null; busy: boolean }
  | { kind: "booked"; scheduledAt: string }
  | { kind: "error"; message: string };

function groupSlots(slots: SlotPublic[]): { title: string; slots: SlotPublic[] }[] {
  const groups = new Map<string, SlotPublic[]>();
  for (const slot of slots) {
    const key = dayKeyTashkent(slot.startsAt);
    const list = groups.get(key);
    if (list) list.push(slot);
    else groups.set(key, [slot]);
  }
  return [...groups.entries()].map(([, daySlots]) => {
    const first = daySlots[0];
    return {
      title: first ? dayTitleUz(first.startsAt) : "",
      slots: daySlots,
    };
  });
}

export default function BookingPage(): JSX.Element {
  const router = useRouter();
  const [phase, setPhase] = useState<BookingPhase>({ kind: "loading" });
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase({ kind: "loading" });
    try {
      const { snapshot } = await apiFetch<{ snapshot: TalentSnapshot }>("/api/me");
      if (snapshot.status === "suhbat_belgilangan" && snapshot.interviewAt) {
        setPhase({ kind: "booked", scheduledAt: snapshot.interviewAt });
        return;
      }
      if (snapshot.status !== "test_otgan") {
        router.replace("/profile");
        return;
      }
      const { slots } = await apiFetch<{ slots: SlotPublic[] }>("/api/slots");
      setPhase({ kind: "pick", slots, selected: null, busy: false });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Vaqtlarni yuklashda xatolik yuz berdi.";
      setPhase({ kind: "error", message });
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function confirm(): Promise<void> {
    if (phase.kind !== "pick" || !phase.selected || phase.busy) return;
    haptic();
    setPhase({ ...phase, busy: true });
    try {
      const res = await apiFetch<{ scheduledAt: string }>("/api/booking", {
        method: "POST",
        body: JSON.stringify({ slotId: phase.selected }),
      });
      setPhase({ kind: "booked", scheduledAt: res.scheduledAt });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        showToast(err.message);
        await load();
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : "Band qilishda xatolik yuz berdi.";
      setPhase({ kind: "error", message });
    }
  }

  if (phase.kind === "loading") {
    return (
      <main className="px-5 pb-10 pt-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-6 w-3/4" />
        <Card className="mt-6 space-y-4">
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-20 !rounded-full" />
            <Skeleton className="h-11 w-20 !rounded-full" />
            <Skeleton className="h-11 w-20 !rounded-full" />
          </div>
        </Card>
      </main>
    );
  }

  if (phase.kind === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          {phase.message}
        </p>
        <PillButton className="mt-6" onClick={() => void load()}>
          Qayta urinish
        </PillButton>
      </main>
    );
  }

  if (phase.kind === "booked") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 text-center">
        <div className="seal-pop">
          <Seal size={72} />
        </div>
        <h1 className="mt-6 text-xl font-bold">Suhbat belgilandi!</h1>
        <Card className="mt-6 w-full">
          <p className="label-caps">Suhbat vaqti</p>
          <p className="mt-2 text-[17px] font-bold">
            {formatDateTimeUz(phase.scheduledAt)}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Suhbatdan bir kun oldin va bir soat oldin botda eslatma yuboramiz.
            Ijobiy kayfiyat bilan keling!
          </p>
        </Card>
        <PillButton
          variant="ghost"
          className="mt-6"
          onClick={() => router.replace("/profile")}
        >
          Profilga qaytish
        </PillButton>
      </main>
    );
  }

  const groups = groupSlots(phase.slots);
  const selectedSlot = phase.slots.find((s) => s.id === phase.selected) ?? null;

  return (
    <main className="px-5 pb-32 pt-8">
      <span className="label-caps">Jonli suhbat</span>
      <h1 className="mt-2 text-xl font-bold leading-snug">
        Suhbat uchun qulay vaqtni tanlang
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Suhbat 15 daqiqa davom etadi. Moderatorimiz siz bilan Telegram orqali
        bog&apos;lanadi.
      </p>

      {groups.length === 0 ? (
        <Card className="mt-6 text-center">
          <div className="text-4xl">🗓️</div>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Hozircha bo&apos;sh vaqtlar yo&apos;q. Yangi vaqtlar qo&apos;shilishi
            bilan xabar beramiz.
          </p>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="label-caps">{group.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.slots.map((slot) => {
                  const isSelected = phase.selected === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        haptic();
                        setPhase({ ...phase, selected: slot.id });
                      }}
                      className={`rounded-full border px-5 py-2.5 text-[14px] font-semibold transition-all active:scale-[0.96] ${
                        isSelected
                          ? "border-orange bg-orange text-white shadow-soft"
                          : "border-line bg-surface text-ink"
                      }`}
                    >
                      {formatTimeUz(slot.startsAt)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-app border-t border-line bg-cream px-5 pb-6 pt-4">
          <p className="mb-3 text-center text-[13px] text-ink-soft">
            Tanlangan vaqt:{" "}
            <span className="font-semibold text-ink">
              {formatDateTimeUz(selectedSlot.startsAt)}
            </span>
          </p>
          <PillButton
            variant="green"
            loading={phase.busy}
            onClick={() => void confirm()}
          >
            Vaqtni tasdiqlash
          </PillButton>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-5 top-4 z-50 mx-auto max-w-app">
          <div className="step-enter rounded-card border border-line bg-ink px-4 py-3 text-center text-[13px] font-medium text-white shadow-soft">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}
