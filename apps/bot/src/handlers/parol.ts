import { auth } from "@talantly/shared";
import { hashPassword, verifyPassword } from "@talantly/shared/auth/password";
import { type Context, Keyboard } from "grammy";
import * as authSessions from "../db/authSessionsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { registeredKeyboard } from "../keyboards.js";
import { logger } from "../logger.js";
import {
  PAROL_ASK_FIRST,
  PAROL_ASK_SECOND,
  PAROL_BAD_PHONE,
  PAROL_CONTACT_BUTTON,
  PAROL_EMPTY,
  PAROL_FOREIGN_CONTACT,
  PAROL_MISMATCH,
  PAROL_PHONE_TAKEN,
  PAROL_TOO_SHORT,
  PWD_CONTACT_FIRST,
  REG_CONTACT_PROMPT,
  REGISTERED_MSG,
  parolDone,
} from "../text.js";

function contactKeyboard(): Keyboard {
  return new Keyboard()
    .requestContact(PAROL_CONTACT_BUTTON)
    .resized()
    .oneTime();
}

// ==== Level 1: Ro'yxat (rol → raqam). Parol SO'RALMAYDI. ====

/** Rol tanlangach — raqam so'raladi (reg_contact bosqichi). */
export async function handleRoleChoice(
  ctx: Context,
  role: "talant" | "izlovchi",
): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const user = await usersRepo.upsertByTgId(from.id);
  await usersRepo.updateFields(user.id, { preferred_mode: role });
  await authSessions.setSession(from.id, "reg_contact", { role });
  await ctx.reply(REG_CONTACT_PROMPT, { reply_markup: contactKeyboard() });
}

/**
 * Kontakt — ro'yxat (reg_contact) YOKI parol oqimi (pwd_contact) uchun.
 * Faqat foydalanuvchining o'z raqami qabul qilinadi.
 */
export async function handleContact(ctx: Context): Promise<void> {
  const from = ctx.from;
  const contact = ctx.message?.contact;
  if (!from || !contact) return;

  const session = await authSessions.getSession(from.id);
  if (!session || (session.step !== "reg_contact" && session.step !== "pwd_contact")) {
    return;
  }

  // Begona/ulashilgan kontakt — rad et.
  if (contact.user_id !== from.id) {
    await ctx.reply(PAROL_FOREIGN_CONTACT, { reply_markup: contactKeyboard() });
    return;
  }

  const phone = auth.normalizePhone(contact.phone_number);
  if (!phone) {
    await ctx.reply(PAROL_BAD_PHONE, { reply_markup: contactKeyboard() });
    return;
  }

  const user = await usersRepo.upsertByTgId(from.id);
  const existing = await usersRepo.findByPhone(phone);
  if (existing && existing.id !== user.id) {
    await authSessions.clearSession(from.id);
    await ctx.reply(PAROL_PHONE_TAKEN, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }
  await usersRepo.updateFields(user.id, { phone });

  if (session.step === "reg_contact") {
    // Ro'yxat TUGADI — parol so'ralmaydi. Mini App + Login-parol tugmasi.
    const role =
      typeof session.data.role === "string" ? session.data.role : "talant";
    await authSessions.clearSession(from.id);
    await ctx.reply(REGISTERED_MSG, { reply_markup: registeredKeyboard(role) });
    return;
  }

  // pwd_contact: raqamsiz eski user /parol bosdi — endi parol so'raymiz.
  await authSessions.setSession(from.id, "pw1", {});
  await ctx.reply(PAROL_ASK_FIRST, { reply_markup: { remove_keyboard: true } });
}

// ==== Level 2: Login-parol (ixtiyoriy — «🔑 Login-parol olish» yoki /parol). ====

/** Parol oqimini boshlaydi. Raqam bo'lsa darhol parol, aks holda raqam so'raladi. */
export async function handleParol(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const user = await usersRepo.upsertByTgId(from.id);
  if (user.phone) {
    await authSessions.setSession(from.id, "pw1", {});
    await ctx.reply(PAROL_ASK_FIRST, { reply_markup: { remove_keyboard: true } });
    return;
  }
  await authSessions.setSession(from.id, "pwd_contact", {});
  await ctx.reply(PWD_CONTACT_FIRST, { reply_markup: contactKeyboard() });
}

/**
 * Parol matnini qayta ishlaydi (pw1/pw2 bosqichida bo'lsa true).
 * Har bir parol xabari DARHOL o'chiriladi — ochiq parol chatda/log'da qolmaydi.
 */
export async function handleParolText(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  const text = ctx.message?.text;
  if (!from || text === undefined) return false;

  const session = await authSessions.getSession(from.id);
  if (!session || (session.step !== "pw1" && session.step !== "pw2")) {
    return false;
  }

  // Xavfsizlik: parol xabarini darhol o'chiramiz (validatsiyadan oldin).
  if (ctx.chat && ctx.message?.message_id !== undefined) {
    try {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
    } catch (err) {
      logger.warn({ err }, "parol xabarini o'chirib bo'lmadi");
    }
  }

  if (session.step === "pw1") {
    const check = auth.validatePasswordStrength(text);
    if (!check.ok) {
      await ctx.reply(check.reason === "empty" ? PAROL_EMPTY : PAROL_TOO_SHORT);
      return true;
    }
    const hash = await hashPassword(text);
    await authSessions.setSession(from.id, "pw2", { hash });
    await ctx.reply(PAROL_ASK_SECOND);
    return true;
  }

  // step === "pw2": ikkinchi kiritishni birinchining hash'iga solishtiramiz.
  const hash = typeof session.data.hash === "string" ? session.data.hash : null;
  if (!hash) {
    await authSessions.setSession(from.id, "pw1", {});
    await ctx.reply(PAROL_ASK_FIRST);
    return true;
  }

  const matches = await verifyPassword(hash, text);
  if (!matches) {
    await authSessions.setSession(from.id, "pw1", {});
    await ctx.reply(PAROL_MISMATCH);
    return true;
  }

  const user = await usersRepo.findByTgId(from.id);
  if (!user) {
    await authSessions.clearSession(from.id);
    return true;
  }
  await usersRepo.updateFields(user.id, {
    password_hash: hash,
    password_set_at: new Date().toISOString(),
  });
  await authSessions.clearSession(from.id);
  await ctx.reply(parolDone(user.phone ?? ""));
  return true;
}
