"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { authenticate, isInsideTelegram } from "@/lib/api";
import { initTelegramUi } from "@/lib/telegram";

type EntryState = "loading" | "outside" | "error";

export default function EntryPage(): JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<EntryState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      setState("outside");
      return;
    }
    let cancelled = false;
    setState("loading");
    authenticate(attempt > 0)
      .then(({ snapshot }) => {
        if (cancelled) return;
        router.replace(snapshot.status === "yangi" ? "/register" : "/profile");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16">
      <Seal size={72} className="seal-pop" />
      <h1 className="mt-5 text-2xl font-bold tracking-tight">
        talantly<span className="text-orange">.</span>
      </h1>
      <p className="label-caps mt-2">Tekshirilgan talantlar</p>

      {state === "loading" && (
        <div className="mt-10 w-full space-y-3">
          <Skeleton className="h-4 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      )}

      {state === "outside" && (
        <p className="mt-10 text-center text-[14px] leading-relaxed text-ink-soft">
          Bu ilova faqat Telegram ichida ishlaydi. Iltimos, uni{" "}
          <span className="font-semibold text-ink">@Talantly_bot</span> orqali
          oching.
        </p>
      )}

      {state === "error" && (
        <div className="mt-10 w-full">
          <p className="text-center text-[14px] leading-relaxed text-ink-soft">
            Ulanishda xatolik yuz berdi. Qayta urinib ko&apos;ring.
          </p>
          <PillButton
            className="mt-5"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Qayta urinish
          </PillButton>
        </div>
      )}
    </main>
  );
}
