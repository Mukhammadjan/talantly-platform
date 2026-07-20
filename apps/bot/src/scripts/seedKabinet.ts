/**
 * Kabinet web sahifasini sinash uchun test talant + profil + test + ariza seed
 * qiladi va JWT chiqaradi. Tekshiruvdan keyin cleanup uchun --clean bilan chaqiring.
 */
import { auth, createServiceClient } from "@talantly/shared";
import { config } from "../config.js";

const db = createServiceClient(config.supabaseUrl, config.supabaseServiceRoleKey);
const SECRET = process.env.WEBAPP_JWT_SECRET ?? "";
const TG_ID = 999600111;

async function clean(): Promise<void> {
  const { data: u } = await db
    .from("users")
    .select("id")
    .eq("tg_id", TG_ID)
    .maybeSingle();
  if (u) {
    const { data: t } = await db
      .from("talents")
      .select("id")
      .eq("user_id", (u as { id: string }).id)
      .maybeSingle();
    if (t) {
      const tid = (t as { id: string }).id;
      await db.from("requests").delete().eq("talent_id", tid);
      await db.from("skill_tests").delete().eq("talent_id", tid);
      await db.from("talents").delete().eq("id", tid);
    }
    await db.from("users").delete().eq("id", (u as { id: string }).id);
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--clean")) {
    await clean();
    console.log("cleaned");
    return;
  }
  await clean();

  const { data: user } = await db
    .from("users")
    .insert({ tg_id: TG_ID, preferred_mode: "talant" })
    .select("id")
    .single();
  const userId = (user as { id: string }).id;

  const { data: talent } = await db
    .from("talents")
    .insert({
      user_id: userId,
      full_name: "Sardor Rahimov",
      direction: "dasturlash",
      level: "intern",
      city: "Toshkent",
      skill_tags: ["React", "TypeScript", "Next.js"],
      free_text: "Frontend yo'nalishida o'sib borayotgan dasturchi.",
      status: "test_otgan",
      is_demo: false,
    })
    .select("id")
    .single();
  const talentId = (talent as { id: string }).id;

  await db.from("skill_tests").insert({
    talent_id: talentId,
    direction: "dasturlash",
    score: 85,
    answers: {},
  });

  // Demo vakansiyaga ariza (Frontend dasturchi — Novatech).
  const { data: vac } = await db
    .from("vacancies")
    .select("id, company_id")
    .eq("title", "Frontend dasturchi")
    .limit(1)
    .maybeSingle();
  if (vac) {
    const v = vac as { id: string; company_id: string };
    await db.from("requests").insert({
      kind: "talant_qiziqishi",
      talent_id: talentId,
      company_id: v.company_id,
      vacancy_id: v.id,
    });
  }

  const token = await auth.signSession({ userId, tgId: TG_ID }, SECRET);
  console.log("TOKEN=" + token);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
