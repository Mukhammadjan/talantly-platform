import { Header } from "@/components/Header";
import { NomzodlarClient } from "@/components/NomzodlarClient";
import { companyLabel, requireCompany } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export default async function NomzodlarPage(): Promise<JSX.Element> {
  const { company } = await requireCompany();

  return (
    <>
      <Header title="Nomzodlar" companyName={companyLabel(company)} />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-shell mx-auto">
          <NomzodlarClient />
        </div>
      </main>
    </>
  );
}
