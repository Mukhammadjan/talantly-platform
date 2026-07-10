import { skillTestsRepo, talentsRepo, testQuestionsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import type { TestAnswerResponse } from "@/lib/apiTypes";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";
import { readTestState } from "@/lib/server/testState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return badRequest("So'rov ma'lumotlari noto'g'ri.");
    }
    const { questionId, answerIndex } = body as {
      questionId?: unknown;
      answerIndex?: unknown;
    };
    if (
      typeof questionId !== "string" ||
      typeof answerIndex !== "number" ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 5
    ) {
      return badRequest("Javob formati noto'g'ri.");
    }

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { user, talent } = context;

    // New flow: character test first. Legacy talents (cv_tayyor) skip it.
    const eligible =
      (talent.status === "malumot_toldirilgan" && talent.personality) ||
      talent.status === "cv_tayyor";
    if (!eligible) {
      return conflict("Avval xarakter testini yakunlang.");
    }
    const state = readTestState(talent);
    if (!state) {
      return conflict("Test boshlanmagan.");
    }
    if (!state.questionIds.includes(questionId)) {
      return badRequest("Bunday savol testda yo'q.");
    }
    if (questionId in state.answers) {
      return conflict("Bu savolga javob allaqachon berilgan.");
    }

    const answers = { ...state.answers, [questionId]: answerIndex };
    const total = state.questionIds.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < total) {
      await talentsRepo.updateBotState(client, talent.id, {
        step: "test",
        data: { questionIds: state.questionIds, answers },
      });
      const payload: TestAnswerResponse = {
        done: false,
        answeredCount,
        total,
        score: null,
      };
      return NextResponse.json(payload);
    }

    // Final answer: score strictly server-side.
    const questions = await testQuestionsRepo.findByIds(
      client,
      state.questionIds,
    );
    if (questions.length !== total) {
      console.error(
        `test scoring: expected ${total} questions, got ${questions.length}`,
      );
      return serverError();
    }
    let correct = 0;
    for (const question of questions) {
      if (answers[question.id] === question.correct_index) correct += 1;
    }
    const score = Math.round((correct / total) * 100);

    await skillTestsRepo.insert(client, {
      talent_id: talent.id,
      direction: talent.direction,
      score,
      answers,
      passed_at: new Date().toISOString(),
    });
    await talentsRepo.setStatus(client, talent, "test_otgan", user.id, {
      bot_state: {},
    });

    const payload: TestAnswerResponse = {
      done: true,
      answeredCount,
      total,
      score,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/test/answer failed:", err);
    return serverError();
  }
}
