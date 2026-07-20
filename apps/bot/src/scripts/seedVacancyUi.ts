/**
 * UI ko'rigi uchun seed: ish beruvchi + 3 vakansiya + arizalar.
 * Chiqishda brauzer localStorage'ga qo'yiladigan token beriladi.
 *
 * Ishga tushirish: tsx apps/bot/src/scripts/seedVacancyUi.ts [--clean]
 */
import { auth, createServiceClient } from "@talantly/shared";
import { config } from "../config.js";

const OWNER_TG = 999920001;
const TALENT_TGS = [999920011, 999920012, 999920013];

const db = createServiceClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
);
const SECRET = process.env.WEBAPP_JWT_SECRET ?? "";

async function cleanup(): Promise<void> {
  const tgIds = [OWNER_TG, ...TALENT_TGS];
  const { data: users } = await db.from("users").select("id").in("tg_id", tgIds);
  const userIds = ((users ?? []) as { id: string }[]).map((u) => u.id);
  if (userIds.length === 0) return;

  const { data: comps } = await db
    .from("companies")
    .select("id")
    .in("user_id", userIds);
  const compIds = ((comps ?? []) as { id: string }[]).map((c) => c.id);
  const { data: tals } = await db
    .from("talents")
    .select("id")
    .in("user_id", userIds);
  const talIds = ((tals ?? []) as { id: string }[]).map((t) => t.id);

  if (compIds.length > 0) {
    const { data: vacs } = await db
      .from("vacancies")
      .select("id")
      .in("company_id", compIds);
    const vacIds = ((vacs ?? []) as { id: string }[]).map((v) => v.id);
    await db.from("requests").delete().in("company_id", compIds);
    if (vacIds.length > 0) {
      await db.from("status_log").delete().in("entity_id", vacIds);
      await db.from("vacancies").delete().in("id", vacIds);
    }
    await db.from("companies").delete().in("id", compIds);
  }
  if (talIds.length > 0) {
    await db.from("requests").delete().in("talent_id", talIds);
    await db.from("talents").delete().in("id", talIds);
  }
  await db.from("users").delete().in("id", userIds);
}

async function main(): Promise<void> {
  await cleanup();
  if (process.argv.includes("--clean")) {
    console.log("🧹 Tozalandi.");
    return;
  }

  const { data: ownerRow } = await db
    .from("users")
    .insert({ tg_id: OWNER_TG, preferred_mode: "izlovchi" })
    .select("id")
    .single();
  const ownerId = (ownerRow as { id: string }).id;

  const { data: comp } = await db
    .from("companies")
    .insert({
      user_id: ownerId,
      name: "Novatech Demo",
      activity_type: "IT",
      city: "Toshkent",
      district: "Yunusobod",
      is_verified: true,
    })
    .select("id")
    .single();
  const companyId = (comp as { id: string }).id;

  const vacancies = [
    {
      title: "Frontend dasturchi",
      direction: "dasturlash",
      level: "intern",
      salary_from: 4_000_000,
      salary_to: 8_000_000,
      city: "Toshkent",
      district: "Yunusobod",
      work_formats: ["masofaviy", "aralash"],
      description: "React bilan interfeys\nTypeScript bilishi shart",
      status: "faol",
    },
    {
      title: "UI/UX dizayner",
      direction: "dizayn",
      level: "mutaxassis",
      salary_from: 6_000_000,
      salary_to: null,
      city: "Toshkent",
      district: "Chilonzor",
      work_formats: ["ofis"],
      description: "Mahsulot dizayni",
      status: "yopilgan",
    },
    {
      title: "SMM mutaxassis",
      direction: "marketing",
      level: "ikkalasi",
      salary_from: null,
      salary_to: null,
      city: "Samarqand",
      district: "",
      work_formats: ["masofaviy"],
      description: "Kontent va targeting",
      status: "qoralama",
    },
  ];

  const { data: created } = await db
    .from("vacancies")
    .insert(vacancies.map((v) => ({ ...v, company_id: companyId, is_demo: false })))
    .select("id, title");
  const vacRows = (created ?? []) as { id: string; title: string }[];
  const frontend = vacRows.find((v) => v.title === "Frontend dasturchi");

  // 3 ta ariza — turli holatlarda.
  const names = ["Kamola Olimova", "Jasur Toshmatov", "Nilufar Saidova"];
  const statuses = ["yangi", "yangi", "boglanildi"];
  for (let i = 0; i < TALENT_TGS.length; i++) {
    const { data: u } = await db
      .from("users")
      .insert({ tg_id: TALENT_TGS[i], preferred_mode: "talant" })
      .select("id")
      .single();
    const { data: t } = await db
      .from("talents")
      .insert({
        user_id: (u as { id: string }).id,
        full_name: names[i],
        direction: "dasturlash",
        city: "Toshkent",
        status: i === 2 ? "yangi" : "tekshirilgan",
      })
      .select("id")
      .single();
    await db.from("requests").insert({
      kind: "talant_qiziqishi",
      company_id: companyId,
      talent_id: (t as { id: string }).id,
      vacancy_id: frontend?.id,
      status: statuses[i],
      note: i === 0 ? "React bilan 1 yillik pet-loyihalarim bor." : null,
    });
  }

  const token = await auth.signSession(
    { userId: ownerId, tgId: OWNER_TG },
    SECRET,
  );
  console.log("✅ Seed tayyor: Novatech Demo · 3 vakansiya · 3 ariza");
  console.log(`\nTOKEN=${token}`);
}

void main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
