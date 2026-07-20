"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { OfflineGate } from "@/components/OfflineGate";
import { WebFooter } from "@/components/web/WebFooter";
import { WebHeader } from "@/components/web/WebHeader";
import { isInsideTelegram } from "@/lib/telegram";

// Mini App ekranlari (forma, testlar) Telegram qobig'ida 480px konteynerda
// ishlaydi. Brauzerda esa xuddi shu ekranlar web platformasi ichida ochiladi —
// yuqorida WebHeader, markazda kengroq karta, pastda footer. Ekran mantig'i
// bir xil qoladi, faqat ramkasi almashadi.
export default function AppShellLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  // null = hali aniqlanmagan (SSR bilan mos). Mount'da haqiqiy holat o'rnatiladi.
  const [inTelegram, setInTelegram] = useState<boolean | null>(null);

  useEffect(() => {
    setInTelegram(isInsideTelegram());
  }, []);

  // Brauzer (Telegramdan tashqari) — web ramkasi.
  if (inTelegram === false) {
    return (
      <div className="appWebFrame">
        <WebHeader />
        <div className="app app--web">{children}</div>
        <WebFooter />
      </div>
    );
  }

  // Telegram yoki hali aniqlanmagan — asl mobil qobiq.
  return (
    <div className="app">
      <OfflineGate />
      {children}
    </div>
  );
}
