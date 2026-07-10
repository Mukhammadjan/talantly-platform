import type { TalantlyClient } from "../db/client.js";
import type { Direction, TestQuestionInsert, TestQuestionRow } from "../types.js";

export async function listAll(
  client: TalantlyClient,
): Promise<TestQuestionRow[]> {
  const { data, error } = await client
    .from("test_questions")
    .select("*")
    .order("direction", { ascending: true });

  if (error) {
    throw new Error(
      `testQuestionsRepo.listAll failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as TestQuestionRow[];
}

export async function insert(
  client: TalantlyClient,
  values: TestQuestionInsert,
): Promise<TestQuestionRow> {
  const { data, error } = await client
    .from("test_questions")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(
      `testQuestionsRepo.insert failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as TestQuestionRow;
}

export async function updateFields(
  client: TalantlyClient,
  id: string,
  fields: Partial<Omit<TestQuestionRow, "id">>,
): Promise<TestQuestionRow> {
  const { data, error } = await client
    .from("test_questions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(
      `testQuestionsRepo.updateFields(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as TestQuestionRow;
}

export async function remove(
  client: TalantlyClient,
  id: string,
): Promise<void> {
  const { error } = await client.from("test_questions").delete().eq("id", id);

  if (error) {
    throw new Error(
      `testQuestionsRepo.remove(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
}

export async function activeByDirection(
  client: TalantlyClient,
  direction: Direction,
): Promise<TestQuestionRow[]> {
  const { data, error } = await client
    .from("test_questions")
    .select("*")
    .eq("direction", direction)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `testQuestionsRepo.activeByDirection(${direction}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as TestQuestionRow[];
}

export async function findByIds(
  client: TalantlyClient,
  ids: string[],
): Promise<TestQuestionRow[]> {
  const { data, error } = await client
    .from("test_questions")
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(
      `testQuestionsRepo.findByIds(${ids.length} ids) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data ?? []) as TestQuestionRow[];
}
