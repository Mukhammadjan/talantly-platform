import type { TalantlyClient } from "../db/client.js";
import type {
  BotState,
  TalentInsert,
  TalentRow,
  TalentStatus,
} from "../types.js";
import * as statusLogRepo from "./statusLogRepo.js";

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `talentsRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<TalentRow | null> {
  const { data, error } = await client
    .from("talents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(`findById(${id})`, error.message, error.code);
  return (data as TalentRow | null) ?? null;
}

export async function listAll(client: TalantlyClient): Promise<TalentRow[]> {
  const { data, error } = await client
    .from("talents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("listAll", error.message, error.code);
  return (data ?? []) as TalentRow[];
}

export async function findByUserId(
  client: TalantlyClient,
  userId: string,
): Promise<TalentRow | null> {
  const { data, error } = await client
    .from("talents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) fail(`findByUserId(${userId})`, error.message, error.code);
  const rows = (data ?? []) as TalentRow[];
  return rows[0] ?? null;
}

export async function createForUser(
  client: TalantlyClient,
  userId: string,
): Promise<TalentRow> {
  const values: TalentInsert = { user_id: userId, status: "yangi" };
  const { data, error } = await client
    .from("talents")
    .insert(values)
    .select()
    .single();
  if (error) fail(`createForUser(${userId})`, error.message, error.code);
  return data as TalentRow;
}

export async function linkUserId(
  client: TalantlyClient,
  talentId: string,
  userId: string,
): Promise<TalentRow> {
  const { data, error } = await client
    .from("talents")
    .update({ user_id: userId })
    .eq("id", talentId)
    .select()
    .single();
  if (error) {
    fail(`linkUserId(${talentId}, ${userId})`, error.message, error.code);
  }
  return data as TalentRow;
}

export async function updateFields(
  client: TalantlyClient,
  talentId: string,
  fields: Partial<TalentInsert>,
): Promise<TalentRow> {
  const { data, error } = await client
    .from("talents")
    .update(fields)
    .eq("id", talentId)
    .select()
    .single();
  if (error) fail(`updateFields(${talentId})`, error.message, error.code);
  return data as TalentRow;
}

export async function updateBotState(
  client: TalantlyClient,
  talentId: string,
  botState: BotState,
): Promise<TalentRow> {
  return updateFields(client, talentId, {
    bot_state: { ...botState, updated_at: new Date().toISOString() },
  });
}

/** Updates status AND writes the mandatory status_log row (guardrail #8). */
export async function setStatus(
  client: TalantlyClient,
  talent: Pick<TalentRow, "id" | "status">,
  newStatus: TalentStatus,
  changedBy: string,
  extraFields: Partial<TalentInsert> = {},
): Promise<TalentRow> {
  const updated = await updateFields(client, talent.id, {
    ...extraFields,
    status: newStatus,
  });
  await statusLogRepo.insert(client, {
    entity: "talent",
    entity_id: talent.id,
    old_status: talent.status,
    new_status: newStatus,
    changed_by: changedBy,
  });
  return updated;
}
