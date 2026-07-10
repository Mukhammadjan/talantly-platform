import {
  personalityQuestionsRepo,
  talentsRepo,
  type PersonalityQuestionRow,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import type {
  PersonalityQuestionPublic,
  PersonalityStartResponse,
} from "@/lib/apiTypes";
import {
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

/** Strips option weights — scoring data must never reach the client. */
function toPublic(question: PersonalityQuestionRow): PersonalityQuestionPublic {
  return {
    id: question.id,
    question: question.question,
    options: question.options.map((option) => option.label),
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

    if (talent.status === "yangi") {
      return conflict("Avval ro'yxatdan o'tishni yakunlang.");
    }

    if (talent.personality) {
      const payload: PersonalityStartResponse = {
        done: true,
        result: personalitySummary(talent),
        questions: [],
        answered: {},
      };
      return NextResponse.json(payload);
    }

    const active = await personalityQuestionsRepo.listActive(client);
    if (active.length === 0) {
      return serverError();
    }

    const inFlight = readPersonalityState(talent);
    if (inFlight) {
      const byId = new Map(active.map((q) => [q.id, q]));
      const ordered = inFlight.questionIds
        .map((id) => byId.get(id))
        .filter((q): q is PersonalityQuestionRow => Boolean(q));
      // The question bank changed mid-attempt — restart cleanly.
      if (ordered.length === inFlight.questionIds.length) {
        const payload: PersonalityStartResponse = {
          done: false,
          result: null,
          questions: ordered.map(toPublic),
          answered: inFlight.answers,
        };
        return NextResponse.json(payload);
      }
    }

    await talentsRepo.updateBotState(client, talent.id, {
      step: "personality",
      data: { questionIds: active.map((q) => q.id), answers: {} },
    });

    const payload: PersonalityStartResponse = {
      done: false,
      result: null,
      questions: active.map(toPublic),
      answered: {},
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/personality/start failed:", err);
    return serverError();
  }
}
