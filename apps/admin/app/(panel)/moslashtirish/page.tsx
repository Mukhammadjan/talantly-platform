import { companiesRepo, skillTestsRepo, talentsRepo } from "@talantly/shared";
import { DIRECTION_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import {
  MatchBuilder,
  type CompanyOption,
  type TalentOption,
} from "./MatchBuilder";

export const dynamic = "force-dynamic";

export default async function MoslashtirishPage() {
  const client = getServiceClient();
  const [companies, talents, tests] = await Promise.all([
    companiesRepo.listAll(client),
    talentsRepo.listAll(client),
    skillTestsRepo.listAll(client),
  ]);

  const scores = new Map<string, number>();
  for (const test of tests) {
    if (test.talent_id && test.score !== null && !scores.has(test.talent_id)) {
      scores.set(test.talent_id, test.score);
    }
  }

  const companyOptions: CompanyOption[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    directions: c.directions_needed ?? [],
  }));

  const talentOptions: TalentOption[] = talents
    .filter((t) => t.status === "tekshirilgan")
    .map((t) => ({
      id: t.id,
      name: t.full_name ?? "Nomsiz",
      headline: t.headline,
      direction: t.direction,
      directionLabel: t.direction ? DIRECTION_LABELS[t.direction] : "—",
      levelLabel: t.level ? LEVEL_LABELS[t.level] : "—",
      city: t.city,
      score: scores.get(t.id) ?? null,
    }));

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-ink">Moslashtirish</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Izlovchi uchun tekshirilgan talantlardan tanlab, ulashish havolasini
          yarating.
        </p>
      </div>
      <MatchBuilder companies={companyOptions} talents={talentOptions} />
    </div>
  );
}
