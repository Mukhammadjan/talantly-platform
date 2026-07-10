import { InlineKeyboard } from "grammy";
import type { CallbackQueryContext, CommandContext, Context } from "grammy";
import type { InterviewRow, TalentRow, UserRow } from "@talantly/shared";
import { config } from "../config.js";
import * as interviewsRepo from "../db/interviewsRepo.js";
import * as skillTestsRepo from "../db/skillTestsRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import {
  BAHOLASH_DENIED,
  BAHOLASH_EMPTY,
  BAHOLASH_EXPIRED,
  BAHOLASH_LIST_HEADER,
  BAHOLASH_NOTES_PROMPT,
  baholashCandidateCard,
  baholashConfirmPrompt,
  baholashDoneModerator,
  formatDateTimeUz,
  rejectedMessage,
  verifiedCongrats,
} from "../text.js";

interface PendingReview {
  interviewId: string;
  talentName: string | null;
  rating: number;
  notes: string | null;
  stage: "notes" | "confirm";
}

// Moderator conversation state. In-memory is acceptable here: a restart just
// means the moderator re-runs /baholash (talent flow state, by contrast,
// must live in Supabase).
const pendingReviews = new Map<number, PendingReview>();

async function isModerator(tgId: number): Promise<boolean> {
  if (config.adminTgId && String(tgId) === config.adminTgId) return true;
  const user = await usersRepo.findByTgId(tgId);
  return user?.role === "moderator" || user?.role === "admin";
}

export async function handleBaholash(
  ctx: CommandContext<Context>,
): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  if (!(await isModerator(from.id))) {
    await ctx.reply(BAHOLASH_DENIED);
    return;
  }

  const interviews = await interviewsRepo.findUndecided();
  const items: { interview: InterviewRow; talent: TalentRow }[] = [];
  for (const interview of interviews) {
    if (!interview.talent_id) continue;
    const talent = await talentsRepo.findById(interview.talent_id);
    if (talent) items.push({ interview, talent });
  }

  if (items.length === 0) {
    await ctx.reply(BAHOLASH_EMPTY);
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const { interview, talent } of items) {
    const when = interview.scheduled_at
      ? formatDateTimeUz(interview.scheduled_at)
      : "vaqt yo'q";
    keyboard
      .text(
        `${talent.full_name ?? "Noma'lum"} — ${when}`,
        `bhl:pick:${interview.id}`,
      )
      .row();
  }
  await ctx.reply(BAHOLASH_LIST_HEADER, { reply_markup: keyboard });
}

function ratingKeyboard(interviewId: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (let rating = 1; rating <= 5; rating++) {
    keyboard.text(`${rating} ⭐`, `bhl:rate:${interviewId}:${rating}`);
  }
  return keyboard;
}

function confirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Tasdiqlash", "bhl:dec:approved")
    .text("❌ Rad etish", "bhl:dec:rejected");
}

async function loadInterviewContext(interviewId: string): Promise<{
  interview: InterviewRow;
  talent: TalentRow;
} | null> {
  const interview = await interviewsRepo.findById(interviewId);
  if (!interview || interview.decision !== null || !interview.talent_id) {
    return null;
  }
  const talent = await talentsRepo.findById(interview.talent_id);
  if (!talent) return null;
  return { interview, talent };
}

async function handlePick(
  ctx: CallbackQueryContext<Context>,
  interviewId: string,
): Promise<void> {
  const context = await loadInterviewContext(interviewId);
  if (!context) {
    await ctx.editMessageText(BAHOLASH_EXPIRED);
    return;
  }
  const { interview, talent } = context;
  const test = await skillTestsRepo.findByTalentId(talent.id);
  await ctx.editMessageText(
    baholashCandidateCard({
      fullName: talent.full_name,
      direction: talent.direction,
      score: test?.score ?? null,
      scheduledAt: interview.scheduled_at,
    }),
    { reply_markup: ratingKeyboard(interviewId) },
  );
}

async function handleRate(
  ctx: CallbackQueryContext<Context>,
  moderatorTgId: number,
  interviewId: string,
  rating: number,
): Promise<void> {
  const context = await loadInterviewContext(interviewId);
  if (!context) {
    await ctx.editMessageText(BAHOLASH_EXPIRED);
    return;
  }
  pendingReviews.set(moderatorTgId, {
    interviewId,
    talentName: context.talent.full_name,
    rating,
    notes: null,
    stage: "notes",
  });
  await ctx.editMessageText(BAHOLASH_NOTES_PROMPT, {
    reply_markup: new InlineKeyboard().text(
      "O'tkazib yuborish ➡️",
      "bhl:skipnotes",
    ),
  });
}

async function resolveModeratorUser(tgId: number): Promise<UserRow> {
  return usersRepo.upsertByTgId(tgId);
}

async function applyDecision(
  ctx: CallbackQueryContext<Context>,
  moderatorTgId: number,
  approved: boolean,
): Promise<void> {
  const pending = pendingReviews.get(moderatorTgId);
  if (!pending || pending.stage !== "confirm") {
    await ctx.editMessageText(BAHOLASH_EXPIRED);
    return;
  }
  const context = await loadInterviewContext(pending.interviewId);
  if (!context) {
    pendingReviews.delete(moderatorTgId);
    await ctx.editMessageText(BAHOLASH_EXPIRED);
    return;
  }
  const { talent } = context;
  const moderator = await resolveModeratorUser(moderatorTgId);

  await interviewsRepo.decide(pending.interviewId, {
    moderator_id: moderator.id,
    rating: pending.rating,
    notes: pending.notes,
    decision: approved ? "approved" : "rejected",
  });

  if (approved) {
    await talentsRepo.setStatus(talent, "tekshirilgan", moderator.id, {
      verified_at: new Date().toISOString(),
    });
  } else {
    await talentsRepo.setStatus(talent, "rad_etilgan", moderator.id);
  }

  pendingReviews.delete(moderatorTgId);
  await ctx.editMessageText(
    baholashDoneModerator({ fullName: talent.full_name, approved }),
  );

  const talentUser = talent.user_id
    ? await usersRepo.findById(talent.user_id)
    : null;
  if (talentUser?.tg_id) {
    await ctx.api.sendMessage(
      talentUser.tg_id,
      approved
        ? verifiedCongrats(talent.full_name)
        : rejectedMessage(talent.full_name),
    );
  }
}

export async function handleBaholashCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const from = ctx.from;
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();
  if (!(await isModerator(from.id))) return;

  const parts = data.split(":");
  const action = parts[1];

  if (action === "pick" && parts[2]) {
    await handlePick(ctx, parts[2]);
    return;
  }
  if (action === "rate" && parts[2] && parts[3]) {
    const rating = Number(parts[3]);
    if (rating >= 1 && rating <= 5) {
      await handleRate(ctx, from.id, parts[2], rating);
    }
    return;
  }
  if (action === "skipnotes") {
    const pending = pendingReviews.get(from.id);
    if (!pending || pending.stage !== "notes") {
      await ctx.editMessageText(BAHOLASH_EXPIRED);
      return;
    }
    pending.stage = "confirm";
    await ctx.editMessageText(
      baholashConfirmPrompt({
        fullName: pending.talentName,
        rating: pending.rating,
        notes: null,
      }),
      { reply_markup: confirmKeyboard() },
    );
    return;
  }
  if (action === "dec" && (parts[2] === "approved" || parts[2] === "rejected")) {
    await applyDecision(ctx, from.id, parts[2] === "approved");
  }
}

/** Captures the moderator's notes text; returns true when it consumed the message. */
export async function handleBaholashText(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  const text = ctx.message?.text;
  if (!from || !text) return false;
  const pending = pendingReviews.get(from.id);
  if (!pending || pending.stage !== "notes") return false;

  pending.notes = text.trim().slice(0, 500);
  pending.stage = "confirm";
  await ctx.reply(
    baholashConfirmPrompt({
      fullName: pending.talentName,
      rating: pending.rating,
      notes: pending.notes,
    }),
    { reply_markup: confirmKeyboard() },
  );
  return true;
}
