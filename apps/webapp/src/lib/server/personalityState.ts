import type { TalentRow } from "@talantly/shared";

export interface PersonalityState {
  questionIds: string[];
  answers: Record<string, number>;
}

export function readPersonalityState(
  talent: TalentRow,
): PersonalityState | null {
  if (talent.bot_state?.step !== "personality") return null;
  const data = talent.bot_state.data;
  if (!data || typeof data !== "object") return null;
  const raw = data as { questionIds?: unknown; answers?: unknown };
  if (
    !Array.isArray(raw.questionIds) ||
    raw.questionIds.some((id) => typeof id !== "string") ||
    raw.questionIds.length === 0
  ) {
    return null;
  }
  const answers: Record<string, number> = {};
  if (raw.answers && typeof raw.answers === "object") {
    for (const [key, value] of Object.entries(
      raw.answers as Record<string, unknown>,
    )) {
      if (typeof value === "number" && Number.isInteger(value)) {
        answers[key] = value;
      }
    }
  }
  return { questionIds: raw.questionIds as string[], answers };
}
