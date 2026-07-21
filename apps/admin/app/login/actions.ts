"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/session";

export async function signOut(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  redirect("/login");
}
