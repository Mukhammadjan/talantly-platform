"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { initTelegram } from "@/lib/telegram";

export default function IzlovchiPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <main className="screen">
      <EmptyState
        icon={<Icon name="users" size={26} />}
        title="Ish beruvchi bo'limi tez orada"
        text="Tekshirilgan nomzodlar, xarita va so'rovlar shu yerda bo'ladi."
        action={
          <Button variant="secondary" onClick={() => router.push("/rol")}>
            Rolni almashtirish
          </Button>
        }
      />
    </main>
  );
}
