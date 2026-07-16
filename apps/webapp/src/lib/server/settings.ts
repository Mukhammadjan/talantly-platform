import { getDb } from "./db";

/** settings.key → value (TEXT). Har o'qishda DB'dan — hardcode YO'Q. */
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getDb()
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) return null;
  return (data as { value: string } | null)?.value ?? null;
}

/** show_demo_data — fail-open true (demo ko'rinadi). */
export async function showDemo(): Promise<boolean> {
  const v = await getSetting("show_demo_data");
  return (v ?? "true").trim().toLowerCase() === "true";
}

export async function getSettingInt(
  key: string,
  fallback: number,
): Promise<number> {
  const v = await getSetting(key);
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
