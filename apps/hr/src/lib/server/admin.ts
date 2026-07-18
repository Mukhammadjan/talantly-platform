import { redirect } from "next/navigation";
import { isAdminAuthed } from "./adminAuth";

// Admin kirish endi login+parol cookie orqali (adminAuth.ts).
// HR (kompaniya) Telegram-login sessiyasidan butunlay ajratilgan.

/** Sahifalar uchun: admin cookie yo'q bo'lsa → /admin/login. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdminAuthed())) redirect("/admin/login");
}

/** API uchun: admin bo'lmasa false — chaqiruvchi 403 qaytaradi. */
export async function adminAuthed(): Promise<boolean> {
  return isAdminAuthed();
}

/** HR sidebar'ida "Admin panel" havolasini ko'rsatish sharti. */
export async function showAdminLink(): Promise<boolean> {
  return isAdminAuthed();
}
