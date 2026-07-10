"use server";

import type {
  Archetype,
  Direction,
  PersonalityOption,
} from "@talantly/shared";
import { personalityQuestionsRepo, testQuestionsRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { ARCHETYPE_LABELS, DIRECTION_LABELS } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";

export interface QuestionFormState {
  error: string | null;
  ok: boolean;
}

const ARCHETYPES = Object.keys(ARCHETYPE_LABELS) as Archetype[];
const DIRECTIONS = Object.keys(DIRECTION_LABELS) as Direction[];

function parsePersonalityOptions(raw: string): PersonalityOption[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length < 2) return null;

  const options: PersonalityOption[] = [];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) return null;
    const label = String((item as { label?: unknown }).label ?? "").trim();
    if (!label) return null;
    const weightsRaw = (item as { weights?: unknown }).weights;
    if (typeof weightsRaw !== "object" || weightsRaw === null) return null;
    const weights: Partial<Record<Archetype, number>> = {};
    for (const [key, value] of Object.entries(
      weightsRaw as Record<string, unknown>,
    )) {
      if (!ARCHETYPES.includes(key as Archetype)) return null;
      const n = Number(value);
      if (!Number.isInteger(n)) return null;
      if (n !== 0) weights[key as Archetype] = n;
    }
    options.push({ label, weights });
  }
  return options;
}

export async function savePersonalityQuestion(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const ordRaw = String(formData.get("ord") ?? "").trim();
  const isActive = formData.get("is_active") === "on";
  const options = parsePersonalityOptions(
    String(formData.get("options") ?? ""),
  );

  if (!question) return { error: "Savol matnini kiriting.", ok: false };
  if (!options) {
    return {
      error: "Kamida 2 ta variant, har birida matn bo'lishi kerak.",
      ok: false,
    };
  }
  const ord = ordRaw ? Number(ordRaw) : null;
  if (ordRaw && (!Number.isInteger(ord) || (ord as number) < 1)) {
    return { error: "Tartib raqami musbat butun son bo'lsin.", ok: false };
  }

  await requireAdmin();
  const client = getServiceClient();
  if (id) {
    await personalityQuestionsRepo.updateFields(client, id, {
      question,
      options,
      ord,
      is_active: isActive,
    });
  } else {
    await personalityQuestionsRepo.insert(client, {
      question,
      options,
      ord,
      is_active: isActive,
    });
  }
  revalidatePath("/savollar");
  return { error: null, ok: true };
}

export async function togglePersonalityActive(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  await requireAdmin();
  await personalityQuestionsRepo.updateFields(getServiceClient(), id, {
    is_active: isActive,
  });
  revalidatePath("/savollar");
}

export async function deletePersonalityQuestion(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin();
  await personalityQuestionsRepo.remove(getServiceClient(), id);
  revalidatePath("/savollar");
}

export async function saveTestQuestion(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "") as Direction;
  const question = String(formData.get("question") ?? "").trim();
  const options = [0, 1, 2, 3]
    .map((i) => String(formData.get(`option_${i}`) ?? "").trim())
    .filter(Boolean);
  const correctIndex = Number(formData.get("correct_index"));
  const isActive = formData.get("is_active") === "on";

  if (!DIRECTIONS.includes(direction)) {
    return { error: "Yo'nalishni tanlang.", ok: false };
  }
  if (!question) return { error: "Savol matnini kiriting.", ok: false };
  if (options.length !== 4) {
    return { error: "4 ta variantning hammasini to'ldiring.", ok: false };
  }
  if (![0, 1, 2, 3].includes(correctIndex)) {
    return { error: "To'g'ri javobni belgilang.", ok: false };
  }

  await requireAdmin();
  const client = getServiceClient();
  if (id) {
    await testQuestionsRepo.updateFields(client, id, {
      direction,
      question,
      options,
      correct_index: correctIndex,
      is_active: isActive,
    });
  } else {
    await testQuestionsRepo.insert(client, {
      direction,
      question,
      options,
      correct_index: correctIndex,
      is_active: isActive,
    });
  }
  revalidatePath("/savollar");
  return { error: null, ok: true };
}

export async function toggleTestActive(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  await requireAdmin();
  await testQuestionsRepo.updateFields(getServiceClient(), id, {
    is_active: isActive,
  });
  revalidatePath("/savollar");
}

export async function deleteTestQuestion(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin();
  await testQuestionsRepo.remove(getServiceClient(), id);
  revalidatePath("/savollar");
}
