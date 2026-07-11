"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { Skeleton } from "@/components/Skeleton";
import { Wordmark } from "@/components/Wordmark";
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
        if (!snapshot.preferredMode) {
          router.replace("/rol");
        } else if (snapshot.preferredMode === "izlovchi") {
          router.replace("/izlovchi");
        } else {
          router.replace(
            snapshot.status === "yangi" ? "/register" : "/profile",
          );
        }
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
      <Wordmark height={44} className="seal-pop" />
      <p className="label-caps mt-4">Tekshirilgan talantlar</p>

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
