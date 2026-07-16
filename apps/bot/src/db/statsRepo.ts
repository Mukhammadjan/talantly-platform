import type { TalentStatus } from "@talantly/shared";
import { getSupabase } from "./client.js";

export type StatusCounts = Partial<Record<TalentStatus, number>> & {
  total: number;
};

/** Talent statuslari bo'yicha sanoq — admin statistikasi uchun. */
export async function countByStatus(): Promise<StatusCounts> {
  const { data, error } = await getSupabase().from("talents").select("status");
  if (error) {
    throw new Error(`statsRepo.countByStatus failed: ${error.message}`);
  }
  const counts: StatusCounts = { total: 0 };
  for (const row of (data ?? []) as { status: TalentStatus }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    counts.total += 1;
  }
  return counts;
}
