import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

// Admin kirish: faqat ADMIN_TG_ID (env). Kengaytirish kerak bo'lsa —
// users.role tekshiruvi shu yerga qo'shiladi (bitta joy).

export function isAdmin(session: Session | null): boolean {
  const adminId = process.env.ADMIN_TG_ID;
  return Boolean(adminId && session && String(session.tgId) === adminId);
}

/** Sahifalar uchun: admin bo'lmasa HR ko'rinishiga qaytariladi. */
export async function requireAdminPage(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session)) redirect("/nomzodlar");
  return session;
}

/** API uchun: admin bo'lmasa null — chaqiruvchi 403 qaytaradi. */
export async function adminSession(): Promise<Session | null> {
  const session = await getSession();
  return isAdmin(session) ? session : null;
}
