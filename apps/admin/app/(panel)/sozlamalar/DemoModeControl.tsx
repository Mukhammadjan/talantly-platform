"use client";

import { useState, useTransition } from "react";
import { type DemoModeState, setDemoMode } from "./demoActions";

/**
 * Super-admin uchun ko'zga tashlanadigan demo boshqaruvi. Bir bosishda
 * demolarni o'chiradi — saytda faqat real ma'lumot qoladi.
 */
export function DemoModeControl({ initial }: { initial: DemoModeState }) {
  const [state, setState] = useState<DemoModeState>(initial);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const total = state.demoTalents + state.demoCompanies + state.demoVacancies;

  const flip = (next: boolean): void => {
    setErr(null);
    startTransition(async () => {
      try {
        const fresh = await setDemoMode(next);
        setState(fresh);
      } catch {
        setErr("O'zgartirib bo'lmadi. Qayta urinib ko'ring.");
      }
    });
  };

  const on = state.show;

  return (
    <section
      className={`card p-6 ${on ? "ring-1 ring-orange/30" : "ring-1 ring-green/40"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-ink">Demo rejim</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                on ? "bg-orange-tint text-orange" : "bg-green-tint text-green-ink"
              }`}
            >
              {on ? "Demo YONIQ" : "Faqat real"}
            </span>
          </div>
          <p className="mt-1.5 max-w-[440px] text-[13px] text-ink-soft">
            {on
              ? "Hozir saytda demo va real ma'lumotlar birga ko'rinmoqda. O'chirsangiz — barcha demo talant, kompaniya va vakansiyalar darhol yashiriladi, faqat real qoladi."
              : "Sayt faqat real ma'lumotni ko'rsatmoqda. Demolar yashirilgan — istalgan payt qayta yoqishingiz mumkin."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Demo rejim"
          disabled={pending}
          onClick={() => flip(!on)}
          className={`relative h-7 w-[3.25rem] shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            on ? "bg-orange" : "bg-green"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <DemoStat label="Demo talant" value={state.demoTalents} hidden={!on} />
        <DemoStat label="Demo kompaniya" value={state.demoCompanies} hidden={!on} />
        <DemoStat label="Demo vakansiya" value={state.demoVacancies} hidden={!on} />
      </div>

      <p className="mt-4 text-[12px] text-ink-faint">
        {on
          ? `${total} ta demo yozuv hozir saytda ko'rinmoqda.`
          : `${total} ta demo yozuv yashirilgan.`}
        {pending ? " · Saqlanmoqda…" : ""}
      </p>
      {err ? (
        <p className="mt-2 text-[12px] font-semibold text-red-ink">{err}</p>
      ) : null}
    </section>
  );
}

function DemoStat({
  label,
  value,
  hidden,
}: {
  label: string;
  value: number;
  hidden: boolean;
}) {
  return (
    <div className="rounded-input border border-line bg-surface p-3">
      <p className="num text-[22px] font-bold text-ink">{value}</p>
      <p className="text-[12px] text-ink-soft">{label}</p>
      <p
        className={`mt-0.5 text-[11px] font-semibold ${hidden ? "text-green-ink" : "text-ink-faint"}`}
      >
        {hidden ? "yashirilgan" : "ko'rinmoqda"}
      </p>
    </div>
  );
}
