import type { TalantlyClient } from "../db/client.js";
import type { RequestInsert, RequestRow, RequestStatus } from "../types.js";
import * as statusLogRepo from "./statusLogRepo.js";

export interface RequestWithRelations extends RequestRow {
  companies: { id: string; name: string } | null;
  talents: { id: string; full_name: string | null } | null;
}

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `requestsRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

export async function listWithRelations(
  client: TalantlyClient,
): Promise<RequestWithRelations[]> {
  const { data, error } = await client
    .from("requests")
    .select("*, companies(id, name), talents(id, full_name)")
    .order("created_at", { ascending: false });
  if (error) fail("listWithRelations", error.message, error.code);
  return (data ?? []) as unknown as RequestWithRelations[];
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<RequestRow | null> {
  const { data, error } = await client
    .from("requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(`findById(${id})`, error.message, error.code);
  return (data as RequestRow | null) ?? null;
}

export async function insert(
  client: TalantlyClient,
  values: RequestInsert,
): Promise<RequestRow> {
  const { data, error } = await client
    .from("requests")
    .insert(values)
    .select()
    .single();
  if (error) fail(`insert(${values.kind})`, error.message, error.code);
  return data as RequestRow;
}

/** Updates status AND writes the mandatory status_log row (guardrail #8). */
export async function setStatus(
  client: TalantlyClient,
  request: Pick<RequestRow, "id" | "status">,
  newStatus: RequestStatus,
  changedBy: string,
): Promise<RequestRow> {
  const { data, error } = await client
    .from("requests")
    .update({ status: newStatus })
    .eq("id", request.id)
    .select()
    .single();
  if (error) fail(`setStatus(${request.id})`, error.message, error.code);
  await statusLogRepo.insert(client, {
    entity: "request",
    entity_id: request.id,
    old_status: request.status,
    new_status: newStatus,
    changed_by: changedBy,
  });
  return data as RequestRow;
}
