import { InlineKeyboard } from "grammy";
import type { CallbackQueryContext, CommandContext, Context } from "grammy";
import { config } from "../config.js";
import { getSupabase } from "../db/client.js";
import * as usersRepo from "../db/usersRepo.js";
import { formatDateTimeUz } from "../text.js";

// Moderator to'lov tasdiqlash (D17): summa YOZUVDAN ko'rsatiladi (joriy
// settings emas) + "Bankda tekshirdim" majburiy qadam.

interface UnlockRow {
  id: string;
  company_id: string | null;
  talent_id: string | null;
  kind: string;
  amount: number;
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
  const { data } = await db
    .from("contact_unlocks")
    .select("id, company_id, talent_id, kind, amount, status, created_at")
    .eq("status", "kutilmoqda")
    .order("created_at", { ascending: true })
    .limit(10);
  const rows = (data ?? []) as UnlockRow[];

  if (rows.length === 0) {
    await ctx.reply("💳 Kutilayotgan to'lovlar yo'q.");
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const r of rows) {
    keyboard
      .text(
        `${r.amount.toLocaleString("ru-RU")} so'm · ${r.kind} · ${formatDateTimeUz(r.created_at)}`,
        `tlv:pick:${r.id}`,
      )
      .row();
  }
  await ctx.reply("💳 Kutilayotgan to'lovlar — birini tanlang:", {
    reply_markup: keyboard,
  });
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
