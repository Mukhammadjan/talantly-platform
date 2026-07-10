import {
  ARCHETYPE_CODES,
  ARCHETYPE_META,
  personalityQuestionsRepo,
  talentsRepo,
  type Archetype,
  type PersonalityQuestionRow,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import type { PersonalityAnswerResponse } from "@/lib/apiTypes";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { readPersonalityState } from "@/lib/server/personalityState";
import {
  loadSessionContext,
  personalitySummary,
} from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dominantArchetype(
  scores: Partial<Record<Archetype, number>>,
): Archetype {
  let best: Archetype = "ijrochi";
  let bestScore = -Infinity;
  for (const code of ARCHETYPE_CODES) {
    const score = scores[code] ?? 0;
    if (score > bestScore) {
      best = code;
      bestScore = score;
    }
  }
  return best;
}

function optionDominant(
  question: PersonalityQuestionRow,
  optionIndex: number,
): Archetype | null {
  const option = question.options[optionIndex];
  if (!option) return null;
  return dominantArchetype(option.weights);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return badRequest("So'rov ma'lumotlari noto'g'ri.");
    }
    const { questionId, optionIndex } = body as {
      questionId?: unknown;
      optionIndex?: unknown;
    };
    if (
      typeof questionId !== "string" ||
      typeof optionIndex !== "number" ||
      !Number.isInteger(optionIndex) ||
      optionIndex < 0 ||
      optionIndex > 7
    ) {
      return badRequest("Javob formati noto'g'ri.");
    }

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { talent } = context;

    if (talent.personality) {
      return conflict("Xarakter testi allaqachon yakunlangan.");
    }
    if (talent.status === "yangi") {
      return conflict("Avval ro'yxatdan o'tishni yakunlang.");
    }
    const state = readPersonalityState(talent);
    if (!state) {
      return conflict("Test boshlanmagan.");
    }
    if (!state.questionIds.includes(questionId)) {
      return badRequest("Bunday savol testda yo'q.");
    }
    if (questionId in state.answers) {
      return conflict("Bu savolga javob allaqachon berilgan.");
    }

    const answers = { ...state.answers, [questionId]: optionIndex };
    const total = state.questionIds.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < total) {
      await talentsRepo.updateBotState(client, talent.id, {
        step: "personality",
        data: { questionIds: state.questionIds, answers },
      });
      const payload: PersonalityAnswerResponse = {
        done: false,
        answeredCount,
        total,
        result: null,
      };
      return NextResponse.json(payload);
    }

    // Final answer: score strictly server-side by summing option weights.
    const active = await personalityQuestionsRepo.listActive(client);
    const byId = new Map(active.map((q) => [q.id, q]));
    const questions = state.questionIds
      .map((id) => byId.get(id))
      .filter((q): q is PersonalityQuestionRow => Boolean(q));
    if (questions.length !== total) {
      console.error(
        `personality scoring: expected ${total} questions, got ${questions.length}`,
      );
      return serverError();
    }

    const scores: Partial<Record<Archetype, number>> = {};
    for (const question of questions) {
      const chosen = answers[question.id];
      const option =
        chosen === undefined ? undefined : question.options[chosen];
      if (!option) {
        return badRequest("Javob formati noto'g'ri.");
      }
      for (const [code, weight] of Object.entries(option.weights)) {
        if (typeof weight !== "number") continue;
        const key = code as Archetype;
        scores[key] = (scores[key] ?? 0) + weight;
      }
    }
    const winner = dominantArchetype(scores);
    const meta = ARCHETYPE_META[winner];

    // Consistency pair: questions ord 4 and 13 probe the same trait. If the
    // chosen options lean toward different archetypes, flag it — but still
    // complete the test.
    const first = questions.find((q) => q.ord === 4);
    const second = questions.find((q) => q.ord === 13);
    let consistent = true;
    if (first && second) {
      const a = optionDominant(first, answers[first.id] ?? -1);
      const b = optionDominant(second, answers[second.id] ?? -1);
      if (a && b && a !== b) consistent = false;
    }

    const updated = await talentsRepo.updateFields(client, talent.id, {
      personality: {
        archetype: winner,
        archetype_code: winner,
        archetype_label: meta.label,
        tagline: meta.tagline,
        traits: meta.traits,
        strengths: meta.traits,
        scores,
        consistent,
        completed_at: new Date().toISOString(),
      },
      bot_state: {},
    });

    const payload: PersonalityAnswerResponse = {
      done: true,
      answeredCount,
      total,
      result: personalitySummary(updated),
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/personality/answer failed:", err);
    return serverError();
  }
}
