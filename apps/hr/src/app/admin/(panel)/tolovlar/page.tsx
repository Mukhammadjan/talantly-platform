import { AdminHeader } from "@/components/AdminHeader";
import { TolovlarClient } from "@/components/TolovlarClient";
import { requireAdminPage } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export default async function AdminTolovlarPage(): Promise<JSX.Element> {
  await requireAdminPage();
  return (
    <>
      <AdminHeader title="To'lovlar" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-shell mx-auto">
          <TolovlarClient />
        </div>
      </main>
    </>
  );
}
