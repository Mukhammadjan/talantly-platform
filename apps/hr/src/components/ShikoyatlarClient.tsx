"use client";

import { useCallback, useEffect, useState } from "react";

interface ComplaintItem {
  id: string;
  who: string;
  subject: string;
  note: string;
  status: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  yangi: "Yangi",
  korildi: "Ko'rildi",
  yopildi: "Yopildi",
};

export function ShikoyatlarClient(): JSX.Element {
  const [items, setItems] = useState<ComplaintItem[] | null>(null);

  const load = useCallback((): void => {
    void fetch("/api/admin/complaints")
      .then((r) => r.json())
      .then((d: { items?: ComplaintItem[] }) => setItems(d.items ?? []));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string): Promise<void> => {
    await fetch("/api/admin/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  return (
    <section className="bg-white rounded-2xl border border-line p-6">
      <h2 className="text-[19px] font-bold text-ink-1">Shikoyatlar</h2>
      <p className="text-[13px] text-ink-2 mt-0.5 mb-4">
        {items ? `${items.length} ta shikoyat` : "Yuklanmoqda..."}
      </p>
      {items === null ? (
        <p className="py-8 text-center text-[14px] text-ink-2">Yuklanmoqda...</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-ink-2">
          Shikoyatlar yo&apos;q. 🎉
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-line p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${
                      c.status === "yangi"
                        ? "bg-danger-soft text-danger-ink"
                        : c.status === "korildi"
                          ? "bg-action-soft text-action-ink"
                          : "bg-verified-soft text-verified-ink"
                    }`}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  <span className="text-[14px] font-bold text-ink-1">
                    {c.subject || "Shikoyat"}
                  </span>
                </div>
                <span className="text-[12px] text-ink-2 tabular-nums">
                  {new Date(c.createdAt).toLocaleString("uz-UZ", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-[14px] leading-6 text-ink-1">{c.note || "—"}</p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[13px] text-ink-2">{c.who}</span>
                <span className="flex gap-2">
                  {c.status === "yangi" ? (
                    <button
                      type="button"
                      onClick={() => void setStatus(c.id, "korildi")}
                      className="h-9 px-3.5 rounded-full bg-fill text-ink-1 text-[13px] font-bold hover:bg-line"
                    >
                      Ko&apos;rildi
                    </button>
                  ) : null}
                  {c.status !== "yopildi" ? (
                    <button
                      type="button"
                      onClick={() => void setStatus(c.id, "yopildi")}
                      className="h-9 px-3.5 rounded-full bg-verified-soft text-verified-ink text-[13px] font-bold hover:bg-verified-soft/70"
                    >
                      Yopish
                    </button>
                  ) : null}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
