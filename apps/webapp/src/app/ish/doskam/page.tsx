"use client";

import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { BottomNav, Screen, TopHeader } from "@/components/recruiter/Nav";

export default function DoskamPage(): JSX.Element {
  return (
    <>
      <Screen>
        <TopHeader title="Doskam" subtitle="Nomzodlar bosqichlari" />
        <ComingSoon icon="board" title="Doska tez orada" />
      </Screen>
      <BottomNav />
    </>
  );
}
