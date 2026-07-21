import "server-only";
import type { UserRole, UserRow } from "@talantly/shared";
import { usersRepo } from "@talantly/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/service";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/session";

export interface AdminSession {
  user: UserRow;
}

/**
 * Panel sessiyasi: JWT cookie'ni tekshiradi, so'ng public.users'dan
 * rol/holatni QAYTA o'qiydi (muzlatish/demotion darhol kuchга kiradi).
 * Faqat admin|moderator + account_status='active' o'tadi.
 */
export async function requirePanel(): Promise<AdminSession> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const claims = token
    ? await verifyAdminToken(token, serverEnv.jwtSecret)
    : null;
  if (!claims) redirect("/login");

  const user = await usersRepo.findById(getServiceClient(), claims.userId);
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    redirect("/login?xato=huquq");
  }
  if (user.account_status !== "active") {
    redirect("/login?xato=muzlatilgan");
  }
  return { user };
}

// Mavjud sahifalar bilan moslik (eski nom).
export const requireAdmin = requirePanel;

/**
 * Admin-only sahifa. Moderator kelsa /dashboard'ga qaytariladi (UI himoyasi).
 * Haqiqiy 403 middleware'da (admin-only yo'llar) beriladi — bu ikkilamchi qatlam.
 */
export async function requireRole(role: UserRole): Promise<AdminSession> {
  const session = await requirePanel();
  if (session.user.role !== role) {
    redirect("/dashboard?xato=huquq");
  }
  return session;
}
