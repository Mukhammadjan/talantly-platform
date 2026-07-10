import { talentsRepo, usersRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import { badRequest, serverError, unauthorized } from "@/lib/server/auth";
import { serverEnv } from "@/lib/server/env";
import { verifyInitData } from "@/lib/server/initData";
import { signSession } from "@/lib/server/jwt";
import { buildSnapshot } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null);
    const initData =
      body && typeof body === "object"
        ? (body as { initData?: unknown }).initData
        : undefined;
    if (typeof initData !== "string" || initData.length === 0) {
      return badRequest("initData yuborilmadi.");
    }

    const valid = verifyInitData(initData, serverEnv.botToken);
    if (!valid) return unauthorized();

    const client = getSupabase();
    let user = await usersRepo.upsertByTgId(client, valid.user.id);
    const username = valid.user.username ?? null;
    if (username && user.tg_username !== username) {
      user = await usersRepo.updateFields(client, user.id, {
        tg_username: username,
      });
    }
    let talent = await talentsRepo.findByUserId(client, user.id);
    if (!talent) {
      talent = await talentsRepo.createForUser(client, user.id);
    }

    const token = await signSession(
      { userId: user.id, talentId: talent.id, tgId: valid.user.id },
      serverEnv.jwtSecret,
    );
    const snapshot = await buildSnapshot(client, user, talent);
    return NextResponse.json({ token, snapshot });
  } catch (err) {
    console.error("POST /api/auth/validate failed:", err);
    return serverError();
  }
}
