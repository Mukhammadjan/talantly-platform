import type { TalantlyClient } from "../db/client.js";
import type { StatusLogInsert, StatusLogRow } from "../types.js";

export async function insert(
  client: TalantlyClient,
  values: StatusLogInsert,
): Promise<StatusLogRow> {
  const { data, error } = await client
    .from("status_log")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(
      `statusLogRepo.insert(${values.entity}:${values.entity_id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as StatusLogRow;
}

export async function listForEntity(
  client: TalantlyClient,
  entity: string,
  entityId: string,
): Promise<StatusLogRow[]> {
  const { data, error } = await client
    .from("status_log")
    .select("*")
    .eq("entity", entity)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `statusLogRepo.listForEntity(${entity}:${entityId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as StatusLogRow[];
}
