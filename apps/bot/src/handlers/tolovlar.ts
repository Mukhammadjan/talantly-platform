import { InlineKeyboard } from "grammy";
import type { CallbackQueryContext, CommandContext, Context } from "grammy";
import { generateCv } from "@talantly/shared";
import { config } from "../config.js";
import { getSupabase } from "../db/client.js";
import * as cvProfilesRepo from "../db/cvProfilesRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { logger } from "../logger.js";
import { formatDateTimeUz } from "../text.js";

// Moderator to'lov tasdiqlash (D17): summa YOZUVDAN ko'rsatiladi (joriy
// settings emas) + "Bankda tekshirdim" majburiy qadam.
// Ikki tur: kontakt ochish (contact_unlocks, tlv:) va talant AI CV
// to'lovi (payments, pay:) — Mini App'dan chek screenshot bilan keladi.

interface UnlockRow {
  id: string;
  company_id: string | null;
  talent_id: string | null;
  kind: string;
  amount: number;
  status: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  talent_id: string | null;
  amount: number;
  screenshot_path: string | null;
  status: string;
  created_at: string;
}

// Ikki bosqichli tasdiq: avval "bankda tekshirdim" bosiladi.
const bankChecked = new Set<string>();

async function isModerator(tgId: number): Promise<boolean> {
  if (config.adminTgId && String(tgId) === config.adminTgId) return true;
  const user = await usersRepo.findByTgId(tgId);
  return user?.role === "moderator" || user?.role === "admin";
}

export async function handleTolovlar(
  ctx: CommandContext<Context>,
): Promise<void> {
  const from = ctx.from;
  if (!from || !(await isModerator(from.id))) {
    await ctx.reply("Bu buyruq faqat moderatorlar uchun.");
    return;
  }

  const db = getSupabase();
  const [{ data: unlockData }, { data: payData }] = await Promise.all([
    db
      .from("contact_unlocks")
      .select("id, company_id, talent_id, kind, amount, status, created_at")
      .eq("status", "kutilmoqda")
      .order("created_at", { ascending: true })
      .limit(10),
    db
      .from("payments")
      .select("id, talent_id, amount, screenshot_path, status, created_at")
      .eq("status", "kutilmoqda")
      .order("created_at", { ascending: true })
      .limit(10),
  ]);
  const rows = (unlockData ?? []) as UnlockRow[];
  const payments = (payData ?? []) as PaymentRow[];

  if (rows.length === 0 && payments.length === 0) {
    await ctx.reply("💳 Kutilayotgan to'lovlar yo'q.");
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const p of payments) {
    const talent = p.talent_id ? await talentsRepo.findById(p.talent_id) : null;
    keyboard
      .text(
        `🧑 CV · ${talent?.full_name ?? "?"} · ${p.amount.toLocaleString("ru-RU")} so'm`,
        `pay:pick:${p.id}`,
      )
      .row();
  }
  for (const r of rows) {
    keyboard
      .text(
        `🏢 ${r.amount.toLocaleString("ru-RU")} so'm · ${r.kind} · ${formatDateTimeUz(r.created_at)}`,
        `tlv:pick:${r.id}`,
      )
      .row();
  }
  await ctx.reply("💳 Kutilayotgan to'lovlar — birini tanlang:", {
    reply_markup: keyboard,
  });
}

/** Mini App'dan kelgan AI CV to'lovi (payments jadvali) — pay: callbacklari. */
export async function handlePayCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const from = ctx.from;
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();
  if (!(await isModerator(from.id))) return;

  const [, action, id] = data.split(":");
  if (!id) return;
  const db = getSupabase();

  const { data: row } = await db
    .from("payments")
    .select("id, talent_id, amount, screenshot_path, status, created_at")
    .eq("id", id)
    .maybeSingle();
  const payment = row as PaymentRow | null;
  if (!payment || payment.status !== "kutilmoqda") {
    await ctx.editMessageText("Bu to'lov allaqachon ko'rib chiqilgan.");
    return;
  }
  const talent = payment.talent_id
    ? await talentsRepo.findById(payment.talent_id)
    : null;
  if (!talent) {
    await ctx.editMessageText("Talant topilmadi.");
    return;
  }

  if (action === "pick") {
    bankChecked.delete(`pay:${id}`);
    // Chek screenshot'i — imzolangan URL orqali rasm sifatida.
    if (payment.screenshot_path) {
      const { data: signed } = await db.storage
        .from("payment-screenshots")
        .createSignedUrl(payment.screenshot_path, 3600);
      if (signed?.signedUrl) {
        try {
          await ctx.api.sendPhoto(from.id, signed.signedUrl, {
            caption: `Chek: ${talent.full_name ?? "?"}`,
          });
        } catch (err) {
          logger.error({ err }, "payment screenshot send failed");
        }
      }
    }
    await ctx.reply(
      `🧑 AI CV to'lovi\n\n` +
        `Talant: ${talent.full_name ?? "?"}\n` +
        `Summa (yozuvdagi): ${payment.amount.toLocaleString("ru-RU")} so'm\n` +
        `Sana: ${formatDateTimeUz(payment.created_at)}\n\n` +
        `⚠️ Avval bank kirimini shu summa bilan solishtiring.`,
      {
        reply_markup: new InlineKeyboard()
          .text("☑️ Bankda tekshirdim", `pay:chk:${id}`)
          .row()
          .text("❌ Rad etish", `pay:rej:${id}`),
      },
    );
    return;
  }

  if (action === "chk") {
    bankChecked.add(`pay:${id}`);
    await ctx.editMessageText(
      `✅ Bank tekshiruvi belgilandi.\n\n` +
        `${talent.full_name ?? "?"} · ${payment.amount.toLocaleString("ru-RU")} so'm — tasdiqlaysizmi?`,
      {
        reply_markup: new InlineKeyboard()
          .text("✅ Tasdiqlash", `pay:ok:${id}`)
          .text("❌ Rad etish", `pay:rej:${id}`),
      },
    );
    return;
  }

  if (action === "ok") {
    if (!bankChecked.has(`pay:${id}`)) {
      await ctx.editMessageText(
        'Avval "Bankda tekshirdim" bosilishi shart. /tolovlar dan qayta boshlang.',
      );
      return;
    }
    await db.from("payments").update({ status: "tasdiqlangan" }).eq("id", id);
    await db.from("status_log").insert({
      entity: "payments",
      entity_id: id,
      old_status: "kutilmoqda",
      new_status: "tasdiqlangan",
      changed_by: `mod:${from.id}`,
    });
    // Holat mashinasi: tolov_kutilmoqda → tolov_tasdiqlangan (push talantga boradi).
    await talentsRepo.applyEvent(
      { id: talent.id, status: talent.status },
      "tolov_tasdiqlandi",
      `mod:${from.id}`,
    );
    // AI CV: mavjud bo'lmasa yaratiladi — pdfWorker PDF qilib yuboradi va
    // holатni cv_tayyor'ga o'tkazadi.
    const existingCv = await cvProfilesRepo.findByTalentId(talent.id);
    if (!existingCv) {
      const cv = generateCv({
        fullName: talent.full_name ?? "",
        birthYear: talent.birth_year ?? 0,
        city: talent.city ?? "",
        direction: talent.direction ?? "boshqa",
        education: talent.education ?? "",
        freeText: talent.free_text ?? "",
        portfolioUrl: talent.portfolio_url,
      });
      await cvProfilesRepo.upsertByTalentId({
        talent_id: talent.id,
        summary: cv.summary,
        skills: cv.skills,
        experience: cv.experience,
        ai_verdict: cv.aiVerdict,
        pdf_path: null,
        generated_at: new Date().toISOString(),
      });
    }
    bankChecked.delete(`pay:${id}`);
    await ctx.editMessageText(
      `✅ To'lov tasdiqlandi — ${talent.full_name ?? "?"}ga xabar boradi, AI CV tayyorlanmoqda.`,
    );
    return;
  }

  if (action === "rej") {
    await db.from("payments").update({ status: "rad" }).eq("id", id);
    await db.from("status_log").insert({
      entity: "payments",
      entity_id: id,
      old_status: "kutilmoqda",
      new_status: "rad",
      changed_by: `mod:${from.id}`,
    });
    // malumot_toldirilgan'ga qaytadi — talant chekni qayta yuborishi mumkin.
    // Talant xabari pushWorker'dan boradi (payments rad) — dubl bo'lmasin.
    await talentsRepo.applyEvent(
      { id: talent.id, status: talent.status },
      "tolov_rad",
      `mod:${from.id}`,
    );
    bankChecked.delete(`pay:${id}`);
    await ctx.editMessageText("❌ To'lov rad etildi — talantga xabar yuborildi.");
  }
}

export async function handleTolovlarCallback(
  ctx: CallbackQueryContext<Context>,
): Promise<void> {
  const from = ctx.from;
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();
  if (!(await isModerator(from.id))) return;

  const [, action, id] = data.split(":");
  if (!id) return;
  const db = getSupabase();

  const { data: row } = await db
    .from("contact_unlocks")
    .select("id, kind, amount, status, created_at, company_id")
    .eq("id", id)
    .maybeSingle();
  const unlock = row as UnlockRow | null;
  if (!unlock || unlock.status !== "kutilmoqda") {
    await ctx.editMessageText("Bu to'lov allaqachon ko'rib chiqilgan.");
    return;
  }

  if (action === "pick") {
    bankChecked.delete(id);
    await ctx.editMessageText(
      `💳 To'lov tafsiloti\n\n` +
        `Summa (yozuvdagi): ${unlock.amount.toLocaleString("ru-RU")} so'm\n` +
        `Turi: ${unlock.kind}\n` +
        `Sana: ${formatDateTimeUz(unlock.created_at)}\n\n` +
        `⚠️ Avval bank kirimini shu summa bilan solishtiring.`,
      {
        reply_markup: new InlineKeyboard()
          .text("☑️ Bankda tekshirdim", `tlv:chk:${id}`)
          .row()
          .text("❌ Rad etish", `tlv:rej:${id}`),
      },
    );
    return;
  }

  if (action === "chk") {
    bankChecked.add(id);
    await ctx.editMessageText(
      `✅ Bank tekshiruvi belgilandi.\n\n` +
        `Summa: ${unlock.amount.toLocaleString("ru-RU")} so'm — tasdiqlaysizmi?`,
      {
        reply_markup: new InlineKeyboard()
          .text("✅ Tasdiqlash", `tlv:ok:${id}`)
          .text("❌ Rad etish", `tlv:rej:${id}`),
      },
    );
    return;
  }

  if (action === "ok") {
    if (!bankChecked.has(id)) {
      await ctx.editMessageText(
        "Avval \"Bankda tekshirdim\" bosilishi shart. /tolovlar dan qayta boshlang.",
      );
      return;
    }
    const expires =
      unlock.kind === "obuna"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;
    await db
      .from("contact_unlocks")
      .update({ status: "tasdiqlangan", expires_at: expires })
      .eq("id", id);
    await db.from("status_log").insert({
      entity: "contact_unlocks",
      entity_id: id,
      old_status: "kutilmoqda",
      new_status: "tasdiqlangan",
      changed_by: `mod:${from.id}`,
    });
    bankChecked.delete(id);
    await ctx.editMessageText("✅ To'lov tasdiqlandi — kompaniyaga xabar yuboriladi.");
    return;
  }

  if (action === "rej") {
    await db.from("contact_unlocks").update({ status: "rad" }).eq("id", id);
    await db.from("status_log").insert({
      entity: "contact_unlocks",
      entity_id: id,
      old_status: "kutilmoqda",
      new_status: "rad",
      changed_by: `mod:${from.id}`,
    });
    bankChecked.delete(id);
    await ctx.editMessageText("❌ To'lov rad etildi — kompaniyaga sabab yuboriladi.");
  }
}
