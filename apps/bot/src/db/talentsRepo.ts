import { talentsRepo } from "@talantly/shared";
import type { BotState, TalentInsert, TalentRow, TalentStatus } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function findById(id: string): Promise<TalentRow | null> {
  return talentsRepo.findById(getSupabase(), id);
}

export async function findByUserId(userId: string): Promise<TalentRow | null> {
  return talentsRepo.findByUserId(getSupabase(), userId);
}

export async function linkUserId(
  talentId: string,
  userId: string,
): Promise<TalentRow> {
  return talentsRepo.linkUserId(getSupabase(), talentId, userId);
}

export async function setStatus(
  talent: Pick<TalentRow, "id" | "status">,
  newStatus: TalentStatus,
  changedBy: string,
  extraFields: Partial<TalentInsert> = {},
): Promise<TalentRow> {
  return talentsRepo.setStatus(
    getSupabase(),
    talent,
    newStatus,
    changedBy,
    extraFields,
  );
}

export async function updateBotState(
  talentId: string,
  botState: BotState,
): Promise<TalentRow> {
  return talentsRepo.updateBotState(getSupabase(), talentId, botState);
}
