import { interviewsRepo } from "@talantly/shared";
import type {
  InterviewDecision,
  InterviewInsert,
  InterviewRow,
} from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function insert(values: InterviewInsert): Promise<InterviewRow> {
  return interviewsRepo.insert(getSupabase(), values);
}

export async function findUndecided(): Promise<InterviewRow[]> {
  return interviewsRepo.findUndecided(getSupabase());
}

export async function findById(id: string): Promise<InterviewRow | null> {
  return interviewsRepo.findById(getSupabase(), id);
}

export async function decide(
  id: string,
  values: {
    moderator_id: string;
    rating: number;
    notes: string | null;
    decision: InterviewDecision;
    decision_reason?: string;
  },
): Promise<InterviewRow> {
  return interviewsRepo.decide(getSupabase(), id, values);
}

export async function findScheduledBetween(
  fromIso: string,
  toIso: string,
): Promise<InterviewRow[]> {
  return interviewsRepo.findScheduledBetween(getSupabase(), fromIso, toIso);
}

/** No-show belgilash: decision='kelmadi' + decided_at (C10). */
export async function markNoShow(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("interviews")
    .update({ decision: "kelmadi", decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`markNoShow failed: ${error.message}`);
}

export async function freeSlot(slotId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("interview_slots")
    .update({ is_taken: false })
    .eq("id", slotId);
  if (error) throw new Error(`freeSlot failed: ${error.message}`);
}

export async function logInterviewEvent(
  interviewId: string,
  newStatus: string,
  changedBy: string,
): Promise<void> {
  const { error } = await getSupabase().from("status_log").insert({
    entity: "interviews",
    entity_id: interviewId,
    old_status: null,
    new_status: newStatus,
    changed_by: changedBy,
  });
  if (error) throw new Error(`logInterviewEvent failed: ${error.message}`);
}
