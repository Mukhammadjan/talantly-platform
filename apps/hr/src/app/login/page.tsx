"use client";

import { BP } from "@/lib/bp";
import { useEffect, useRef, useState } from "react";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_BOT_USERNAME?.replace(/^@/, "") ?? "Talantly_bot";

interface TgUser {
  id: number;
  first_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TgUser) => void;
  }
}

export default function LoginPage(): JSX.Element {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    window.onTelegramAuth = (user) => {
      setStatus("loading");
      void fetch(`${BP}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => {
          if (res.ok) {
            window.location.href = `${BP}/nomzodlar`;
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    };

    // Telegram Login Widget skriptini joylashtiramiz.
    if (widgetRef.current && !widgetRef.current.querySelector("script")) {
      const s = document.createElement("script");
      s.src = "https://telegram.org/js/telegram-widget.js?22";
      s.async = true;
      s.setAttribute("data-telegram-login", BOT_USERNAME);
      s.setAttribute("data-size", "large");
      s.setAttribute("data-radius", "12");
      s.setAttribute("data-onauth", "onTelegramAuth(user)");
      s.setAttribute("data-request-access", "write");
      widgetRef.current.appendChild(s);
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center gap-6">
        <img
          src={`${BP}/brand/mark.svg`}
          alt=""
          width={56}
          height={56}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-ink-1 leading-tight">
            Talantly — HR platforma
          </h1>
          <p className="text-ink-2 text-[15px] leading-relaxed">
            Tekshirilgan yosh talantlarni toping, baholang va ishga oling.
            Telegram orqali bir bosishda kiring — parol yo&rsquo;q.
          </p>
        </div>

        <div className="min-h-[48px] flex items-center justify-center" ref={widgetRef} />

        {status === "loading" ? (
          <p className="text-ink-3 text-[13px]">Kirilmoqda...</p>
        ) : null}
        {status === "error" ? (
          <p className="text-danger-ink text-[13px]">
            Kirishda xatolik. Qayta urinib ko&rsquo;ring.
          </p>
        ) : null}

        <p className="text-ink-3 text-[12px] max-w-[320px]">
          Telefonda Mini App&rsquo;da kirgan bo&rsquo;lsangiz, shu yerda ham
          bir xil kompaniya profilingizni ko&rsquo;rasiz.
        </p>
      </div>
    </main>
  );
}
