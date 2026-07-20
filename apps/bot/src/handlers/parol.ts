import { auth } from "@talantly/shared";
import { hashPassword, verifyPassword } from "@talantly/shared/auth/password";
import { type Context, Keyboard } from "grammy";
import { config } from "../config.js";
import * as authSessions from "../db/authSessionsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { logger } from "../logger.js";
import {
  PAROL_ASK_CONTACT,
  PAROL_ASK_FIRST,
  PAROL_ASK_FIRST_NEW,
  PAROL_ASK_SECOND,
  PAROL_BAD_PHONE,
  PAROL_CONTACT_BUTTON,
  PAROL_EMPTY,
  PAROL_FOREIGN_CONTACT,
  PAROL_MISMATCH,
  PAROL_PHONE_TAKEN,
  PAROL_TOO_SHORT,
  parolDone,
} from "../text.js";

// WEBAPP_URL ba'zan ?v=SHA (bot menu versioni) bilan keladi — /kirish'ni
// query'ga yopishtirmaslik uchun faqat toza origin olamiz. Kanonik brend
// domeni talantly.uz; env faqat talantly.uz origin bo'lsa ishlatiladi.
function loginUrl(): string {
  const raw = config.webappUrl;
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.hostname === "talantly.uz" || u.hostname.endsWith(".talantly.uz")) {
        return `${u.origin}/kirish`;
      }
    } catch {
      /* noto'g'ri URL — kanonik domenga tushamiz */
    }
  }
  return "https://talantly.uz/kirish";
}
const LOGIN_URL = loginUrl();

function contactKeyboard(): Keyboard {
  return new Keyboard()
    .requestContact(PAROL_CONTACT_BUTTON)
    .resized()
    .oneTime();
}

/** /parol — parol o'rnatish/yangilash oqimini boshlaydi. */
export async function handleParol(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await usersRepo.upsertByTgId(from.id);
  if (user.phone) {
    // Raqam allaqachon bor — to'g'ridan-to'g'ri yangi parol so'raladi.
    await authSessions.setSession(from.id, "pw1", {});
    await ctx.reply(PAROL_ASK_FIRST_NEW, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  await authSessions.setSession(from.id, "contact", {});
  await ctx.reply(PAROL_ASK_CONTACT, { reply_markup: contactKeyboard() });
}

/** Kontakt — faqat parol oqimida, faqat foydalanuvchining o'z raqami. */
export async function handleContact(ctx: Context): Promise<void> {
  const from = ctx.from;
  const contact = ctx.message?.contact;
  if (!from || !contact) return;

  const session = await authSessions.getSession(from.id);
  if (!session || session.step !== "contact") return;

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
  // Raqam boshqa akkauntga tegishli bo'lsa — to'sib qo'y.
  const existing = await usersRepo.findByPhone(phone);
  if (existing && existing.id !== user.id) {
    await authSessions.clearSession(from.id);
    await ctx.reply(PAROL_PHONE_TAKEN, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  await usersRepo.updateFields(user.id, { phone });
  await authSessions.setSession(from.id, "pw1", {});
  await ctx.reply(PAROL_ASK_FIRST, { reply_markup: { remove_keyboard: true } });
}

/**
 * Parol matnini qayta ishlaydi (parol oqimida bo'lsa true qaytaradi).
 * Har bir parol xabari DARHOL o'chiriladi — chatda ochiq parol qolmaydi.
 * Ochiq parol log'ga HECH QACHON yozilmaydi.
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
    // Birinchi parol darhol hash bo'ladi — ochiq matn sessiyaga tushmaydi.
    const hash = await hashPassword(text);
    await authSessions.setSession(from.id, "pw2", { hash });
    await ctx.reply(PAROL_ASK_SECOND);
    return true;
  }

  // step === "pw2": ikkinchi kiritishni birinchining hash'iga solishtiramiz.
  const hash = typeof session.data.hash === "string" ? session.data.hash : null;
  if (!hash) {
    await authSessions.setSession(from.id, "pw1", {});
    await ctx.reply(PAROL_ASK_FIRST_NEW);
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
  await ctx.reply(parolDone({ phone: user.phone ?? "", siteUrl: LOGIN_URL }));
  return true;
}
