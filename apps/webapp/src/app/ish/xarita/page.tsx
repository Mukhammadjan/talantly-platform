"use client";

import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { BottomNav, Screen, TopHeader } from "@/components/recruiter/Nav";

export default function XaritaPage(): JSX.Element {
  return (
    <>
      <Screen>
        <TopHeader title="Xarita" subtitle="Nomzodlar geografiyasi" />
        <ComingSoon icon="map" title="Xarita tez orada" />
      </Screen>
      <BottomNav />
    </>
  );
}
