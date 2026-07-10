import type { TalantlyClient } from "../db/client.js";
import type { PlacementRow } from "../types.js";

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `placementsRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

export async function listAll(client: TalantlyClient): Promise<PlacementRow[]> {
  const { data, error } = await client
    .from("placements")
    .select("*")
    .order("placed_at", { ascending: false, nullsFirst: false });
  if (error) fail("listAll", error.message, error.code);
  return (data ?? []) as PlacementRow[];
}
