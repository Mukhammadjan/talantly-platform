import type { TalantlyClient } from "../db/client.js";
import type { Direction, TestQuestionRow } from "../types.js";

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
