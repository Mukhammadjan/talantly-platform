"use client";

import { useCallback, useEffect, useState } from "react";
import { DIRECTION_LABELS } from "@/components/admin/ui";

interface InterviewItem {
  id: string;
  scheduledAt: string;
  talentId: string | null;
  name: string;
  direction: string;
  city: string;
  score: number | null;
}

interface SlotItem {
  id: string;
  starts_at: string;
  is_taken: boolean;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SuhbatlarClient(): JSX.Element {
  const [interviews, setInterviews] = useState<InterviewItem[] | null>(null);
  const [slots, setSlots] = useState<SlotItem[] | null>(null);
  const [modal, setModal] = useState<InterviewItem | null>(null);
  const [rating, setRating] = useState(4);
  const [decision, setDecision] = useState<"approve" | "reject" | "noshow">(
    "approve",
  );
  const [reason, setReason] = useState<"suhbat_yiqildi" | "soxta_malumot">(
    "suhbat_yiqildi",
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newDt, setNewDt] = useState("");

  const load = useCallback((): void => {
    void fetch("/api/admin/interviews")
      .then((r) => r.json())
      .then((d: { items?: InterviewItem[] }) => setInterviews(d.items ?? []));
    void fetch("/api/admin/slots")
      .then((r) => r.json())
      .then((d: { items?: SlotItem[] }) => setSlots(d.items ?? []));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const decide = async (): Promise<void> => {
    if (!modal || busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: modal.id,
        action: decision,
        rating,
        reason: decision === "reject" ? reason : undefined,
        notes: notes || undefined,
      }),
    });
    setBusy(false);
    setModal(null);
    setNotes("");
    setMsg(
      res.ok
        ? decision === "approve"
          ? "✅ Talant tasdiqlandi — Tekshirilgan!"
          : decision === "noshow"
            ? "🚫 Kelmadi deb belgilandi, slot bo'shatildi."
            : "❌ Rad etildi."
        : "Xatolik — qayta urinib ko'ring.",
    );
    load();
  };

  const addSlot = async (): Promise<void> => {
    if (!newDt) return;
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datetimes: [newDt] }),
    });
    if (res.ok) {
      setNewDt("");
      load();
    }
  };

  const delSlot = async (id: string): Promise<void> => {
    await fetch("/api/admin/slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
      {/* Baholash navbati */}
      <section className="bg-white rounded-2xl border border-line p-6">
        <h2 className="text-[19px] font-bold text-ink-1">Baholash navbati</h2>
        <p className="text-[13px] text-ink-2 mt-0.5 mb-4">
          {interviews ? `${interviews.length} ta suhbat` : "Yuklanmoqda..."}
        </p>
        {msg ? (
          <p className="mb-3 text-[13px] font-semibold text-ink-1">{msg}</p>
        ) : null}
        {interviews === null ? (
          <p className="py-8 text-center text-[14px] text-ink-2">
            Yuklanmoqda...
          </p>
        ) : interviews.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-ink-2">
            Baholanmagan suhbat yo&apos;q. 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                  <th className="px-4 py-3 font-semibold rounded-l-lg">
                    Talant
                  </th>
                  <th className="px-4 py-3 font-semibold">Yo&apos;nalish</th>
                  <th className="px-4 py-3 font-semibold">Ball</th>
                  <th className="px-4 py-3 font-semibold">Vaqt</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg text-right">
                    Amal
                  </th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((iv, i) => (
                  <tr key={iv.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold">
                          {iv.name.charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <span className="block text-[14px] font-semibold text-ink-1">
                            {iv.name}
                          </span>
                          <span className="block text-[12px] text-ink-2">
                            {iv.city}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-ink-1">
                      {DIRECTION_LABELS[iv.direction] ?? iv.direction}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] font-bold text-ink-1 tabular-nums">
                      {iv.score ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
                      {fmt(iv.scheduledAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setModal(iv);
                          setDecision("approve");
                          setRating(4);
                        }}
                        className="h-10 px-4 rounded-full bg-action text-white text-[13px] font-bold hover:bg-action/90 transition-colors"
                      >
                        Baholash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Slotlar boshqaruvi */}
      <section className="bg-white rounded-2xl border border-line p-6">
        <h2 className="text-[19px] font-bold text-ink-1">Suhbat slotlari</h2>
        <p className="text-[13px] text-ink-2 mt-0.5 mb-4">
          {slots ? `${slots.length} ta kelgusi slot` : "Yuklanmoqda..."}
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="datetime-local"
            value={newDt}
            onChange={(e) => setNewDt(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-line-strong bg-white px-3 text-[14px] text-ink-1"
          />
          <button
            type="button"
            onClick={() => void addSlot()}
            disabled={!newDt}
            className="h-11 px-4 rounded-lg bg-ink-1 text-white text-[14px] font-bold hover:bg-ink-nav transition-colors disabled:opacity-40"
          >
            + Qo&apos;shish
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto">
          {(slots ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between h-11 px-3.5 rounded-lg bg-bg"
            >
              <span className="text-[14px] font-semibold text-ink-1 tabular-nums">
                {fmt(s.starts_at)}
              </span>
              {s.is_taken ? (
                <span className="text-[12px] font-bold text-action-ink bg-action-soft rounded-full px-2.5 py-0.5">
                  Band
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void delSlot(s.id)}
                  className="text-[12px] font-bold text-danger-ink hover:underline"
                >
                  O&apos;chirish
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Baholash modali */}
      {modal ? (
        <div
          className="fixed inset-0 z-40 bg-ink-1/40 grid place-items-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-2xl p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[17px] font-bold text-ink-1 mb-1">
              Suhbatni baholash
            </h3>
            <p className="text-[14px] text-ink-2 mb-4">
              {modal.name} · {DIRECTION_LABELS[modal.direction] ?? modal.direction}{" "}
              · {fmt(modal.scheduledAt)}
            </p>

            <div className="flex gap-1.5 mb-4">
              {(
                [
                  ["approve", "✅ Tasdiqlash"],
                  ["reject", "❌ Rad etish"],
                  ["noshow", "🚫 Kelmadi"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDecision(k)}
                  className={`h-10 px-3.5 rounded-full text-[13px] font-bold transition-colors ${
                    decision === k
                      ? "bg-ink-1 text-white"
                      : "bg-fill text-ink-2 hover:text-ink-1"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {decision !== "noshow" ? (
              <div className="mb-4">
                <p className="text-[13px] font-semibold text-ink-1 mb-1.5">
                  Baho: {rating}/5
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`w-11 h-11 rounded-lg text-[15px] font-bold transition-colors ${
                        r <= rating
                          ? "bg-action text-white"
                          : "bg-fill text-ink-2"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-ink-2 mb-4">
                Slot bo&apos;shatiladi, talant yangi vaqt tanlashi mumkin
                bo&apos;ladi.
              </p>
            )}

            {decision === "reject" ? (
              <div className="mb-4">
                <p className="text-[13px] font-semibold text-ink-1 mb-1.5">
                  Sabab
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReason("suhbat_yiqildi")}
                    className={`h-10 px-3.5 rounded-full text-[13px] font-bold ${
                      reason === "suhbat_yiqildi"
                        ? "bg-danger text-white"
                        : "bg-fill text-ink-2"
                    }`}
                  >
                    Suhbatdan yiqildi
                  </button>
                  <button
                    type="button"
                    onClick={() => setReason("soxta_malumot")}
                    className={`h-10 px-3.5 rounded-full text-[13px] font-bold ${
                      reason === "soxta_malumot"
                        ? "bg-danger text-white"
                        : "bg-fill text-ink-2"
                    }`}
                  >
                    Soxta ma&apos;lumot (blok)
                  </button>
                </div>
              </div>
            ) : null}

            {decision !== "noshow" ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Izoh (ixtiyoriy)"
                rows={2}
                className="w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[14px] text-ink-1 placeholder:text-ink-2 mb-4 resize-none focus:outline-none focus:border-action"
              />
            ) : null}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-11 px-5 rounded-full bg-fill text-ink-1 text-[14px] font-bold hover:bg-line"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void decide()}
                className="h-11 px-5 rounded-full bg-action text-white text-[14px] font-bold hover:bg-action/90 disabled:opacity-40"
              >
                {busy ? "Bajarilmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
