import "server-only";
import type { UserRow } from "@talantly/shared";
import { usersRepo } from "@talantly/shared";
import { redirect } from "next/navigation";
import { getAuthClient } from "@/lib/supabase/auth";
import { getServiceClient } from "@/lib/supabase/service";

export interface AdminSession {
  authUid: string;
  email: string | null;
  user: UserRow;
}

/**
 * Resolves the signed-in Supabase Auth user and requires role
 * admin/moderator in public.users (linked via auth_uid). Redirects to
 * /login otherwise.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const auth = getAuthClient();
  const {
    data: { user: authUser },
  } = await auth.auth.getUser();
  if (!authUser) redirect("/login");

  const user = await usersRepo.findByAuthUid(getServiceClient(), authUser.id);
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    redirect("/login?xato=huquq");
  }

  return { authUid: authUser.id, email: authUser.email ?? null, user };
}
