"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { Skeleton } from "@/components/Skeleton";
import { Wordmark } from "@/components/Wordmark";
import { authenticate, isInsideTelegram } from "@/lib/api";
import { initTelegramUi } from "@/lib/telegram";

type EntryState = "loading" | "outside" | "error";

const BOT_LINK = "https://t.me/Talantly_bot";

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
    <main className="flex min-h-app flex-col items-center justify-center px-6 pb-16">
      <Wordmark height={44} className="seal-pop" />
      <p className="label-caps mt-4">Tekshirilgan talantlar</p>

      {state === "loading" && (
        <div className="mt-10 w-full space-y-3">
          <Skeleton className="h-4 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      )}

      {state === "outside" && (
        <div className="mt-10 flex w-full flex-col items-center">
          <p className="text-center text-[14px] leading-relaxed text-ink-soft">
            Bu ilova faqat Telegram ichida ishlaydi. QR kodni skanerlang yoki
            botni to&apos;g&apos;ridan-to&apos;g&apos;ri oching.
          </p>
          <div className="mt-6 rounded-card border border-line bg-surface p-4 shadow-soft">
            <img
              src="/brand/telegram-qr.svg"
              alt="Talantly bot QR kodi"
              width={176}
              height={176}
              className="h-44 w-44"
            />
          </div>
          <a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center rounded-pill bg-orange px-6 py-3.5 text-[15px] font-semibold text-white shadow-soft transition-transform active:scale-[0.98]"
          >
            Telegramda oching
          </a>
          <p className="mt-3 text-[12px] font-semibold text-ink-soft">
            @Talantly_bot
          </p>
        </div>
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
