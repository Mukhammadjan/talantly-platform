import { interviewSlotsRepo } from "@talantly/shared";
import type { InterviewSlotInsert, InterviewSlotRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function openFuture(): Promise<InterviewSlotRow[]> {
  return interviewSlotsRepo.openFuture(getSupabase());
}

export async function insertMany(
  values: InterviewSlotInsert[],
): Promise<InterviewSlotRow[]> {
  return interviewSlotsRepo.insertMany(getSupabase(), values);
}

export async function findById(id: string): Promise<InterviewSlotRow | null> {
  return interviewSlotsRepo.findById(getSupabase(), id);
}

/** Conditional claim — flips is_taken only if still false (race-safe). */
export async function claim(slotId: string): Promise<InterviewSlotRow | null> {
  return interviewSlotsRepo.claim(getSupabase(), slotId);
}
