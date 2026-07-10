import {
  skillTestsRepo,
  talentsRepo,
  testQuestionsRepo,
  type TestQuestionRow,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import type { TestQuestionPublic, TestStartResponse } from "@/lib/apiTypes";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { notifyAdmin } from "@/lib/server/notify";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";
import { readTestState } from "@/lib/server/testState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_QUESTIONS = 5;
const DRAW_COUNT = 10;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i] as T;
    result[i] = result[j] as T;
    result[j] = a;
  }
  return result;
}

/** Strips correct_index — correct answers must never reach the client. */
function toPublic(question: TestQuestionRow): TestQuestionPublic {
  return {
    id: question.id,
    question: question.question,
    options: question.options,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { talent } = context;

    if (talent.status !== "cv_tayyor") {
      return conflict("Test faqat CV tayyor bo'lgach ochiladi.");
    }
    if (!talent.direction) {
      return badRequest("Yo'nalish tanlanmagan.");
    }

    const existing = await skillTestsRepo.findByTalentId(client, talent.id);
    if (existing) {
      return conflict("Siz testni allaqachon topshirgansiz.");
    }

    // Resume an in-flight attempt so closing the app is not a bypass.
    const inFlight = readTestState(talent);
    if (inFlight) {
      const questions = await testQuestionsRepo.findByIds(
        client,
        inFlight.questionIds,
      );
      const byId = new Map(questions.map((q) => [q.id, q]));
      const ordered = inFlight.questionIds
        .map((id) => byId.get(id))
        .filter((q): q is TestQuestionRow => Boolean(q));
      const payload: TestStartResponse = {
        available: true,
        questions: ordered.map(toPublic),
        answered: inFlight.answers,
      };
      return NextResponse.json(payload);
    }

    const active = await testQuestionsRepo.activeByDirection(
      client,
      talent.direction,
    );
    if (active.length < MIN_QUESTIONS) {
      await notifyAdmin(
        `⚠️ Skill test: "${talent.direction}" yo'nalishida faol savollar yetarli emas (${active.length} ta, kamida ${MIN_QUESTIONS} kerak).`,
      );
      const payload: TestStartResponse = {
        available: false,
        questions: [],
        answered: {},
      };
      return NextResponse.json(payload);
    }

    const drawn = shuffle(active).slice(0, DRAW_COUNT);
    await talentsRepo.updateBotState(client, talent.id, {
      step: "test",
      data: { questionIds: drawn.map((q) => q.id), answers: {} },
    });

    const payload: TestStartResponse = {
      available: true,
      questions: drawn.map(toPublic),
      answered: {},
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/test/start failed:", err);
    return serverError();
  }
}
