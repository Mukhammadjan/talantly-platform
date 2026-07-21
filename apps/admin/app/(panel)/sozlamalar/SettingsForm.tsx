"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveSettings, type SaveState } from "./actions";

export interface SettingsValues {
  cv_price: string;
  contact_unlock_price: string;
  subscription_price: string;
  success_fee_intern: string;
  success_fee_mutaxassis: string;
  success_fee_tech: string;
  payment_card_number: string;
  payment_card_owner: string;
  show_demo_data: boolean;
  cv_payment_required: boolean;
}

function Money({
  name,
  label,
  hint,
  def,
}: {
  name: string;
  label: string;
  hint?: string;
  def: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="label-caps">{label}</span>
      <div className="relative">
        <input
          name={name}
          defaultValue={def}
          inputMode="numeric"
          className="input-base num pr-14"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-ink-faint">
          so&apos;m
        </span>
      </div>
      {hint ? <span className="text-[12px] text-ink-faint">{hint}</span> : null}
    </label>
  );
}

function SubmitBar() {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-4 mt-2 flex items-center justify-end gap-3">
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </button>
    </div>
  );
}

function Toggle({
  name,
  label,
  hint,
  def,
}: {
  name: string;
  label: string;
  hint: string;
  def: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-input border border-line bg-surface p-4">
      <span>
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        <span className="block text-[12px] text-ink-faint">{hint}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={def}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-surface-2 transition-colors peer-checked:bg-green after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, action] = useFormState<SaveState, FormData>(saveSettings, {
    ok: false,
    error: null,
  });

  return (
    <form action={action} className="grid gap-6">
      {state.error ? (
        <p className="rounded-input bg-red-tint px-4 py-3 text-[13px] font-semibold text-red-ink">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-input bg-green-tint px-4 py-3 text-[13px] font-semibold text-green-ink">
          Saqlandi ✓
        </p>
      ) : null}

      <section className="card p-6">
        <h2 className="section-title mb-4">Narxlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Money name="cv_price" label="AI CV narxi" def={values.cv_price} />
          <Money
            name="contact_unlock_price"
            label="Kontakt ochish"
            def={values.contact_unlock_price}
          />
          <Money
            name="subscription_price"
            label="Obuna narxi"
            def={values.subscription_price}
          />
          <Money
            name="success_fee_intern"
            label="Success fee — intern"
            def={values.success_fee_intern}
          />
          <Money
            name="success_fee_mutaxassis"
            label="Success fee — mutaxassis"
            def={values.success_fee_mutaxassis}
          />
          <Money
            name="success_fee_tech"
            label="Success fee — tech/dizayn"
            def={values.success_fee_tech}
          />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title mb-4">To&apos;lov kartasi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="label-caps">Karta raqami</span>
            <input
              name="payment_card_number"
              defaultValue={values.payment_card_number}
              className="input-base num"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label-caps">Karta egasi</span>
            <input
              name="payment_card_owner"
              defaultValue={values.payment_card_owner}
              className="input-base"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="section-title">Rejim</h2>
        <Toggle
          name="show_demo_data"
          label="Demo ma'lumotni ko'rsatish"
          hint="Saytda demo talant/kompaniyalar ko'rinadi"
          def={values.show_demo_data}
        />
        <Toggle
          name="cv_payment_required"
          label="CV uchun to'lov majburiy"
          hint="O'chirilsa, CV to'lovsiz yaratiladi"
          def={values.cv_payment_required}
        />
      </section>

      <SubmitBar />
    </form>
  );
}
