import type { ReactNode } from "react";
import { PaymentProvider } from "@/components/recruiter/PaymentSheet";
import { RecruiterProvider } from "@/lib/recruiter/store";

export default function RecruiterLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <RecruiterProvider>
      <PaymentProvider>{children}</PaymentProvider>
    </RecruiterProvider>
  );
}
