"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  freezeUser,
  hardDeleteUser,
  restoreUser,
  type ActionState,
} from "./actions";

const INIT: ActionState = { ok: false, error: null };

function Submit({ label, danger }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={danger ? "btn-danger" : "btn-primary"}
    >
      {pending ? "…" : label}
    </button>
  );
}

function Overlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-card border border-line bg-surface p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function RowActions({
  id,
  name,
  status,
  self,
}: {
  id: string;
  name: string;
  status: "active" | "frozen";
  self: boolean;
}) {
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const [freezeState, freezeAction] = useFormState(freezeUser, INIT);
  const [restoreState, restoreAction] = useFormState(restoreUser, INIT);
  const [delState, delAction] = useFormState(hardDeleteUser, INIT);

  useEffect(() => {
    if (freezeState.ok) setFreezeOpen(false);
  }, [freezeState.ok]);
  useEffect(() => {
    if (delState.ok) setDelOpen(false);
  }, [delState.ok]);

  const nameMatches =
    typed.trim().toLowerCase() === name.trim().toLowerCase() && name.length > 0;

  if (status === "active") {
    return (
      <>
        <button
          type="button"
          className="btn-ghost"
          disabled={self}
          title={self ? "O'zingizni muzlata olmaysiz" : "Muzlatish"}
          onClick={() => setFreezeOpen(true)}
        >
          Muzlatish
        </button>
        {freezeOpen ? (
          <Overlay onClose={() => setFreezeOpen(false)}>
            <h3 className="text-[17px] font-bold text-ink">Hisobni muzlatish</h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              <b>{name}</b> login qila olmaydi va feedda ko&apos;rinmaydi.
              Keyin tiklash mumkin.
            </p>
            <form action={freezeAction} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={id} />
              <label className="grid gap-1.5">
                <span className="label-caps">Sabab (ixtiyoriy)</span>
                <textarea
                  name="reason"
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Masalan: qoidabuzarlik"
                />
              </label>
              {freezeState.error ? (
                <p className="text-[13px] font-semibold text-red-ink">
                  {freezeState.error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setFreezeOpen(false)}
                >
                  Bekor
                </button>
                <Submit label="Muzlatish" />
              </div>
            </form>
          </Overlay>
        ) : null}
      </>
    );
  }

  // frozen
  return (
    <div className="flex items-center justify-end gap-2">
      <form action={restoreAction}>
        <input type="hidden" name="id" value={id} />
        <Submit label="Tiklash" />
      </form>
      <button
        type="button"
        className="text-[13px] font-semibold text-red-ink hover:underline"
        disabled={self}
        onClick={() => {
          setTyped("");
          setDelOpen(true);
        }}
      >
        O&apos;chirish
      </button>
      {restoreState.error ? (
        <span className="text-[12px] text-red-ink">{restoreState.error}</span>
      ) : null}

      {delOpen ? (
        <Overlay onClose={() => setDelOpen(false)}>
          <h3 className="text-[17px] font-bold text-red-ink">
            Butunlay o&apos;chirish
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            Bu <b>qaytmas</b>. Moliyaviy yozuvlar anonim saqlanadi, foydalanuvchi
            o&apos;chadi. Tasdiqlash uchun ismini yozing:
          </p>
          <form action={delAction} className="mt-4 grid gap-3">
            <input type="hidden" name="id" value={id} />
            <input
              name="confirmName"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="input-base"
              placeholder={name}
              autoComplete="off"
            />
            {delState.error ? (
              <p className="text-[13px] font-semibold text-red-ink">
                {delState.error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDelOpen(false)}
              >
                Bekor
              </button>
              <button
                type="submit"
                disabled={!nameMatches}
                className="btn-danger disabled:pointer-events-none disabled:opacity-40"
              >
                O&apos;chirish
              </button>
            </div>
          </form>
        </Overlay>
      ) : null}
    </div>
  );
}
