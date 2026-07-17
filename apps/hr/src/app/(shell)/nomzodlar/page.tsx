import { Header } from "@/components/Header";
import { companyLabel, requireCompany } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

export default async function NomzodlarPage(): Promise<JSX.Element> {
  const { company } = await requireCompany();
  const label = companyLabel(company);

  return (
    <>
      <Header title="Nomzodlar" companyName={label} />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-content mx-auto">
          <div className="rounded-lg bg-white shadow-raise p-10 text-center text-ink-3">
            Nomzodlar jadvali va filtrlar keyingi bosqichda (W2) ulanadi.
            <br />
            Auth va layout tayyor — siz <b className="text-ink-1">{label}</b>{" "}
            sifatida kirdingiz.
          </div>
        </div>
      </main>
    </>
  );
}
