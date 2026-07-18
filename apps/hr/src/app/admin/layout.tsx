import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  await requireAdminPage();
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
