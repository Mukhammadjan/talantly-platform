"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { Wordmark } from "@/components/Wordmark";
import { apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { TalentSnapshot } from "@/lib/apiTypes";
import type { PreferredMode } from "@talantly/shared";
import { haptic, initTelegramUi } from "@/lib/telegram";

interface RoleCardProps {
  emoji: string;
  title: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function RoleCard({
  emoji,
  title,
  text,
  selected,
  disabled,
  onSelect,
}: RoleCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full rounded-role border p-5 text-left shadow-soft transition-all duration-150 active:scale-[0.98] disabled:opacity-60 ${
        selected ? "border-orange bg-orange-soft" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-[28px]"
          aria-hidden
        >
          {emoji}
        </span>
        <span className="min-w-0">
          <span className="font-display block text-[17px] font-bold text-ink">
            {title}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
            {text}
          </span>
        </span>
        {selected ? (
          <span className="ml-auto h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-orange/30 border-t-orange" />
        ) : (
          <span className="ml-auto shrink-0 text-ink-soft" aria-hidden>
            ›
          </span>
        )}
      </div>
    </button>
  );
}

export default function RolePage(): JSX.Element {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<TalentSnapshot | null>(null);
  const [choice, setChoice] = useState<PreferredMode | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    authenticate()
      .then(({ snapshot: snap }) => {
        if (!cancelled) setSnapshot(snap);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function choose(mode: PreferredMode): Promise<void> {
    if (choice || !snapshot) return;
    setChoice(mode);
    setError(false);
    haptic("light");
    try {
      await apiFetch("/api/mode", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      haptic("success");
      if (mode === "talant") {
        router.replace(snapshot.status === "yangi" ? "/register" : "/profile");
      } else {
        router.replace("/izlovchi");
      }
    } catch {
      setChoice(null);
      setError(true);
      haptic("error");
    }
  }

  return (
    <main className="flex min-h-app flex-col px-5 pb-10 pt-12">
      <div className="flex flex-col items-center">
        <Wordmark height={38} className="seal-pop" />
        <h1 className="mt-6 text-[22px] font-bold tracking-tight text-ink">
          Xush kelibsiz!
        </h1>
        <p className="mt-1 text-center text-[14px] text-ink-soft">
          Talantly&apos;da kim sifatida davom etasiz?
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {snapshot ? (
          <>
            <RoleCard
              emoji="🌟"
              title="Men talantman"
              text="Tekshiruvdan o'ting, tasdiqlangan profil oling va ish takliflariga tayyor bo'ling."
              selected={choice === "talant"}
              disabled={Boolean(choice)}
              onSelect={() => void choose("talant")}
            />
            <RoleCard
              emoji="🔎"
              title="Talant izlayapman"
              text="Tekshirilgan nomzodlarni ko'ring va bir bosishda so'rov yuboring."
              selected={choice === "izlovchi"}
              disabled={Boolean(choice)}
              onSelect={() => void choose("izlovchi")}
            />
          </>
        ) : (
          <>
            <Skeleton className="h-[104px] w-full rounded-role" />
            <Skeleton className="h-[104px] w-full rounded-role" />
          </>
        )}
      </div>

      {error && (
        <p className="mt-5 text-center text-[13px] text-orange-deep">
          Xatolik yuz berdi. Qayta urinib ko&apos;ring.
        </p>
      )}

      <p className="mt-auto pt-8 text-center text-[12px] text-ink-soft">
        Rolni keyinchalik istalgan vaqtda almashtirishingiz mumkin.
      </p>
    </main>
  );
}
