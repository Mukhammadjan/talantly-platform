"use client";

import { useCallback, useEffect, useState } from "react";

interface PayItem {
  id: string;
  kind: "cv" | "unlock";
  amount: number;
  createdAt: string;
  who: string;
  detail: string;
  screenshotUrl: string | null;
}

const KIND_LABEL: Record<PayItem["kind"], string> = {
  cv: "AI CV (talant)",
  unlock: "Kontakt (kompaniya)",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TolovlarClient(): JSX.Element {
  const [items, setItems] = useState<PayItem[] | null>(null);
  const [sel, setSel] = useState<PayItem | null>(null);
  const [bankOk, setBankOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback((): void => {
    void fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d: { items?: PayItem[] }) => setItems(d.items ?? []));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (action: "approve" | "reject"): Promise<void> => {
    if (!sel || busy) return;
    if (action === "approve" && !bankOk) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: sel.kind, id: sel.id, action }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg(action === "approve" ? "✅ Tasdiqlandi" : "❌ Rad etildi");
      setSel(null);
      setBankOk(false);
      load();
    } else {
      const d = (await res.json()) as { error?: string };
      setMsg(
        d.error === "already_done"
          ? "Bu to'lov allaqachon ko'rib chiqilgan."
          : "Xatolik — qayta urinib ko'ring.",
      );
      load();
    }
  };

  if (items === null) {
    return <p className="text-[14px] text-ink-2">Yuklanmoqda...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
      <div className="bg-white rounded-xl border border-line overflow-hidden">
        {msg ? (
          <p className="px-5 py-3 text-[13px] font-medium text-ink-2 border-b border-line">
            {msg}
          </p>
        ) : null}
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14px] text-ink-2">
            Kutilayotgan to&apos;lovlar yo&apos;q. 🎉
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[12px] uppercase tracking-wide text-ink-2">
                <th className="px-5 py-3 font-semibold">Kim</th>
                <th className="px-3 py-3 font-semibold">Turi</th>
                <th className="px-3 py-3 font-semibold">Summa</th>
                <th className="px-3 py-3 font-semibold">Sana</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={`${it.kind}:${it.id}`}
                  onClick={() => {
                    setSel(it);
                    setBankOk(false);
                    setMsg(null);
                  }}
                  className={`border-b border-line last:border-0 cursor-pointer transition-colors ${
                    sel?.id === it.id ? "bg-action-soft" : "hover:bg-bg"
                  }`}
                >
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-ink-1">
                    {it.who}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                        it.kind === "cv"
                          ? "bg-action-soft text-action-ink"
                          : "bg-fill text-ink-2"
                      }`}
                    >
                      {KIND_LABEL[it.kind]}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-[14px] font-bold text-ink-1 tabular-nums">
                    {it.amount.toLocaleString("ru-RU")} so&apos;m
                  </td>
                  <td className="px-3 py-3.5 text-[13px] text-ink-2 tabular-nums">
                    {fmtDate(it.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <aside className="bg-white rounded-xl border border-line p-5 sticky top-20">
        {!sel ? (
          <p className="text-[14px] text-ink-2">
            Tekshirish uchun ro&apos;yxatdan to&apos;lovni tanlang.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-wide font-semibold text-ink-2">
                {KIND_LABEL[sel.kind]}
              </p>
              <p className="mt-1 text-[17px] font-bold text-ink-1">{sel.who}</p>
              <p className="text-[14px] text-ink-2">
                {sel.amount.toLocaleString("ru-RU")} so&apos;m ·{" "}
                {fmtDate(sel.createdAt)}
                {sel.detail ? ` · ${sel.detail}` : ""}
              </p>
            </div>

            {sel.screenshotUrl ? (
              <img
                src={sel.screenshotUrl}
                alt="To'lov cheki"
                className="w-full max-h-[360px] object-contain rounded-lg border border-line bg-bg"
              />
            ) : (
              <p className="text-[13px] text-ink-2">
                Chek rasmi yo&apos;q (kompaniya to&apos;lovi — bank kirimini
                tekshiring).
              </p>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bankOk}
                onChange={(e) => setBankOk(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--t-action)]"
              />
              <span className="text-[13px] text-ink-1">
                Bank kirimini shu summa bilan solishtirdim
              </span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!bankOk || busy}
                onClick={() => void act("approve")}
                className="flex-1 h-11 rounded-lg bg-action text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-action/90 transition-colors"
              >
                ✅ Tasdiqlash
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("reject")}
                className="h-11 px-4 rounded-lg bg-fill text-danger text-[14px] font-bold hover:bg-danger-soft transition-colors"
              >
                Rad etish
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
