"use client";

import { useRef, useState, useTransition } from "react";
import {
  saveCompanyInn,
  saveCompanyNotes,
  setCompanyStatus,
  setCompanyVerified,
} from "./actions";

interface Option {
  value: string;
  label: string;
}

/** STIR (INN) + "Tekshirilgan kompaniya" belgisi (§3.3). */
export function CompanyVerify({
  companyId,
  isVerified,
  inn,
}: {
  companyId: string;
  isVerified: boolean;
  inn: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const saveInn = (value: string): void => {
    if ((value.trim() || null) === (inn ?? null)) return;
    const fd = new FormData();
    fd.set("companyId", companyId);
    fd.set("inn", value);
    startTransition(async () => {
      await saveCompanyInn(fd);
    });
  };

  const toggle = (): void => {
    const fd = new FormData();
    fd.set("companyId", companyId);
    fd.set("verified", isVerified ? "false" : "true");
    startTransition(async () => {
      await setCompanyVerified(fd);
    });
  };

  return (
    <div className="grid gap-1.5">
      <input
        defaultValue={inn ?? ""}
        placeholder="STIR"
        inputMode="numeric"
        disabled={pending}
        onBlur={(e) => saveInn(e.target.value)}
        className="input-base num w-[130px] py-1.5 text-[13px]"
      />
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          isVerified
            ? "badge badge-green cursor-pointer"
            : "btn-ghost px-3 py-1 text-[12px]"
        }
        title={isVerified ? "Belgini olib tashlash" : "Tekshirilgan deb belgilash"}
      >
        {isVerified ? "✓ Tekshirilgan" : "Tekshirish"}
      </button>
    </div>
  );
}

export function CompanyStatusSelect({
  companyId,
  status,
  options,
}: {
  companyId: string;
  status: string;
  options: Option[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className={`input-base w-auto cursor-pointer py-1.5 pr-7 text-[13px] transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("companyId", companyId);
        formData.set("status", e.target.value);
        startTransition(async () => {
          await setCompanyStatus(formData);
        });
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function NotesCell({
  companyId,
  notes,
}: {
  companyId: string;
  notes: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!editing) {
    return (
      <button
        type="button"
        className="block w-full rounded-[10px] px-2 py-1 text-left text-[13px] text-ink-soft transition-colors hover:bg-cream"
        onClick={() => setEditing(true)}
        title="Izoh yozish"
      >
        {notes ? (
          <span className="line-clamp-2 whitespace-pre-wrap">{notes}</span>
        ) : (
          <span className="text-ink-faint">+ Izoh</span>
        )}
      </button>
    );
  }

  const save = () => {
    const formData = new FormData();
    formData.set("companyId", companyId);
    formData.set("notes", textareaRef.current?.value ?? "");
    startTransition(async () => {
      await saveCompanyNotes(formData);
      setEditing(false);
    });
  };

  return (
    <div className="grid gap-1.5">
      <textarea
        ref={textareaRef}
        defaultValue={notes ?? ""}
        rows={3}
        autoFocus
        className="input-base resize-none py-1.5 text-[13px]"
        disabled={isPending}
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          className="btn-primary px-3 py-1 text-[12px]"
          onClick={save}
          disabled={isPending}
        >
          {isPending ? "…" : "Saqlash"}
        </button>
        <button
          type="button"
          className="btn-ghost px-3 py-1 text-[12px]"
          onClick={() => setEditing(false)}
          disabled={isPending}
        >
          Bekor
        </button>
      </div>
    </div>
  );
}
