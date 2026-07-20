/**
 * Kontakt-unlock oqimini sinash: izlovchi (kompaniya) + non-demo verified talant.
 * JWT (izlovchi) + talantId chiqaradi. --clean bilan tozalaydi.
 */
import { auth, createServiceClient } from "@talantly/shared";
import { config } from "../config.js";

const db = createServiceClient(config.supabaseUrl, config.supabaseServiceRoleKey);
const SECRET = process.env.WEBAPP_JWT_SECRET ?? "";
const IZLOVCHI_TG = 999700111;
const TALANT_TG = 999700222;

async function clean(): Promise<void> {
  for (const tg of [IZLOVCHI_TG, TALANT_TG]) {
    const { data: u } = await db
      .from("users")
      .select("id")
      .eq("tg_id", tg)
      .maybeSingle();
    if (!u) continue;
    const uid = (u as { id: string }).id;
    const { data: comp } = await db
      .from("companies")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();
    if (comp) {
      const cid = (comp as { id: string }).id;
      await db.from("contact_unlocks").delete().eq("company_id", cid);
      await db.from("profile_views").delete().eq("viewer_company_id", cid);
      await db.from("companies").delete().eq("id", cid);
    }
    const { data: tal } = await db
      .from("talents")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();
    if (tal) {
      const tid = (tal as { id: string }).id;
      await db.from("skill_tests").delete().eq("talent_id", tid);
      await db.from("contact_unlocks").delete().eq("talent_id", tid);
      await db.from("profile_views").delete().eq("talent_id", tid);
      await db.from("talents").delete().eq("id", tid);
    }
    await db.from("users").delete().eq("id", uid);
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--clean")) {
    await clean();
    console.log("cleaned");
    return;
  }
  await clean();

  // Izlovchi (kompaniya) — tekshirilmagan, obunasiz.
  const { data: izU } = await db
    .from("users")
    .insert({ tg_id: IZLOVCHI_TG, preferred_mode: "izlovchi" })
    .select("id")
    .single();
  const izUid = (izU as { id: string }).id;
  await db.from("companies").insert({
    user_id: izUid,
    name: "Test Ish Beruvchi",
    is_verified: false,
    is_demo: false,
  });

  // Non-demo verified talant — kontakt bilan.
  const { data: talU } = await db
    .from("users")
    .insert({ tg_id: TALANT_TG, username: "aziz_dev", preferred_mode: "talant" })
    .select("id")
    .single();
  const talUid = (talU as { id: string }).id;
  const { data: tal } = await db
    .from("talents")
    .insert({
      user_id: talUid,
      full_name: "Aziz Karimov",
      direction: "dasturlash",
      level: "mutaxassis",
      district: "Chilonzor",
      skill_tags: ["Go", "PostgreSQL", "Docker"],
      free_text: "Backend muhandis, 3 yil tajriba.",
      salary_from: 12000000,
      portfolio_url: "https://github.com/aziz",
      status: "tekshirilgan",
      is_demo: false,
      verified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  const talId = (tal as { id: string }).id;
  await db.from("skill_tests").insert({
    talent_id: talId,
    direction: "dasturlash",
    score: 91,
    answers: {},
  });

  const token = await auth.signSession(
    { userId: izUid, tgId: IZLOVCHI_TG },
    SECRET,
  );
  console.log("TALANT_ID=" + talId);
  console.log("TOKEN=" + token);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
