import { AdminHeader } from "@/components/AdminHeader";
import { ShikoyatlarClient } from "@/components/ShikoyatlarClient";
import { requireAdminPage } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
  await requireAdminPage();
  return (
    <>
      <AdminHeader title="Shikoyatlar" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <ShikoyatlarClient />
        </div>
      </main>
    </>
  );
}
