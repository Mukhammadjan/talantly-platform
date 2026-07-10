import type { Direction } from "@talantly/shared";
import {
  companiesRepo,
  placementsRepo,
  requestsRepo,
  skillTestsRepo,
  talentsRepo,
} from "@talantly/shared";
import {
  COMPANY_STATUS_LABELS,
  COMPANY_STATUS_ORDER,
  DIRECTION_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

function BarList({
  items,
  accent = "bg-orange",
}: {
  items: { label: string; value: number; hint?: string }[];
  accent?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] text-ink-soft">{item.label}</span>
            <span className="whitespace-nowrap text-[13px] font-semibold text-ink">
              {item.value}
              {item.hint ? (
                <span className="ml-1 font-normal text-ink-faint">
                  {item.hint}
                </span>
              ) : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream">
            <div
              className={`h-full rounded-full ${accent}`}
              style={{
                width: `${Math.max(Math.round((item.value / max) * 100), item.value > 0 ? 3 : 0)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function StatistikaPage() {
  const client = getServiceClient();
  const [talents, tests, companies, requests, placements] = await Promise.all([
    talentsRepo.listAll(client),
    skillTestsRepo.listAll(client),
    companiesRepo.listAll(client),
    requestsRepo.listWithRelations(client),
    placementsRepo.listAll(client),
  ]);

  const verified = talents.filter((t) => t.status === "tekshirilgan");
  const verifiedPct =
    talents.length > 0
      ? Math.round((verified.length / talents.length) * 100)
      : 0;

  const scoredTests = tests.filter((t) => t.score !== null);
  const avgScore =
    scoredTests.length > 0
      ? Math.round(
          scoredTests.reduce((sum, t) => sum + (t.score ?? 0), 0) /
            scoredTests.length,
        )
      : null;

  const directions = Object.keys(DIRECTION_LABELS) as Direction[];
  const byDirection = directions
    .map((d) => {
      const inDir = talents.filter((t) => t.direction === d);
      const verifiedInDir = inDir.filter(
        (t) => t.status === "tekshirilgan",
      ).length;
      return {
        label: DIRECTION_LABELS[d],
        value: inDir.length,
        hint: verifiedInDir > 0 ? `(${verifiedInDir} tekshirilgan)` : undefined,
      };
    })
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value);

  const cityCounts = new Map<string, number>();
  for (const t of talents) {
    if (t.city) cityCounts.set(t.city, (cityCounts.get(t.city) ?? 0) + 1);
  }
  const byCity = [...cityCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const byStatus = STATUS_ORDER.map((s) => ({
    label: STATUS_LABELS[s],
    value: talents.filter((t) => t.status === s).length,
  })).filter((i) => i.value > 0);

  const avgByDirection = directions
    .map((d) => {
      const dirTests = scoredTests.filter((t) => t.direction === d);
      if (dirTests.length === 0) return null;
      return {
        label: DIRECTION_LABELS[d],
        value: Math.round(
          dirTests.reduce((sum, t) => sum + (t.score ?? 0), 0) /
            dirTests.length,
        ),
        hint: `/100 (${dirTests.length} test)`,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const companiesByStatus = COMPANY_STATUS_ORDER.map((s) => ({
    label: COMPANY_STATUS_LABELS[s],
    value: companies.filter((c) => c.status === s).length,
  }));

  const requestsByStatus = REQUEST_STATUS_ORDER.map((s) => ({
    label: REQUEST_STATUS_LABELS[s],
    value: requests.filter((r) => r.status === s).length,
  }));

  const paidPlacements = placements.filter(
    (p) => p.fee_status === "paid",
  ).length;

  const headline = [
    { label: "Talantlar", value: String(talents.length) },
    { label: "Tekshirilgan", value: `${verified.length} (${verifiedPct}%)` },
    {
      label: "O'rtacha test bali",
      value: avgScore !== null ? `${avgScore}/100` : "—",
    },
    { label: "Izlovchilar", value: String(companies.length) },
    { label: "So'rovlar", value: String(requests.length) },
    {
      label: "Joylashuvlar",
      value: `${placements.length} (${paidPlacements} to'langan)`,
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="mb-6 text-[24px] font-bold text-ink">Statistika</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {headline.map((h) => (
          <div key={h.label} className="card p-4 shadow-soft">
            <p className="label-caps">{h.label}</p>
            <p className="mt-1.5 text-[18px] font-bold leading-tight text-ink">
              {h.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            Yo'nalishlar bo'yicha talantlar
          </h2>
          {byDirection.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Ma'lumot yo'q.</p>
          ) : (
            <BarList items={byDirection} />
          )}
        </section>

        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            Shaharlar bo'yicha
          </h2>
          {byCity.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Ma'lumot yo'q.</p>
          ) : (
            <BarList items={byCity} accent="bg-orange-light" />
          )}
        </section>

        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            Statuslar bo'yicha talantlar
          </h2>
          {byStatus.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Ma'lumot yo'q.</p>
          ) : (
            <BarList items={byStatus} />
          )}
        </section>

        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            O'rtacha test bali (yo'nalish bo'yicha)
          </h2>
          {avgByDirection.length === 0 ? (
            <p className="text-[13px] text-ink-faint">
              Testlar hali topshirilmagan.
            </p>
          ) : (
            <BarList items={avgByDirection} accent="bg-green" />
          )}
        </section>

        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            Izlovchilar pipeline
          </h2>
          <BarList items={companiesByStatus} />
        </section>

        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            So'rovlar holati
          </h2>
          <BarList items={requestsByStatus} accent="bg-orange-light" />
        </section>
      </div>
    </div>
  );
}
