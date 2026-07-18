import { AdminHeader } from "@/components/AdminHeader";
import { SozlamalarClient } from "@/components/SozlamalarClient";
import { requireAdminPage } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
  await requireAdminPage();
  return (
    <>
      <AdminHeader title="Sozlamalar" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <SozlamalarClient />
        </div>
      </main>
    </>
  );
}
