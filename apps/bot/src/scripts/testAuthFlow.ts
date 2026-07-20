/**
 * AUTH v3 — bot parol oqimi E2E (real v2 DB, mock grammy ctx).
 * Isbotlaydi: begona kontakt rad · deleteMessage · parol mos emas qayta so'rov ·
 * hash saqlash · tasdiq xabarida ochiq parol YO'Q.
 *
 * Ishga tushirish: tsx apps/bot/src/scripts/testAuthFlow.ts
 */
import type { Context } from "grammy";
import * as authSessions from "../db/authSessionsRepo.js";
import { getSupabase } from "../db/client.js";
import * as usersRepo from "../db/usersRepo.js";
import {
  handleContact,
  handleParol,
  handleParolText,
} from "../handlers/parol.js";

const TG_ID = 999500111;
const PHONE_RAW = "998905550111";
const PHONE_E164 = "+998905550111";
const GOOD_PW = "Secret12345";

interface Reply {
  text: string;
}

class MockCtx {
  replies: Reply[] = [];
  deleted: number[] = [];
  private msgId = 1000;

  from = { id: TG_ID, is_bot: false, first_name: "Test" };
  chat = { id: TG_ID, type: "private" as const };
  message: Record<string, unknown> = {};

  setText(text: string): void {
    this.message = { message_id: ++this.msgId, text };
  }
  setContact(userId: number, phone: string): void {
    this.message = {
      message_id: ++this.msgId,
      contact: { user_id: userId, phone_number: phone, first_name: "Test" },
    };
  }

  reply = async (text: string): Promise<void> => {
    this.replies.push({ text });
  };
  api = {
    deleteMessage: async (_chatId: number, msgId: number): Promise<void> => {
      this.deleted.push(msgId);
    },
  };

  as(): Context {
    return this as unknown as Context;
  }
  lastReply(): string {
    return this.replies.at(-1)?.text ?? "";
  }
}

let failures = 0;
function check(name: string, cond: boolean): void {
  console.log(`${cond ? "✅" : "❌"} ${name}`);
  if (!cond) failures++;
}

async function cleanup(): Promise<void> {
  const db = getSupabase();
  const user = await usersRepo.findByTgId(TG_ID);
  if (user) await db.from("users").delete().eq("id", user.id);
  await authSessions.clearSession(TG_ID);
  // Raqam boshqa test qatorida qolган bo'lsa ham tozalaymiz.
  await db.from("users").delete().eq("phone", PHONE_E164);
}

async function main(): Promise<void> {
  await cleanup();

  // 0) /parol — raqamsiz user → kontakt so'raladi.
  const c0 = new MockCtx();
  await handleParol(c0.as());
  const s0 = await authSessions.getSession(TG_ID);
  check("/parol → 'contact' bosqichi", s0?.step === "contact");

  // 1) BEGONA kontakt (user_id boshqa) → rad, raqam saqlanmaydi.
  const c1 = new MockCtx();
  c1.setContact(TG_ID + 42, PHONE_RAW);
  await handleContact(c1.as());
  const afterForeign = await usersRepo.findByTgId(TG_ID);
  check("begona kontakt rad etildi", afterForeign?.phone == null);
  check(
    "begona kontakt xabari ko'rsatildi",
    c1.lastReply().toLowerCase().includes("sizning raqamingiz emas"),
  );

  // 2) O'Z kontakti → raqam saqlanadi, pw1 bosqichi.
  const c2 = new MockCtx();
  c2.setContact(TG_ID, PHONE_RAW);
  await handleContact(c2.as());
  const afterOwn = await usersRepo.findByTgId(TG_ID);
  check("o'z raqami E.164 saqlandi", afterOwn?.phone === PHONE_E164);
  check("pw1 bosqichi", (await authSessions.getSession(TG_ID))?.step === "pw1");

  // 3) pw1 juda qisqa parol → qayta so'raladi + xabar o'chirildi.
  const c3 = new MockCtx();
  c3.setText("qisqa");
  const h3 = await handleParolText(c3.as());
  check("qisqa parol handled", h3 === true);
  check("qisqa parol xabari O'CHIRILDI", c3.deleted.length === 1);
  check(
    "qisqa parolда pw1'da qoldi",
    (await authSessions.getSession(TG_ID))?.step === "pw1",
  );

  // 4) pw1 to'g'ri parol → hash sessiyaga, pw2 bosqichi, xabar o'chirildi.
  const c4 = new MockCtx();
  c4.setText(GOOD_PW);
  await handleParolText(c4.as());
  const s4 = await authSessions.getSession(TG_ID);
  check("pw1→pw2 o'tdi", s4?.step === "pw2");
  check("sessiyada HASH bor (ochiq parol emas)", typeof s4?.data.hash === "string" && String(s4?.data.hash).startsWith("$argon2"));
  check("sessiyada ochiq parol YO'Q", JSON.stringify(s4?.data).includes(GOOD_PW) === false);
  check("pw1 parol xabari O'CHIRILDI", c4.deleted.length === 1);

  // 5) pw2 MOS EMAS → boshidan (pw1).
  const c5 = new MockCtx();
  c5.setText("BoshqaParol99");
  await handleParolText(c5.as());
  check(
    "mos kelmagan parol → pw1'ga qaytdi",
    (await authSessions.getSession(TG_ID))?.step === "pw1",
  );
  check("mos emas xabari", c5.lastReply().toLowerCase().includes("mos kelmadi"));
  check("mos emas parol xabari O'CHIRILDI", c5.deleted.length === 1);

  // 6) qaytadan: pw1 to'g'ri → pw2 to'g'ri (MOS) → hash DB'ga, tasdiq.
  const c6a = new MockCtx();
  c6a.setText(GOOD_PW);
  await handleParolText(c6a.as());
  const c6b = new MockCtx();
  c6b.setText(GOOD_PW);
  await handleParolText(c6b.as());

  const finalUser = await usersRepo.findByTgId(TG_ID);
  check("password_hash saqlandi (argon2)", (finalUser?.password_hash ?? "").startsWith("$argon2"));
  check("password_set_at o'rnatildi", finalUser?.password_set_at != null);
  check("oqim sessiyasi tozalandi", (await authSessions.getSession(TG_ID)) === null);

  const confirm = c6b.lastReply();
  check("tasdiqда login (telefon) bor", confirm.includes(PHONE_E164));
  check("tasdiqда ochiq PAROL YO'Q", confirm.includes(GOOD_PW) === false);

  // 7) verifyPassword: DB hash + to'g'ri parol = true, xato = false.
  const { verifyPassword } = await import("@talantly/shared/auth/password");
  const okTrue = await verifyPassword(finalUser!.password_hash!, GOOD_PW);
  const okFalse = await verifyPassword(finalUser!.password_hash!, "notit");
  check("argon2 verify to'g'ri parol = true", okTrue === true);
  check("argon2 verify xato parol = false", okFalse === false);

  await cleanup();
  console.log(
    failures === 0
      ? "\n🎉 BARCHA TEKSHIRUVLAR O'TDI"
      : `\n❌ ${failures} ta tekshiruv YIQILDI`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error("FATAL", err);
  process.exit(1);
});
