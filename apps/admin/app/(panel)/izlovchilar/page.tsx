import type { CompanyRow, Urgency } from "@talantly/shared";
import { companiesRepo } from "@talantly/shared";
import { Tag } from "@/components/chips";
import { ImageUpload } from "@/components/ImageUpload";
import { formatDateUz } from "@/lib/format";
import {
  COMPANY_KIND_LABELS,
  COMPANY_STATUS_LABELS,
  COMPANY_STATUS_ORDER,
  DIRECTION_LABELS,
  NEEDED_LEVEL_LABELS,
  URGENCY_LABELS,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { FilterBar, type FilterDef } from "../talantlar/FilterBar";
import { CompanyStatusSelect, CompanyVerify, NotesCell } from "./RowControls";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  muddat?: string;
}

const URGENCY_STYLES: Record<Urgency, string> = {
  hoziroq: "bg-red-tint text-red",
  oy_ichida: "bg-orange-tint text-orange",
  korib_turibman: "bg-cream text-ink-soft",
};

function UrgencyChip({ urgency }: { urgency: Urgency | null }) {
  if (!urgency) return <span className="text-[13px] text-ink-faint">—</span>;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${URGENCY_STYLES[urgency]}`}
    >
      {URGENCY_LABELS[urgency]}
    </span>
  );
}

function applyFilters(companies: CompanyRow[], sp: SearchParams) {
  return companies.filter((c) => {
    if (sp.status && c.status !== sp.status) return false;
    if (sp.muddat && c.urgency !== sp.muddat) return false;
    return true;
  });
}

export default async function IzlovchilarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const client = getServiceClient();
  const companies = await companiesRepo.listAll(client);
  const rows = applyFilters(companies, searchParams);

  const statusOptions = COMPANY_STATUS_ORDER.map((s) => ({
    value: s,
    label: COMPANY_STATUS_LABELS[s],
  }));

  const filters: FilterDef[] = [
    { param: "status", label: "Status", options: statusOptions },
    {
      param: "muddat",
      label: "Muddat",
      options: Object.entries(URGENCY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[24px] font-bold text-ink">Izlovchilar</h1>
        <p className="text-[13px] text-ink-soft">
          {rows.length} ta / jami {companies.length} ta
        </p>
      </div>

      <div className="mb-5">
        <FilterBar filters={filters} />
      </div>

      <div className="card overflow-x-auto shadow-soft">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="label-caps px-4 py-3.5">Nomi</th>
              <th className="label-caps px-4 py-3.5">Turi</th>
              <th className="label-caps px-4 py-3.5">Shahar</th>
              <th className="label-caps px-4 py-3.5">Kimlar kerak</th>
              <th className="label-caps px-4 py-3.5">Muddat</th>
              <th className="label-caps px-4 py-3.5">Status</th>
              <th className="label-caps px-4 py-3.5">STIR / Tekshiruv</th>
              <th className="label-caps w-[220px] px-4 py-3.5">Izohlar</th>
              <th className="label-caps px-4 py-3.5 text-right">Sana</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <p className="text-[14px] font-medium text-ink-soft">
                    Izlovchilar topilmadi
                  </p>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    Filtrlarni o'zgartirib ko'ring.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-line align-top transition-colors last:border-b-0 hover:bg-cream"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <ImageUpload
                        kind="logo"
                        id={company.id}
                        initialUrl={company.logo_url}
                        size={44}
                      />
                      <div>
                        <p className="text-[14px] font-semibold text-ink">
                          {company.name}
                        </p>
                        <p className="text-[12px] text-ink-faint">
                          {[company.contact_name, company.phone_tg]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-ink-soft">
                    <p>
                      {company.kind
                        ? COMPANY_KIND_LABELS[company.kind]
                        : "—"}
                    </p>
                    {company.activity_type ? (
                      <p className="text-[12px] text-ink-faint">
                        {company.activity_type}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-ink-soft">
                    {company.city ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex max-w-[200px] flex-wrap gap-1">
                      {(company.directions_needed ?? []).map((d) => (
                        <Tag key={d}>
                          {DIRECTION_LABELS[
                            d as keyof typeof DIRECTION_LABELS
                          ] ?? d}
                        </Tag>
                      ))}
                      {company.needed_level ? (
                        <Tag>{NEEDED_LEVEL_LABELS[company.needed_level]}</Tag>
                      ) : null}
                      {(company.directions_needed ?? []).length === 0 &&
                      !company.needed_level ? (
                        <span className="text-[13px] text-ink-faint">—</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <UrgencyChip urgency={company.urgency} />
                  </td>
                  <td className="px-4 py-3.5">
                    <CompanyStatusSelect
                      companyId={company.id}
                      status={company.status}
                      options={statusOptions}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <CompanyVerify
                      companyId={company.id}
                      isVerified={company.is_verified}
                      inn={company.inn}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <NotesCell companyId={company.id} notes={company.notes} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[13px] text-ink-soft">
                    {formatDateUz(company.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
