import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { companyLabel, requireCompany } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export default async function ShellLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const { company } = await requireCompany();
  return (
    <div className="flex min-h-screen">
      <Sidebar companyName={companyLabel(company)} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
