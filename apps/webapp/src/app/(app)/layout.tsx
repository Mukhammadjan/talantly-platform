import { OfflineGate } from "@/components/OfflineGate";
import type { ReactNode } from "react";

// Mobil Mini App qobig'i — 480px konteyner, Telegram viewport balandligi.
export default function AppShellLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="app">
      <OfflineGate />
      {children}
    </div>
  );
}
