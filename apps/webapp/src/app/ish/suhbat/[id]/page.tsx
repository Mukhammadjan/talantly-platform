"use client";

import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { TopHeader } from "@/components/recruiter/Nav";

export default function SuhbatPage(): JSX.Element {
  return (
    <div className="min-h-app bg-canvas">
      <TopHeader title="Suhbat" back />
      <ComingSoon icon="chat" title="Chat tez orada" />
    </div>
  );
}
