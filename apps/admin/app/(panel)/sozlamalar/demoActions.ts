"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";

export interface DemoModeState {
  show: boolean;
  demoTalents: number;
  demoCompanies: number;
  demoVacancies: number;
}

/** Demo rejim holati + yashiringan/ko'rinadigan demo yozuvlar soni. */
export async function loadDemoMode(): Promise<DemoModeState> {
  const db = getServiceClient();
  const [{ data: setting }, talents, companies, vacancies] = await Promise.all([
    db.from("settings").select("value").eq("key", "show_demo_data").maybeSingle(),
    db.from("talents").select("id", { count: "exact", head: true }).eq("is_demo", true),
    db.from("companies").select("id", { count: "exact", head: true }).eq("is_demo", true),
    db.from("vacancies").select("id", { count: "exact", head: true }).eq("is_demo", true),
  ]);
  const value = (setting as { value: string } | null)?.value ?? "true";
  return {
    show: value.trim().toLowerCase() === "true",
    demoTalents: talents.count ?? 0,
    demoCompanies: companies.count ?? 0,
    demoVacancies: vacancies.count ?? 0,
  };
}

/**
 * Demo rejimni yoqish/o'chirish — faqat super admin. O'chirilganda saytda
 * faqat real talant/kompaniya/vakansiya qoladi (webapp settings'ni har
 * so'rovda DB'dan o'qiydi, shu sabab o'zgarish darhol kuchga kiradi).
 */
export async function setDemoMode(show: boolean): Promise<DemoModeState> {
  await requireRole("admin");
  const db = getServiceClient();
  await db
    .from("settings")
    .update({ value: show ? "true" : "false" })
    .eq("key", "show_demo_data");
  revalidatePath("/sozlamalar");
  revalidatePath("/dashboard");
  return loadDemoMode();
}
