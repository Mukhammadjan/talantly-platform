import Link from "next/link";
import type { RequestStatus } from "@talantly/shared";
import { requestsRepo } from "@talantly/shared";
import { formatDateUz } from "@/lib/format";
import {
  DIRECTION_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_ORDER,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { RequestStatusSelect } from "./StatusControl";

export const dynamic = "force-dynamic";

const COLUMN_ACCENT: Record<RequestStatus, string> = {
  yangi: "bg-orange",
  korildi: "bg-orange-light",
  boglanildi: "bg-green",
  yopildi: "bg-line",
};

export default async function SorovlarPage() {
  const client = getServiceClient();
  const requests = await requestsRepo.listWithRelations(client);

  const statusOptions = REQUEST_STATUS_ORDER.map((s) => ({
    value: s,
    label: REQUEST_STATUS_LABELS[s],
  }));

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[24px] font-bold text-ink">So'rovlar</h1>
        <p className="text-[13px] text-ink-soft">jami {requests.length} ta</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REQUEST_STATUS_ORDER.map((status) => {
          const cards = requests.filter((r) => r.status === status);
          return (
            <section key={status} className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${COLUMN_ACCENT[status]}`}
                />
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-soft">
                  {REQUEST_STATUS_LABELS[status]}
                </h2>
                <span className="text-[13px] font-semibold text-ink-faint">
                  {cards.length}
                </span>
              </div>

              <div className="grid gap-3">
                {cards.length === 0 ? (
                  <div className="rounded-card border border-dashed border-line p-4 text-center text-[13px] text-ink-faint">
                    Bo'sh
                  </div>
                ) : (
                  cards.map((r) => (
                    <article key={r.id} className="card p-4 shadow-soft">
                      <p className="label-caps mb-2">
                        {r.kind === "kompaniya_sorovi"
                          ? "Kompaniya so'rovi"
                          : "Talant qiziqishi"}
                      </p>
                      <div className="grid gap-1">
                        {r.companies ? (
                          <p className="text-[14px] font-semibold text-ink">
                            {r.companies.name}
                          </p>
                        ) : null}
                        {r.talents ? (
                          <Link
                            href={`/talantlar/${r.talents.id}`}
                            className="text-[14px] font-semibold text-ink transition-colors hover:text-orange"
                          >
                            {r.talents.full_name ?? "Nomsiz talant"}
                          </Link>
                        ) : null}
                        {r.direction ? (
                          <p className="text-[13px] text-ink-soft">
                            {DIRECTION_LABELS[
                              r.direction as keyof typeof DIRECTION_LABELS
                            ] ?? r.direction}
                          </p>
                        ) : null}
                        {r.note ? (
                          <p className="text-[13px] leading-relaxed text-ink-soft">
                            {r.note}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <RequestStatusSelect
                          requestId={r.id}
                          status={r.status}
                          options={statusOptions}
                        />
                        <p className="text-right text-[12px] text-ink-faint">
                          {formatDateUz(r.created_at)}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
