"use client";

import { ComingSoon } from "@/components/recruiter/ComingSoon";
import { TopHeader } from "@/components/recruiter/Nav";

export default function KompaniyaPage(): JSX.Element {
  return (
    <div className="min-h-app bg-canvas">
      <TopHeader title="Kompaniya" back />
      <ComingSoon icon="grid" title="Kompaniya profili tez orada" />
    </div>
  );
}
