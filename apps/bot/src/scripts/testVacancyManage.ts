/**
 * Web vakansiya boshqaruvi — E2E (dev server 3001'ga real HTTP).
 * Isbotlaydi: yaratish · o'z ro'yxatida ko'rinish · tahrir · yopish/faollashtirish ·
 * obunasiz 1 ta faol limiti · begona vakansiyaga 403 · arizalar ro'yxati va
 * ariza holatini o'zgartirish · status_log yozuvlari.
 *
 * Shart: `npm run dev:webapp` (yoki preview) 3001'da ishlab tursin.
 * Ishga tushirish: tsx apps/bot/src/scripts/testVacancyManage.ts [--clean]
 */
import { auth, createServiceClient } from "@talantly/shared";
import { config } from "../config.js"; // .env yuklaydi (side-effect)

const BASE = process.env.WEB_BASE ?? "http://localhost:3001";
const OWNER_TG = 999910001; // vakansiya egasi (ish beruvchi)
const OTHER_TG = 999910002; // begona kompaniya
const TALENT_TG = 999910003; // ariza beruvchi talant

const db = createServiceClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
);
const SECRET = process.env.WEBAPP_JWT_SECRET ?? "";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  console.log(`${cond ? "✅" : "❌"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failures++;
}

interface Res {
  status: number;
  body: Record<string, unknown>;
}

async function call(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<Res> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* bo'sh javob */
  }
  return { status: res.status, body };
}

async function seedUser(tgId: number): Promise<{ id: string; token: string }> {
  const { data, error } = await db
    .from("users")
    .insert({ tg_id: tgId })
    .select("id")
    .single();
  if (error || !data) throw new Error(`seed user ${tgId}: ${error?.message}`);
  const id = (data as { id: string }).id;
  const token = await auth.signSession({ userId: id, tgId }, SECRET);
  return { id, token };
}

async function cleanup(): Promise<void> {
  const tgIds = [OWNER_TG, OTHER_TG, TALENT_TG];
  const { data: users } = await db
    .from("users")
    .select("id")
    .in("tg_id", tgIds);
  const userIds = ((users ?? []) as { id: string }[]).map((u) => u.id);
  if (userIds.length > 0) {
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
}

async function main(): Promise<void> {
  if (process.argv.includes("--clean")) {
    await cleanup();
    console.log("🧹 Test ma'lumotlari tozalandi.");
    return;
  }
  if (!SECRET) {
    console.error("WEBAPP_JWT_SECRET yo'q.");
    process.exit(1);
  }

  await cleanup();
  const owner = await seedUser(OWNER_TG);
  const other = await seedUser(OTHER_TG);
  const talentUser = await seedUser(TALENT_TG);

  // --- A) Yaratish -----------------------------------------------------
  const created = await call(owner.token, "/api/vacancies", {
    method: "POST",
    body: JSON.stringify({
      title: "Test Frontend dasturchi",
      direction: "dasturlash",
      level: "intern",
      salaryFrom: 4_000_000,
      salaryTo: 7_000_000,
      city: "Samarqand",
      district: "Registon",
      workFormats: ["masofaviy"],
      description: "Birinchi qator\nIkkinchi qator",
    }),
  });
  check("A1 vakansiya yaratildi → 200", created.status === 200);
  const vacId = typeof created.body.id === "string" ? created.body.id : "";
  check("A2 id qaytdi", vacId.length > 10);

  // Shahar/tuman haqiqatan yozildimi (ilgari "Toshkent" qotib qolgan edi).
  const { data: rawVac } = await db
    .from("vacancies")
    .select("city, district, salary_from, work_formats")
    .eq("id", vacId)
    .single();
  const rv = rawVac as {
    city: string;
    district: string;
    salary_from: number;
    work_formats: string[];
  };
  check("A3 shahar saqlandi", rv.city === "Samarqand", rv.city);
  check("A4 tuman saqlandi", rv.district === "Registon", rv.district);
  check("A5 maosh saqlandi", rv.salary_from === 4_000_000);
  check("A6 ish formati saqlandi", rv.work_formats.includes("masofaviy"));

  // --- B) O'z ro'yxati --------------------------------------------------
  const mine = await call(owner.token, "/api/vacancies?mine=1");
  const list = (mine.body.vacancies ?? []) as Record<string, unknown>[];
  check("B1 ?mine=1 → 200", mine.status === 200);
  check("B2 ro'yxatda 1 ta vakansiya", list.length === 1, `${list.length}`);
  check("B3 holat 'faol'", list[0]?.status === "faol");
  check(
    "B4 ariza sanog'i 0",
    (list[0]?.applications as { total: number } | undefined)?.total === 0,
  );

  // Begona kompaniya o'z ro'yxatida buni ko'rmaydi.
  const othersList = await call(other.token, "/api/vacancies?mine=1");
  check(
    "B5 begona kompaniya ro'yxati bo'sh",
    ((othersList.body.vacancies ?? []) as unknown[]).length === 0,
  );

  // --- C) Egalik tekshiruvi --------------------------------------------
  const foreignGet = await call(other.token, `/api/vacancies/${vacId}`);
  check("C1 begona GET → 403", foreignGet.status === 403, `${foreignGet.status}`);
  const foreignPatch = await call(other.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ title: "O'g'irlangan" }),
  });
  check("C2 begona PATCH → 403", foreignPatch.status === 403);
  const foreignApps = await call(
    other.token,
    `/api/vacancies/${vacId}/arizalar`,
  );
  check("C3 begona arizalar → 403", foreignApps.status === 403);

  // --- D) Tahrir --------------------------------------------------------
  const edited = await call(owner.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ title: "Test Frontend (tahrirlangan)", level: "mutaxassis" }),
  });
  check("D1 tahrir → 200", edited.status === 200);
  const ev = edited.body.vacancy as Record<string, unknown> | undefined;
  check("D2 sarlavha yangilandi", ev?.title === "Test Frontend (tahrirlangan)");
  check("D3 daraja yangilandi", ev?.level === "mutaxassis");

  const badDir = await call(owner.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ direction: "kosmonavt" }),
  });
  check("D4 noto'g'ri yo'nalish → 400", badDir.status === 400);

  // --- E) Limit (obunasiz 1 ta faol) -----------------------------------
  const second = await call(owner.token, "/api/vacancies", {
    method: "POST",
    body: JSON.stringify({ title: "Ikkinchi vakansiya", direction: "dizayn" }),
  });
  check("E1 ikkinchi faol vakansiya → 403 limit", second.status === 403);
  check("E2 xato kodi vacancy_limit", second.body.error === "vacancy_limit");

  // --- F) Yopish / faollashtirish --------------------------------------
  const closed = await call(owner.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "yopilgan" }),
  });
  check("F1 yopish → 200", closed.status === 200);
  check(
    "F2 holat 'yopilgan'",
    (closed.body.vacancy as Record<string, unknown>)?.status === "yopilgan",
  );

  // Yopilgach yangi vakansiya joylash mumkin.
  const third = await call(owner.token, "/api/vacancies", {
    method: "POST",
    body: JSON.stringify({ title: "Ikkinchi vakansiya", direction: "dizayn" }),
  });
  check("F3 yopilgach yangisi joylandi → 200", third.status === 200);

  // Endi qayta faollashtirish limitga uriladi.
  const reopen = await call(owner.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "faol" }),
  });
  check("F4 limitda qayta ochish → 403", reopen.status === 403, `${reopen.status}`);

  // status_log yozuvi bor.
  const { data: logs } = await db
    .from("status_log")
    .select("old_status, new_status")
    .eq("entity", "vacancies")
    .eq("entity_id", vacId);
  const logRows = (logs ?? []) as { old_status: string; new_status: string }[];
  check("F5 status_log yozildi", logRows.length >= 1, `${logRows.length} ta`);
  check(
    "F6 log faol→yopilgan",
    logRows.some((l) => l.old_status === "faol" && l.new_status === "yopilgan"),
  );

  // --- G) Arizalar ------------------------------------------------------
  // Talant profili + vakansiyani qayta faollashtiramiz (uchinchisini yopib).
  const thirdId = typeof third.body.id === "string" ? third.body.id : "";
  await call(owner.token, `/api/vacancies/${thirdId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "yopilgan" }),
  });
  await call(owner.token, `/api/vacancies/${vacId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "faol" }),
  });

  const { data: tal } = await db
    .from("talents")
    .insert({
      user_id: talentUser.id,
      full_name: "Kamola Olimova",
      direction: "dasturlash",
      city: "Toshkent",
      status: "tekshirilgan",
    })
    .select("id")
    .single();
  const talentId = (tal as { id: string }).id;

  const applied = await call(talentUser.token, "/api/vacancies/apply", {
    method: "POST",
    body: JSON.stringify({ vacancyId: vacId }),
  });
  check("G1 talant ariza berdi → 200", applied.status === 200, `${applied.status}`);

  const apps = await call(owner.token, `/api/vacancies/${vacId}/arizalar`);
  const rows = (apps.body.applications ?? []) as Record<string, unknown>[];
  check("G2 arizalar → 200", apps.status === 200);
  check("G3 1 ta ariza", rows.length === 1, `${rows.length}`);
  const talent = rows[0]?.talent as Record<string, unknown> | undefined;
  check("G4 ism qisqartirilgan", talent?.name === "Kamola O.", String(talent?.name));
  check("G5 tekshirilgan belgisi", talent?.verified === true);
  check("G6 talant id qaytdi", talent?.id === talentId);
  check("G7 boshlang'ich holat 'yangi'", rows[0]?.status === "yangi");

  // Ro'yxatdagi sanoq yangilandi.
  const mine2 = await call(owner.token, "/api/vacancies?mine=1");
  const l2 = (mine2.body.vacancies ?? []) as Record<string, unknown>[];
  const target = l2.find((v) => v.id === vacId);
  const counts = target?.applications as { total: number; fresh: number };
  check("G8 sanoq total=1", counts?.total === 1);
  check("G9 sanoq fresh=1", counts?.fresh === 1);

  // --- H) Ariza holatini o'zgartirish -----------------------------------
  const appId = String(rows[0]?.id ?? "");
  const moved = await call(owner.token, "/api/request", {
    method: "PATCH",
    body: JSON.stringify({ id: appId, status: "boglanildi" }),
  });
  check("H1 ariza holati o'zgardi → 200", moved.status === 200);
  check("H2 yangi holat qaytdi", moved.body.status === "boglanildi");

  const foreignMove = await call(other.token, "/api/request", {
    method: "PATCH",
    body: JSON.stringify({ id: appId, status: "yopildi" }),
  });
  check("H3 begona ariza holati → 403", foreignMove.status === 403);

  const badStatus = await call(owner.token, "/api/request", {
    method: "PATCH",
    body: JSON.stringify({ id: appId, status: "allaqanday" }),
  });
  check("H4 noto'g'ri holat → 400", badStatus.status === 400);

  const mine3 = await call(owner.token, "/api/vacancies?mine=1");
  const t3 = ((mine3.body.vacancies ?? []) as Record<string, unknown>[]).find(
    (v) => v.id === vacId,
  );
  const c3 = t3?.applications as { total: number; fresh: number };
  check("H5 fresh 0 ga tushdi", c3?.fresh === 0, `${c3?.fresh}`);

  // --- I) Auth ----------------------------------------------------------
  const noAuth = await fetch(`${BASE}/api/vacancies?mine=1`);
  check("I1 tokensiz → 401", noAuth.status === 401, `${noAuth.status}`);

  await cleanup();
  console.log("🧹 Test ma'lumotlari tozalandi.");
  console.log(
    failures === 0
      ? "\n🟢 HAMMASI O'TDI"
      : `\n🔴 ${failures} ta tekshiruv yiqildi`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
