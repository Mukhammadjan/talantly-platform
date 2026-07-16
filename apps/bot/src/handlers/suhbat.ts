import { InlineKeyboard, type Context } from "grammy";
import { config } from "../config.js";
import * as interviewSlotsRepo from "../db/interviewSlotsRepo.js";
import * as interviewsRepo from "../db/interviewsRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import { registerKeyboard } from "../keyboards.js";
import { logger } from "../logger.js";
import {
  MINI_APP_COMING_SOON,
  PROFILE_NOT_REGISTERED,
  PROFILE_REGISTER_HINT,
  SUHBAT_EMPTY,
  SUHBAT_INTRO,
  SUHBAT_TAKEN,
  adminNewInterview,
  statusRank,
  suhbatAlready,
  suhbatBooked,
  suhbatNotEligible,
  suhbatSlotLabel,
} from "../text.js";
import { loadTalentByTgId } from "./util.js";

const MAX_SLOTS = 8;

export async function handleSuhbat(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const talent = await loadTalentByTgId(from.id);
  if (!talent) {
    const keyboard = registerKeyboard();
    await ctx.reply(
      keyboard
        ? `${PROFILE_NOT_REGISTERED} ${PROFILE_REGISTER_HINT}`
        : `${PROFILE_NOT_REGISTERED} ${MINI_APP_COMING_SOON}`,
      keyboard ? { reply_markup: keyboard } : undefined,
    );
    return;
  }

  if (talent.status === "suhbat_belgilangan") {
    await ctx.reply(suhbatAlready(null));
    return;
  }
  if (statusRank(talent.status) < 3) {
    await ctx.reply(suhbatNotEligible(talent.status));
    return;
  }

  const slots = await interviewSlotsRepo.openFuture();
  if (slots.length === 0) {
    await ctx.reply(SUHBAT_EMPTY);
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const slot of slots.slice(0, MAX_SLOTS)) {
    keyboard.text(suhbatSlotLabel(slot.starts_at), `sbt:${slot.id}`).row();
  }
  await ctx.reply(SUHBAT_INTRO, { reply_markup: keyboard });
}

export async function handleSuhbatCallback(ctx: Context): Promise<void> {
  const from = ctx.from;
  const data = ctx.callbackQuery?.data;
  if (!from || !data) return;
  const slotId = data.slice("sbt:".length);

  const talent = await loadTalentByTgId(from.id);
  if (!talent) {
    await ctx.answerCallbackQuery({ text: "Avval ro'yxatdan o'ting." });
    return;
  }
  if (talent.status === "suhbat_belgilangan") {
    await ctx.answerCallbackQuery({ text: "Sizda allaqachon suhbat bor." });
    return;
  }

  // Race-safe: slot faqat bo'sh bo'lsa band qilinadi.
  const claimed = await interviewSlotsRepo.claim(slotId);
  if (!claimed) {
    await ctx.answerCallbackQuery({ text: "Bu vaqt band bo'ldi." });
    await ctx.reply(SUHBAT_TAKEN);
    return;
  }

  try {
    await interviewsRepo.insert({
      talent_id: talent.id,
      scheduled_at: claimed.starts_at,
    });
    await talentsRepo.setStatus(
      { id: talent.id, status: talent.status },
      "suhbat_belgilangan",
      `bot:${from.id}`,
    );
  } catch (err) {
    logger.error({ err }, "suhbat booking failed after claim");
    await ctx.answerCallbackQuery({ text: "Xatolik. Qayta urinib ko'ring." });
    return;
  }

  await ctx.answerCallbackQuery({ text: "Band qilindi ✅" });
  await ctx.editMessageText(suhbatBooked(claimed.starts_at));

  if (config.adminTgId) {
    try {
      await ctx.api.sendMessage(
        Number(config.adminTgId),
        adminNewInterview({
          fullName: talent.full_name,
          scheduledAt: claimed.starts_at,
        }),
      );
    } catch (err) {
      logger.error({ err }, "admin interview notify failed");
    }
  }
}
