import { interviewsRepo } from "@talantly/shared";
import type { InterviewDecision, InterviewRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

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
