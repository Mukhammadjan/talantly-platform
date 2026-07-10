import Link from "next/link";
import type { SkillTestRow, TalentRow } from "@talantly/shared";
import { skillTestsRepo, talentsRepo } from "@talantly/shared";
import { LevelChip, StatusChip, Tag } from "@/components/chips";
import { formatDateUz } from "@/lib/format";
import {
  ARCHETYPE_LABELS,
  DIRECTION_LABELS,
  LEVEL_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  WORK_FORMAT_LABELS,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { FilterBar, type FilterDef } from "./FilterBar";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  yonalish?: string;
  daraja?: string;
  format?: string;
  shahar?: string;
}

function latestScores(tests: SkillTestRow[]): Map<string, number> {
  const scores = new Map<string, number>();
  // tests are ordered newest-first; keep only the first per talent.
  for (const test of tests) {
    if (test.talent_id && test.score !== null && !scores.has(test.talent_id)) {
      scores.set(test.talent_id, test.score);
    }
  }
  return scores;
}

function applyFilters(talents: TalentRow[], sp: SearchParams): TalentRow[] {
  return talents.filter((t) => {
    if (sp.status && t.status !== sp.status) return false;
    if (sp.yonalish && t.direction !== sp.yonalish) return false;
    if (sp.daraja && t.level !== sp.daraja) return false;
    if (sp.format && !(t.work_formats ?? []).includes(sp.format as never)) {
      return false;
    }
    if (sp.shahar && t.city !== sp.shahar) return false;
    return true;
  });
}

function archetypeOf(talent: TalentRow): string | null {
  const archetype = talent.personality?.archetype;
  return archetype ? (ARCHETYPE_LABELS[archetype] ?? archetype) : null;
}

export default async function TalantlarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const client = getServiceClient();
  const [talents, tests] = await Promise.all([
    talentsRepo.listAll(client),
    skillTestsRepo.listAll(client),
  ]);
  const scores = latestScores(tests);
  const rows = applyFilters(talents, searchParams);

  const cities = [
    ...new Set(talents.map((t) => t.city).filter((c): c is string => !!c)),
  ].sort();

  const filters: FilterDef[] = [
    {
      param: "status",
      label: "Status",
      options: STATUS_ORDER.map((s) => ({
        value: s,
        label: STATUS_LABELS[s],
      })),
    },
    {
      param: "yonalish",
      label: "Yo'nalish",
      options: Object.entries(DIRECTION_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      param: "daraja",
      label: "Daraja",
      options: Object.entries(LEVEL_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      param: "format",
      label: "Ish formati",
      options: Object.entries(WORK_FORMAT_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      param: "shahar",
      label: "Shahar",
      options: cities.map((city) => ({ value: city, label: city })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[24px] font-bold text-ink">Talantlar</h1>
        <p className="text-[13px] text-ink-soft">
          {rows.length} ta / jami {talents.length} ta
        </p>
      </div>

      <div className="mb-5">
        <FilterBar filters={filters} />
      </div>

      <div className="card overflow-x-auto shadow-soft">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="label-caps px-4 py-3.5">Ism</th>
              <th className="label-caps px-4 py-3.5">Daraja</th>
              <th className="label-caps px-4 py-3.5">Yo'nalish</th>
              <th className="label-caps px-4 py-3.5">Skill teglar</th>
              <th className="label-caps px-4 py-3.5">Arxetip</th>
              <th className="label-caps px-4 py-3.5">Status</th>
              <th className="label-caps px-4 py-3.5 text-right">Ball</th>
              <th className="label-caps px-4 py-3.5 text-right">Sana</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-[14px] font-medium text-ink-soft">
                    Hech narsa topilmadi
                  </p>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    Filtrlarni o'zgartirib ko'ring.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((talent) => {
                const tags = talent.skill_tags ?? [];
                const archetype = archetypeOf(talent);
                const score = scores.get(talent.id);
                return (
                  <tr
                    key={talent.id}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-cream"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/talantlar/${talent.id}`}
                        className="group block"
                      >
                        <p className="text-[14px] font-semibold text-ink transition-colors group-hover:text-orange">
                          {talent.full_name ?? "Nomsiz"}
                        </p>
                        <p className="text-[12px] text-ink-faint">
                          {talent.headline ?? talent.city ?? ""}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <LevelChip level={talent.level} />
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-soft">
                      {talent.direction
                        ? DIRECTION_LABELS[talent.direction]
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {tags.length === 0 ? (
                        <span className="text-[13px] text-ink-faint">—</span>
                      ) : (
                        <span className="flex max-w-[220px] flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                          {tags.length > 3 ? (
                            <Tag>+{tags.length - 3}</Tag>
                          ) : null}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-soft">
                      {archetype ?? (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusChip status={talent.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right text-[14px] font-semibold text-ink">
                      {score !== undefined ? (
                        score
                      ) : (
                        <span className="font-normal text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-[13px] text-ink-soft">
                      {formatDateUz(talent.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
