import type { TalantlyClient } from "../db/client.js";
import type {
  PersonalityQuestionInsert,
  PersonalityQuestionRow,
} from "../types.js";

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `personalityQuestionsRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

export async function listAll(
  client: TalantlyClient,
): Promise<PersonalityQuestionRow[]> {
  const { data, error } = await client
    .from("personality_questions")
    .select("*")
    .order("ord", { ascending: true, nullsFirst: false });
  if (error) fail("listAll", error.message, error.code);
  return (data ?? []) as PersonalityQuestionRow[];
}

export async function listActive(
  client: TalantlyClient,
): Promise<PersonalityQuestionRow[]> {
  const { data, error } = await client
    .from("personality_questions")
    .select("*")
    .eq("is_active", true)
    .order("ord", { ascending: true, nullsFirst: false });
  if (error) fail("listActive", error.message, error.code);
  return (data ?? []) as PersonalityQuestionRow[];
}

export async function insert(
  client: TalantlyClient,
  values: PersonalityQuestionInsert,
): Promise<PersonalityQuestionRow> {
  const { data, error } = await client
    .from("personality_questions")
    .insert(values)
    .select()
    .single();
  if (error) fail("insert", error.message, error.code);
  return data as PersonalityQuestionRow;
}

export async function updateFields(
  client: TalantlyClient,
  id: string,
  fields: Partial<PersonalityQuestionInsert>,
): Promise<PersonalityQuestionRow> {
  const { data, error } = await client
    .from("personality_questions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) fail(`updateFields(${id})`, error.message, error.code);
  return data as PersonalityQuestionRow;
}

export async function remove(
  client: TalantlyClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from("personality_questions")
    .delete()
    .eq("id", id);
  if (error) fail(`remove(${id})`, error.message, error.code);
}
