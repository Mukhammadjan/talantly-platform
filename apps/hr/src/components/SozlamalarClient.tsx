"use client";

import { BP } from "@/lib/bp";
import { useCallback, useEffect, useState } from "react";

interface SettingItem {
  key: string;
  value: string;
}

const META: Record<
  string,
  { label: string; hint?: string; kind: "int" | "bool" | "text" }
> = {
  cv_price: { label: "AI CV narxi (so'm)", kind: "int" },
  contact_unlock_price: { label: "Kontakt ochish narxi (so'm)", kind: "int" },
  subscription_price: { label: "Obuna narxi (so'm/oy)", kind: "int" },
  success_fee_intern: { label: "Success fee — intern (so'm)", kind: "int" },
  success_fee_mutaxassis: {
    label: "Success fee — mutaxassis (so'm)",
    kind: "int",
  },
  success_fee_tech: { label: "Success fee — tech/dizayn (so'm)", kind: "int" },
  cv_payment_required: {
    label: "AI CV uchun to'lov talab qilinsin",
    hint: "O'chirilsa talantlar to'lovsiz davom etadi",
    kind: "bool",
  },
  show_demo_data: {
    label: "Demo ma'lumotlar ko'rinsin",
    hint: "Launch'da o'chiriladi — feed/xarita faqat real bo'ladi",
    kind: "bool",
  },
  payment_card_number: { label: "To'lov karta raqami", kind: "text" },
  payment_card_owner: { label: "Karta egasi", kind: "text" },
};

const ORDER = Object.keys(META);

export function SozlamalarClient(): JSX.Element {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback((): void => {
    void fetch(`${BP}/api/admin/settings`)
      .then((r) => r.json())
      .then((d: { items?: SettingItem[] }) => {
        const map: Record<string, string> = {};
        for (const it of d.items ?? []) map[it.key] = it.value;
        setValues(map);
        setSaved(map);
      });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async (key: string): Promise<void> => {
    if (!values || busyKey) return;
    setBusyKey(key);
    setMsg(null);
    const res = await fetch(`${BP}/api/admin/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] ?? "" }),
    });
    setBusyKey(null);
    if (res.ok) {
      setSaved((s) => ({ ...s, [key]: values[key] ?? "" }));
      setMsg(`✅ ${META[key]?.label ?? key} saqlandi`);
    } else {
      setMsg("Xatolik — qiymatni tekshiring.");
    }
  };

  if (!values) {
    return (
      <section className="bg-white rounded-2xl border border-line p-6">
        <p className="py-8 text-center text-[14px] text-ink-2">Yuklanmoqda...</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-line p-6 max-w-[720px]">
      <h2 className="text-[19px] font-bold text-ink-1">Platforma sozlamalari</h2>
      <p className="text-[13px] text-ink-2 mt-0.5 mb-5">
        O&apos;zgarishlar darhol kuchga kiradi — narxlar ilova va botda shu
        yerdan o&apos;qiladi.
      </p>
      {msg ? (
        <p className="mb-4 text-[13px] font-semibold text-ink-1">{msg}</p>
      ) : null}

      <div className="flex flex-col divide-y divide-line">
        {ORDER.map((key) => {
          const meta = META[key];
          if (!meta) return null;
          const val = values[key] ?? "";
          const dirty = val !== (saved[key] ?? "");
          return (
            <div key={key} className="py-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <p className="text-[14px] font-semibold text-ink-1">
                  {meta.label}
                </p>
                {meta.hint ? (
                  <p className="text-[12px] text-ink-2 mt-0.5">{meta.hint}</p>
                ) : null}
              </div>
              {meta.kind === "bool" ? (
                <button
                  type="button"
                  disabled={busyKey === key}
                  onClick={() => {
                    const next = val === "true" ? "false" : "true";
                    setValues({ ...values, [key]: next });
                    void fetch(`${BP}/api/admin/settings`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ key, value: next }),
                    }).then((r) => {
                      if (r.ok) {
                        setSaved((s) => ({ ...s, [key]: next }));
                        setMsg(`✅ ${meta.label} saqlandi`);
                      }
                    });
                  }}
                  className={`w-[52px] h-8 rounded-full relative transition-colors ${
                    val === "true" ? "bg-action" : "bg-line-strong"
                  }`}
                  aria-label={meta.label}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-raise transition-all ${
                      val === "true" ? "left-[24px]" : "left-1"
                    }`}
                  />
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  <input
                    value={val}
                    onChange={(e) =>
                      setValues({ ...values, [key]: e.target.value })
                    }
                    className={`h-11 rounded-lg border bg-white px-3.5 text-[14px] text-ink-1 tabular-nums focus:outline-none focus:border-action ${
                      dirty ? "border-action" : "border-line-strong"
                    } ${meta.kind === "int" ? "w-[140px] text-right" : "w-[240px]"}`}
                  />
                  <button
                    type="button"
                    disabled={!dirty || busyKey === key}
                    onClick={() => void save(key)}
                    className="h-11 px-4 rounded-lg bg-ink-1 text-white text-[13px] font-bold disabled:opacity-30 hover:bg-ink-nav transition-colors"
                  >
                    {busyKey === key ? "..." : "Saqlash"}
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
