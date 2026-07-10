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
