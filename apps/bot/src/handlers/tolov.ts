import type { Context } from "grammy";
import { config } from "../config.js";
import * as talentsRepo from "../db/talentsRepo.js";
import { registerKeyboard } from "../keyboards.js";
import { logger } from "../logger.js";
import {
  MINI_APP_COMING_SOON,
  PROFILE_NOT_REGISTERED,
  PROFILE_REGISTER_HINT,
  TOLOV_PHOTO_RECEIVED,
  adminPaymentScreenshot,
  statusRank,
  tolovInfo,
} from "../text.js";
import { loadTalentByTgId } from "./util.js";

export async function handleTolov(ctx: Context): Promise<void> {
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

  await ctx.reply(
    tolovInfo({
      card: config.paymentCardNumber,
      owner: config.paymentCardOwner,
      status: talent.status,
    }),
  );
}

/**
 * To'lov cheki (rasm) — faqat to'lovgacha bo'lgan talant uchun.
 * Adminга yuboriladi va holat "tolov_kutilmoqda"ga o'tadi.
 * Handled bo'lsa true qaytaradi.
 */
export async function handlePaymentPhoto(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  const photo = ctx.message?.photo;
  if (!from || !photo || !ctx.chat || ctx.message?.message_id === undefined) {
    return false;
  }

  const talent = await loadTalentByTgId(from.id);
  if (!talent) return false;
  // Faqat to'lov bosqichigacha — verified/CV bosqichidagi rasmlarni tegmaymiz.
  if (statusRank(talent.status) >= 2) return false;

  if (talent.status !== "tolov_kutilmoqda") {
    try {
      await talentsRepo.setStatus(
        { id: talent.id, status: talent.status },
        "tolov_kutilmoqda",
        `bot:${from.id}`,
      );
    } catch (err) {
      logger.error({ err }, "payment status update failed");
    }
  }

  if (config.adminTgId) {
    try {
      await ctx.api.copyMessage(
        Number(config.adminTgId),
        ctx.chat.id,
        ctx.message.message_id,
      );
      await ctx.api.sendMessage(
        Number(config.adminTgId),
        adminPaymentScreenshot({ fullName: talent.full_name, tgId: from.id }),
      );
    } catch (err) {
      logger.error({ err }, "payment screenshot forward failed");
    }
  }

  await ctx.reply(TOLOV_PHOTO_RECEIVED);
  return true;
}
