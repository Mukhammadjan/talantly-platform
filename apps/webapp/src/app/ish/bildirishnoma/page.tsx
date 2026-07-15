"use client";

import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { TopHeader } from "@/components/recruiter/Nav";

export default function BildirishnomaPage(): JSX.Element {
  return (
    <div className="min-h-app bg-canvas">
      <TopHeader title="Bildirishnomalar" back />
      <ComingSoon icon="bell" title="Bildirishnomalar tez orada" />
    </div>
  );
}
