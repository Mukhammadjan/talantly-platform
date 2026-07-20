import type { TalantlyClient } from "../db/client.js";
import type { UserInsert, UserRow } from "../types.js";

export async function upsertByTgId(
  client: TalantlyClient,
  tgId: number,
): Promise<UserRow> {
  // role intentionally omitted: the DB default ('talent') applies on insert,
  // and an update must never demote an existing admin/moderator back to
  // talent (this clobbered the founder's admin role on every bot /start).
  const values: UserInsert = { tg_id: tgId };
  const { data, error } = await client
    .from("users")
    .upsert(values, { onConflict: "tg_id" })
    .select()
    .single();

  if (error) {
    throw new Error(
      `usersRepo.upsertByTgId(${tgId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as UserRow;
}

export async function findByTgId(
  client: TalantlyClient,
  tgId: number,
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("tg_id", tgId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `usersRepo.findByTgId(${tgId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as UserRow | null) ?? null;
}

export async function updateFields(
  client: TalantlyClient,
  userId: string,
  fields: Partial<UserInsert>,
): Promise<UserRow> {
  const { data, error } = await client
    .from("users")
    .update(fields)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `usersRepo.updateFields(${userId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as UserRow;
}

export async function findByAuthUid(
  client: TalantlyClient,
  authUid: string,
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("auth_uid", authUid)
    .maybeSingle();

  if (error) {
    throw new Error(
      `usersRepo.findByAuthUid(${authUid}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as UserRow | null) ?? null;
}

export async function findByPhone(
  client: TalantlyClient,
  phone: string,
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw new Error(
      `usersRepo.findByPhone failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as UserRow | null) ?? null;
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `usersRepo.findById(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as UserRow | null) ?? null;
}
