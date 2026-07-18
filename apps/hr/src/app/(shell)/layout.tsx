import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { isAdmin } from "@/lib/server/admin";
import { companyLabel, requireCompany } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export default async function ShellLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const { session, company } = await requireCompany();
  return (
    <div className="flex min-h-screen">
      <Sidebar
        companyName={companyLabel(company)}
        showAdmin={isAdmin(session)}
      />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
