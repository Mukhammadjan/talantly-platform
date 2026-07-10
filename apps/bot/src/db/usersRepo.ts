import { usersRepo } from "@talantly/shared";
import type { UserRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function upsertByTgId(tgId: number): Promise<UserRow> {
  return usersRepo.upsertByTgId(getSupabase(), tgId);
}

export async function findByTgId(tgId: number): Promise<UserRow | null> {
  return usersRepo.findByTgId(getSupabase(), tgId);
}

export async function findById(id: string): Promise<UserRow | null> {
  return usersRepo.findById(getSupabase(), id);
}
