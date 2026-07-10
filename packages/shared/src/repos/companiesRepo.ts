import type { TalantlyClient } from "../db/client.js";
import type { CompanyInsert, CompanyRow, CompanyStatus } from "../types.js";
import * as statusLogRepo from "./statusLogRepo.js";

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `companiesRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

export async function listAll(client: TalantlyClient): Promise<CompanyRow[]> {
  const { data, error } = await client
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("listAll", error.message, error.code);
  return (data ?? []) as CompanyRow[];
}

export async function findByUserId(
  client: TalantlyClient,
  userId: string,
): Promise<CompanyRow | null> {
  const { data, error } = await client
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) fail(`findByUserId(${userId})`, error.message, error.code);
  const rows = (data ?? []) as CompanyRow[];
  return rows[0] ?? null;
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<CompanyRow | null> {
  const { data, error } = await client
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(`findById(${id})`, error.message, error.code);
  return (data as CompanyRow | null) ?? null;
}

export async function insert(
  client: TalantlyClient,
  values: CompanyInsert,
): Promise<CompanyRow> {
  const { data, error } = await client
    .from("companies")
    .insert(values)
    .select()
    .single();
  if (error) fail(`insert(${values.name})`, error.message, error.code);
  return data as CompanyRow;
}

export async function updateFields(
  client: TalantlyClient,
  companyId: string,
  fields: Partial<CompanyInsert>,
): Promise<CompanyRow> {
  const { data, error } = await client
    .from("companies")
    .update(fields)
    .eq("id", companyId)
    .select()
    .single();
  if (error) fail(`updateFields(${companyId})`, error.message, error.code);
  return data as CompanyRow;
}

/** Updates status AND writes the mandatory status_log row (guardrail #8). */
export async function setStatus(
  client: TalantlyClient,
  company: Pick<CompanyRow, "id" | "status">,
  newStatus: CompanyStatus,
  changedBy: string,
): Promise<CompanyRow> {
  const updated = await updateFields(client, company.id, {
    status: newStatus,
  });
  await statusLogRepo.insert(client, {
    entity: "company",
    entity_id: company.id,
    old_status: company.status,
    new_status: newStatus,
    changed_by: changedBy,
  });
  return updated;
}
