"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icons";
import { Button } from "./ui";
import { useRecruiter } from "@/lib/recruiter/store";
import { candidateById } from "@/lib/recruiter/data";

interface PaymentApi {
  open: (candidateId?: string) => void;
}

const Ctx = createContext<PaymentApi | null>(null);

type Plan = "single" | "subscription";
type Stage = "form" | "done";

function formatCard(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function PaymentProvider({ children }: { children: ReactNode }): JSX.Element {
  const { unlock, subscribe } = useRecruiter();
  const [target, setTarget] = useState<string | undefined>();
  const [visible, setVisible] = useState(false);
  const [plan, setPlan] = useState<Plan>("single");
  const [stage, setStage] = useState<Stage>("form");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const open = useCallback((candidateId?: string) => {
    setTarget(candidateId);
    setPlan(candidateId ? "single" : "subscription");
    setStage("form");
    setCard("");
    setExp("");
    setCvc("");
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  const cand = target ? candidateById(target) : undefined;
  const valid = card.replace(/\s/g, "").length >= 16 && exp.length >= 4 && cvc.length >= 3;

  const pay = (): void => {
    if (plan === "subscription") subscribe();
    else if (target) unlock(target);
    setStage("done");
  };

  const api = useMemo<PaymentApi>(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {visible ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Yopish"
            onClick={close}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative mx-auto w-full max-w-app rounded-t-[22px] bg-surface px-5 pb-8 pt-3 step-enter">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />

            {stage === "form" ? (
              <>
                <h2 className="text-[20px] font-semibold text-text">
                  Nomzodni ochish
                </h2>
                <p className="mt-1 text-[14px] text-muted">
                  {cand
                    ? `${cand.name} bilan bog'lanish uchun to'lovni tanlang.`
                    : "Barcha nomzodlarni ochish uchun obunani tanlang."}
                </p>

                <div className="mt-4 space-y-2.5">
                  <PlanRow
                    active={plan === "single"}
                    onClick={() => setPlan("single")}
                    title="Bitta nomzod"
                    price="99 000 so'm"
                    note="Bir martalik ochish"
                  />
                  <PlanRow
                    active={plan === "subscription"}
                    onClick={() => setPlan("subscription")}
                    title="Oylik obuna"
                    price="499 000 so'm"
                    note="Cheksiz ochish · istalgan vaqt bekor qilinadi"
                  />
                </div>

                <div className="mt-5 space-y-2.5">
                  <label className="block text-[12.5px] font-medium text-muted">
                    Karta raqami
                  </label>
                  <div className="flex items-center gap-2 rounded-input border border-line bg-surface px-3.5 py-3">
                    <Icon name="card" size={20} className="text-dim" />
                    <input
                      inputMode="numeric"
                      value={card}
                      onChange={(e) => setCard(formatCard(e.target.value))}
                      placeholder="8600 1234 5678 9012"
                      className="num w-full bg-transparent text-[15px] text-text outline-none placeholder:text-dim"
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <input
                      inputMode="numeric"
                      value={exp}
                      onChange={(e) =>
                        setExp(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4)
                            .replace(/(.{2})(.+)/, "$1/$2"),
                        )
                      }
                      placeholder="MM/YY"
                      className="num w-1/2 rounded-input border border-line bg-surface px-3.5 py-3 text-[15px] text-text outline-none placeholder:text-dim"
                    />
                    <input
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) =>
                        setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                      }
                      placeholder="CVC"
                      className="num w-1/2 rounded-input border border-line bg-surface px-3.5 py-3 text-[15px] text-text outline-none placeholder:text-dim"
                    />
                  </div>
                </div>

                <Button full disabled={!valid} onClick={pay} className="mt-5">
                  {plan === "single" ? "99 000 so'm to'lash" : "Obunani faollashtirish"}
                </Button>
                <p className="mt-2.5 text-center text-[12px] text-dim">
                  To'lov xavfsiz · ma'lumotlaringiz saqlanmaydi
                </p>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="seal-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-soft text-green">
                  <Icon name="check" size={40} />
                </div>
                <h2 className="mt-4 text-[20px] font-semibold text-text">
                  To'lov muvaffaqiyatli
                </h2>
                <p className="mt-1 text-[14px] text-muted">
                  {plan === "subscription"
                    ? "Obuna faollashtirildi. Barcha nomzodlar ochildi."
                    : `${cand?.name ?? "Nomzod"} ochildi. Endi bog'lanishingiz mumkin.`}
                </p>
                <Button full onClick={close} className="mt-5">
                  Davom etish
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

function PlanRow({
  active,
  onClick,
  title,
  price,
  note,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  note: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-card border p-3.5 text-left transition-colors ${
        active ? "border-orange bg-orange-soft" : "border-line bg-surface"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          active ? "border-orange" : "border-line"
        }`}
      >
        {active ? <span className="h-2.5 w-2.5 rounded-full bg-orange" /> : null}
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold text-text">{title}</span>
        <span className="block text-[12.5px] text-muted">{note}</span>
      </span>
      <span className="num text-[15px] font-semibold text-text">{price}</span>
    </button>
  );
}

export function usePayment(): PaymentApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePayment must be used within PaymentProvider");
  return ctx;
}
