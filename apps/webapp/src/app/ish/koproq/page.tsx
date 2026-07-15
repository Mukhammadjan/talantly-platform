"use client";

import { useRouter } from "next/navigation";
import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { BottomNav, Screen, TopHeader } from "@/components/recruiter/Nav";
import { haptic } from "@/lib/telegram";

export default function KoproqPage(): JSX.Element {
  const router = useRouter();
  return (
    <>
      <Screen>
        <TopHeader title="Ko'proq" />
        <ComingSoon icon="grid" title="Sozlamalar tez orada" />
        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              haptic("light");
              router.push("/rol");
            }}
            className="flex w-full items-center justify-center rounded-card border border-line bg-surface py-3.5 text-[14px] font-semibold text-text active:bg-surface2"
          >
            Rolni almashtirish
          </button>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
