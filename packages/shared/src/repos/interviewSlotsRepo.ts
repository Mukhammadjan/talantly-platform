import type { TalantlyClient } from "../db/client.js";
import type { InterviewSlotInsert, InterviewSlotRow } from "../types.js";

export async function openFuture(
  client: TalantlyClient,
): Promise<InterviewSlotRow[]> {
  const { data, error } = await client
    .from("interview_slots")
    .select("*")
    .eq("is_taken", false)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(
      `interviewSlotsRepo.openFuture failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewSlotRow[];
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<InterviewSlotRow | null> {
  const { data, error } = await client
    .from("interview_slots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `interviewSlotsRepo.findById(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as InterviewSlotRow | null) ?? null;
}

/**
 * Conditional claim: only flips is_taken when it is still false, so a
 * concurrent second claim returns zero rows and loses the race cleanly.
 */
export async function claim(
  client: TalantlyClient,
  slotId: string,
): Promise<InterviewSlotRow | null> {
  const { data, error } = await client
    .from("interview_slots")
    .update({ is_taken: true })
    .eq("id", slotId)
    .eq("is_taken", false)
    .select();

  if (error) {
    throw new Error(
      `interviewSlotsRepo.claim(${slotId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  const rows = (data ?? []) as InterviewSlotRow[];
  return rows[0] ?? null;
}

/** All future slots, taken or not — for the admin schedule view. */
export async function listFuture(
  client: TalantlyClient,
): Promise<InterviewSlotRow[]> {
  const { data, error } = await client
    .from("interview_slots")
    .select("*")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(
      `interviewSlotsRepo.listFuture failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewSlotRow[];
}

export async function insert(
  client: TalantlyClient,
  values: InterviewSlotInsert,
): Promise<InterviewSlotRow> {
  const { data, error } = await client
    .from("interview_slots")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(
      `interviewSlotsRepo.insert failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as InterviewSlotRow;
}

export async function insertMany(
  client: TalantlyClient,
  values: InterviewSlotInsert[],
): Promise<InterviewSlotRow[]> {
  if (values.length === 0) return [];
  const { data, error } = await client
    .from("interview_slots")
    .insert(values)
    .select();

  if (error) {
    throw new Error(
      `interviewSlotsRepo.insertMany failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewSlotRow[];
}
