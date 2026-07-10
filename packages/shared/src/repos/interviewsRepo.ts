import type { TalantlyClient } from "../db/client.js";
import type {
  InterviewDecision,
  InterviewInsert,
  InterviewRow,
} from "../types.js";

export async function insert(
  client: TalantlyClient,
  values: InterviewInsert,
): Promise<InterviewRow> {
  const { data, error } = await client
    .from("interviews")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(
      `interviewsRepo.insert(talent=${values.talent_id ?? "null"}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as InterviewRow;
}

export async function findLatestByTalentId(
  client: TalantlyClient,
  talentId: string,
): Promise<InterviewRow | null> {
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .eq("talent_id", talentId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(
      `interviewsRepo.findLatestByTalentId(${talentId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  const rows = (data ?? []) as InterviewRow[];
  return rows[0] ?? null;
}

export async function listApprovedByTalentIds(
  client: TalantlyClient,
  talentIds: string[],
): Promise<InterviewRow[]> {
  if (talentIds.length === 0) return [];
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .in("talent_id", talentIds)
    .eq("decision", "approved")
    .order("decided_at", { ascending: false });

  if (error) {
    throw new Error(
      `interviewsRepo.listApprovedByTalentIds failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewRow[];
}

export async function findUndecided(
  client: TalantlyClient,
): Promise<InterviewRow[]> {
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .is("decision", null)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(
      `interviewsRepo.findUndecided failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewRow[];
}

export async function findById(
  client: TalantlyClient,
  id: string,
): Promise<InterviewRow | null> {
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `interviewsRepo.findById(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as InterviewRow | null) ?? null;
}

export async function decide(
  client: TalantlyClient,
  id: string,
  values: {
    moderator_id: string;
    rating: number;
    notes: string | null;
    decision: InterviewDecision;
  },
): Promise<InterviewRow> {
  const { data, error } = await client
    .from("interviews")
    .update({ ...values, decided_at: new Date().toISOString() })
    .eq("id", id)
    .is("decision", null)
    .select();

  if (error) {
    throw new Error(
      `interviewsRepo.decide(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  const rows = (data ?? []) as InterviewRow[];
  const row = rows[0];
  if (!row) {
    throw new Error(
      `interviewsRepo.decide(${id}) failed: interview already decided or missing`,
    );
  }
  return row;
}

export async function listByTalentId(
  client: TalantlyClient,
  talentId: string,
): Promise<InterviewRow[]> {
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .eq("talent_id", talentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `interviewsRepo.listByTalentId(${talentId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewRow[];
}

export interface InterviewWithTalent extends InterviewRow {
  talents: { id: string; full_name: string | null } | null;
}

export async function listWithTalents(
  client: TalantlyClient,
): Promise<InterviewWithTalent[]> {
  const { data, error } = await client
    .from("interviews")
    .select("*, talents(id, full_name)")
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw new Error(
      `interviewsRepo.listWithTalents failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as unknown as InterviewWithTalent[];
}

/** Undecided interviews scheduled inside [from, to] — used for reminders. */
export async function findScheduledBetween(
  client: TalantlyClient,
  fromIso: string,
  toIso: string,
): Promise<InterviewRow[]> {
  const { data, error } = await client
    .from("interviews")
    .select("*")
    .is("decision", null)
    .gte("scheduled_at", fromIso)
    .lte("scheduled_at", toIso);

  if (error) {
    throw new Error(
      `interviewsRepo.findScheduledBetween failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as InterviewRow[];
}
