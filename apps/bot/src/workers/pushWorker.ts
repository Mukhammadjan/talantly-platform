import { InlineKeyboard, type Bot } from "grammy";
import { config } from "../config.js";
import { getSupabase } from "../db/client.js";
import { logger } from "../logger.js";

// status_log yozilganda push (spec §7). Idempotent: notified flag.
const INTERVAL_MS = 30_000;
const BATCH = 20;

const TALENT_STATUS_TEXT: Record<string, string> = {
  malumot_toldirilgan:
    "📝 Profilingiz to'ldirildi! Keyingi qadam — xarakter testi. Ilovani ochib davom eting.",
  tolov_kutilmoqda:
    "⏳ To'lov chekingiz qabul qilindi — moderator 24 soat ichida tasdiqlaydi.",
  tolov_tasdiqlangan:
    "💳 To'lovingiz tasdiqlandi! AI professional CV'ingiz tayyorlanmoqda. ✨",
  cv_tayyor:
    "📄 AI CV'ingiz tayyor! Endi yo'nalishingiz bo'yicha ko'nikma testidan o'ting.",
  test_otgan:
    "🧠 Testdan muvaffaqiyatli o'tdingiz! Endi suhbat vaqtini tanlang — yakuniy bosqich.",
  suhbat_belgilangan:
    "📅 Suhbatingiz belgilandi. Boshlanishidan 1 soat oldin eslatma yuboramiz.",
  tekshirilgan:
    "🎉 Tabriklaymiz! Siz tekshiruvdan o'tdingiz va yashil ✅ \"Tekshirilgan\" belgisini qo'lga kiritdingiz. Endi profilingiz ishonchli kompaniyalarga tavsiya etiladi!",
  rad_etilgan:
    "😔 Afsuski, bu safar profil tasdiqlanmadi. 30 kundan so'ng qayta urinishingiz mumkin — sizga ishonamiz! 💪",
};

interface LogRow {
  id: string;
  entity: string;
  entity_id: string;
  new_status: string;
}

function appKeyboard(): InlineKeyboard | undefined {
  return config.webappUrl
    ? new InlineKeyboard().webApp("📲 Ilovani ochish", config.webappUrl)
    : undefined;
}

async function tgIdForTalent(talentId: string): Promise<number | null> {
  const db = getSupabase();
  const { data: talent } = await db
    .from("talents")
    .select("user_id, is_demo")
    .eq("id", talentId)
    .maybeSingle();
  const t = talent as { user_id: string | null; is_demo: boolean } | null;
  if (!t?.user_id || t.is_demo) return null;
  const { data: user } = await db
    .from("users")
    .select("tg_id, is_blocked_bot")
    .eq("id", t.user_id)
    .maybeSingle();
  const u = user as { tg_id: number; is_blocked_bot: boolean } | null;
  return u && !u.is_blocked_bot ? u.tg_id : null;
}

async function tgIdForCompany(companyId: string): Promise<number | null> {
  const db = getSupabase();
  const { data: company } = await db
    .from("companies")
    .select("user_id, is_demo")
    .eq("id", companyId)
    .maybeSingle();
  const c = company as { user_id: string | null; is_demo: boolean } | null;
  if (!c?.user_id || c.is_demo) return null;
  const { data: user } = await db
    .from("users")
    .select("tg_id, is_blocked_bot")
    .eq("id", c.user_id)
    .maybeSingle();
  const u = user as { tg_id: number; is_blocked_bot: boolean } | null;
  return u && !u.is_blocked_bot ? u.tg_id : null;
}

/** 403 (bot bloklangan) → users.is_blocked = true. */
async function sendSafe(
  bot: Bot,
  tgId: number,
  text: string,
): Promise<void> {
  try {
    const kb = appKeyboard();
    await bot.api.sendMessage(tgId, text, kb ? { reply_markup: kb } : undefined);
  } catch (err) {
    const code = (err as { error_code?: number }).error_code;
    if (code === 403) {
      // Bot bloklandi — faqat push to'xtaydi, API kirish saqlanadi (H29).
      await getSupabase()
        .from("users")
        .update({ is_blocked_bot: true })
        .eq("tg_id", tgId);
      logger.info({ tgId }, "push: user blocked bot, flagged");
    } else {
      logger.error({ err, tgId }, "push: send failed");
    }
  }
}

async function handleRow(bot: Bot, row: LogRow): Promise<void> {
  if (row.entity === "talents") {
    const text = TALENT_STATUS_TEXT[row.new_status];
    if (!text) return;
    const tgId = await tgIdForTalent(row.entity_id);
    if (tgId) await sendSafe(bot, tgId, text);
    // Yangi chek keldi — moderator /tolovlar bilan tekshiradi.
    if (row.new_status === "tolov_kutilmoqda" && config.adminTgId) {
      await sendSafe(
        bot,
        Number(config.adminTgId),
        "💳 Yangi AI CV to'lov cheki keldi — /tolovlar bilan tekshiring.",
      );
    }
    return;
  }

  // Suhbat hodisalari (C10/C11/H28)
  if (row.entity === "interviews") {
    const db = getSupabase();
    const { data } = await db
      .from("interviews")
      .select("talent_id")
      .eq("id", row.entity_id)
      .maybeSingle();
    const talentId = (data as { talent_id: string | null } | null)?.talent_id;
    if (!talentId) return;
    const tgId = await tgIdForTalent(talentId);
    if (!tgId) return;
    if (row.new_status === "kelmadi") {
      await sendSafe(
        bot,
        tgId,
        "😔 Suhbatga kela olmadingiz. Yangi qulay vaqtni tanlab, qayta band qiling — sizni kutamiz!",
      );
    } else if (row.new_status === "bekor") {
      await sendSafe(
        bot,
        tgId,
        "✅ Suhbatingiz bekor qilindi, slot bo'shatildi. Istalgan payt yangi vaqt tanlashingiz mumkin.",
      );
    }
    return;
  }

  // Kontakt to'lovi holatlari (D16)
  if (row.entity === "contact_unlocks") {
    const db = getSupabase();
    const { data } = await db
      .from("contact_unlocks")
      .select("company_id, amount")
      .eq("id", row.entity_id)
      .maybeSingle();
    const u = data as { company_id: string | null; amount: number } | null;
    if (!u?.company_id) return;
    const tgId = await tgIdForCompany(u.company_id);
    if (!tgId) return;
    if (row.new_status === "tasdiqlangan") {
      await sendSafe(
        bot,
        tgId,
        "✅ To'lovingiz tasdiqlandi! Nomzod kontakti ochildi — ilovadan ko'ring.",
      );
    } else if (row.new_status === "rad") {
      await sendSafe(
        bot,
        tgId,
        "❌ To'lov cheki tasdiqlanmadi (summa mos kelmadi yoki chek o'qilmadi). Moderator bilan bog'laning: /yordam",
      );
    }
    return;
  }

  // Shikoyat -> admin navbati (F23)
  if (row.entity === "complaints" && config.adminTgId) {
    await sendSafe(
      bot,
      Number(config.adminTgId),
      "⚠️ Yangi shikoyat keldi — ko'rib chiqing.",
    );
    return;
  }

  if (row.entity === "requests" && row.new_status === "yangi") {
    const db = getSupabase();
    const { data } = await db
      .from("requests")
      .select("kind, talent_id, company_id")
      .eq("id", row.entity_id)
      .maybeSingle();
    const req = data as {
      kind: string;
      talent_id: string | null;
      company_id: string | null;
    } | null;
    if (!req) return;

    if (req.kind === "kompaniya_sorovi" && req.talent_id) {
      const tgId = await tgIdForTalent(req.talent_id);
      if (tgId) {
        await sendSafe(
          bot,
          tgId,
          "🏢 Ajoyib yangilik! Kompaniya profilingiz bilan qiziqdi va so'rov yubordi. Tez orada siz bilan bog'lanishadi.",
        );
      }
    } else if (req.kind === "talant_qiziqishi" && req.company_id) {
      const tgId = await tgIdForCompany(req.company_id);
      if (tgId) {
        await sendSafe(
          bot,
          tgId,
          "📥 Vakansiyangizga yangi ariza keldi! Ilovadan nomzodni ko'rib chiqing.",
        );
      }
    }
    // Admin xabardor bo'ladi
    if (config.adminTgId) {
      await sendSafe(bot, Number(config.adminTgId), "🆕 Yangi so'rov keldi (requests).");
    }
  }
}

async function processOnce(bot: Bot): Promise<void> {
  const db = getSupabase();
  const { data, error } = await db
    .from("status_log")
    .select("id, entity, entity_id, new_status")
    .eq("notified", false)
    .order("created_at", { ascending: true })
    .limit(BATCH);
  if (error) {
    logger.error({ error }, "push: status_log read failed");
    return;
  }

  for (const row of (data ?? []) as LogRow[]) {
    try {
      await handleRow(bot, row);
    } catch (err) {
      logger.error({ err, rowId: row.id }, "push: handle failed");
    }
    // Idempotent: har holatda belgilanadi — loop bo'lmaydi.
    await db.from("status_log").update({ notified: true }).eq("id", row.id);
  }
}

export function startPushWorker(bot: Bot): () => void {
  const timer = setInterval(() => {
    processOnce(bot).catch((err) =>
      logger.error({ err }, "push worker tick failed"),
    );
  }, INTERVAL_MS);
  logger.info(`Push worker started (har ${INTERVAL_MS / 1000}s).`);
  return () => clearInterval(timer);
}
