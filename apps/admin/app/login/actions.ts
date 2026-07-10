"use server";

import { redirect } from "next/navigation";
import { getAuthClient } from "@/lib/supabase/auth";

export interface LoginState {
  error: string | null;
}

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email va parolni kiriting." };
  }

  const supabase = getAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: "Email yoki parol noto'g'ri." };
  }
  redirect("/talantlar");
}

export async function signOut(): Promise<void> {
  const supabase = getAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}
