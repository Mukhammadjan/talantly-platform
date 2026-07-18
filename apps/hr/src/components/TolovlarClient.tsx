"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

type Tab = "all" | "cv" | "unlock";

function fmtDate(iso: string): { d: string; t: string } {
  const d = new Date(iso);
  return {
    d: d.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    t: d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function TolovlarClient(): JSX.Element {
  const [items, setItems] = useState<PayItem[] | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ item: PayItem; action: "approve" | "reject" } | null>(null);
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

  const visible = useMemo(() => {
    if (!items) return [];
    const query = q.trim().toLowerCase();
    return items.filter(
      (it) =>
        (tab === "all" || it.kind === tab) &&
        (!query || it.who.toLowerCase().includes(query)),
    );
  }, [items, tab, q]);

  const doAction = async (): Promise<void> => {
    if (!modal || busy) return;
    if (modal.action === "approve" && !bankOk) return;
    setBusy(true);
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: modal.item.kind,
        id: modal.item.id,
        action: modal.action,
      }),
    });
    setBusy(false);
    setModal(null);
    setBankOk(false);
    if (res.ok) {
      setMsg(modal.action === "approve" ? "✅ To'lov tasdiqlandi" : "❌ To'lov rad etildi");
    } else {
      const d = (await res.json()) as { error?: string };
      setMsg(
        d.error === "already_done"
          ? "Bu to'lov allaqachon ko'rib chiqilgan."
          : "Xatolik — qayta urinib ko'ring.",
      );
    }
    load();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "cv", label: "AI CV to'lovlari" },
    { key: "unlock", label: "Kontakt to'lovlari" },
  ];

  return (
    <section className="bg-white rounded-2xl border border-line p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <div>
          <h2 className="text-[19px] font-bold text-ink-1">
            Kutilayotgan to&apos;lovlar
          </h2>
          <p className="text-[13px] text-ink-2 mt-0.5">
            {items ? `${items.length} ta to'lov` : "Yuklanmoqda..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-11 rounded-lg border border-line-strong bg-white px-3.5 w-[240px] focus-within:border-action">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-ink-2 shrink-0"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Izlash"
              className="flex-1 min-w-0 outline-none text-[14px] text-ink-1 placeholder:text-ink-2 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-line mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`h-11 px-4 text-[14px] font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-action text-action-ink"
                : "border-transparent text-ink-2 hover:text-ink-1"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg ? (
        <p className="mb-3 text-[13px] font-semibold text-ink-1">{msg}</p>
      ) : null}

      {items === null ? (
        <p className="py-10 text-center text-[14px] text-ink-2">Yuklanmoqda...</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-ink-2">
          Kutilayotgan to&apos;lovlar yo&apos;q. 🎉
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                <th className="px-4 py-3 font-semibold rounded-l-lg">№</th>
                <th className="px-4 py-3 font-semibold">Kim</th>
                <th className="px-4 py-3 font-semibold">Turi</th>
                <th className="px-4 py-3 font-semibold">Summa</th>
                <th className="px-4 py-3 font-semibold">Sana</th>
                <th className="px-4 py-3 font-semibold">Chek</th>
                <th className="px-4 py-3 font-semibold rounded-r-lg text-right">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((it, i) => {
                const dt = fmtDate(it.createdAt);
                return (
                  <tr
                    key={`${it.kind}:${it.id}`}
                    className={i % 2 === 1 ? "bg-bg/60" : ""}
                  >
                    <td className="px-4 py-3.5 text-[14px] text-ink-2 tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-[15px]">
                          {it.who.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[14px] font-semibold text-ink-1">
                          {it.who}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${
                          it.kind === "cv"
                            ? "bg-action-soft text-action-ink"
                            : "bg-fill text-ink-2"
                        }`}
                      >
                        {KIND_LABEL[it.kind]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[15px] font-bold text-ink-1 tabular-nums whitespace-nowrap">
                      {it.amount.toLocaleString("ru-RU")}{" "}
                      <span className="text-[12px] font-semibold text-ink-2">
                        UZS
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="block text-[14px] font-semibold text-ink-1 tabular-nums">
                        {dt.d}
                      </span>
                      <span className="block text-[12px] text-ink-2 tabular-nums">
                        {dt.t}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {it.screenshotUrl ? (
                        <a
                          href={it.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-[13px] font-semibold text-verified-ink hover:underline"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          >
                            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
                          </svg>
                          Chek.png
                        </a>
                      ) : (
                        <span className="text-[13px] text-ink-3">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setBankOk(false);
                            setModal({ item: it, action: "approve" });
                          }}
                          className="h-10 px-4 rounded-full bg-action text-white text-[13px] font-bold hover:bg-action/90 transition-colors whitespace-nowrap"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ item: it, action: "reject" })}
                          className="h-10 px-4 rounded-full bg-danger-soft text-danger-ink text-[13px] font-bold hover:bg-danger-soft/70 transition-colors"
                        >
                          Rad
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tasdiqlash / rad modali */}
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
              {modal.action === "approve"
                ? "To'lovni tasdiqlash"
                : "To'lovni rad etish"}
            </h3>
            <p className="text-[14px] text-ink-2 mb-4">
              {modal.item.who} ·{" "}
              <strong className="text-ink-1">
                {modal.item.amount.toLocaleString("ru-RU")} UZS
              </strong>{" "}
              · {KIND_LABEL[modal.item.kind]}
            </p>

            {modal.item.screenshotUrl ? (
              <img
                src={modal.item.screenshotUrl}
                alt="To'lov cheki"
                className="w-full max-h-[300px] object-contain rounded-xl border border-line bg-bg mb-4"
              />
            ) : null}

            {modal.action === "approve" ? (
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-4">
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
            ) : (
              <p className="text-[13px] text-ink-2 mb-4">
                Rad etilsa, yuboruvchiga xabar boradi va chekni qayta yuborishi
                mumkin bo&apos;ladi.
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-11 px-5 rounded-full bg-fill text-ink-1 text-[14px] font-bold hover:bg-line transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={busy || (modal.action === "approve" && !bankOk)}
                onClick={() => void doAction()}
                className={`h-11 px-5 rounded-full text-[14px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  modal.action === "approve"
                    ? "bg-action text-white hover:bg-action/90"
                    : "bg-danger text-white hover:bg-danger/90"
                }`}
              >
                {busy
                  ? "Bajarilmoqda..."
                  : modal.action === "approve"
                    ? "✅ Tasdiqlash"
                    : "Rad etish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
