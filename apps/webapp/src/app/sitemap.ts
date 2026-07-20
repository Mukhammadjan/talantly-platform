import type { MetadataRoute } from "next";
import { getDb } from "@/lib/server/db";

export const revalidate = 3600;

const BASE = "https://talantly.uz";

const STATIC: { path: string; priority: number; freq: "daily" | "weekly" }[] = [
  { path: "/", priority: 1, freq: "daily" },
  { path: "/vakansiyalar", priority: 0.9, freq: "daily" },
  { path: "/kompaniyalar", priority: 0.8, freq: "weekly" },
  { path: "/nomzodlar", priority: 0.7, freq: "daily" },
  { path: "/ai", priority: 0.6, freq: "weekly" },
  { path: "/kirish", priority: 0.3, freq: "weekly" },
];

// Yo'nalish bo'yicha filtrlangan ro'yxatlar — qidiruvda alohida sahifa bo'lib
// chiqadi ("dizayn amaliyot Toshkent" kabi so'rovlar uchun).
const DIRECTIONS = ["dasturlash", "dizayn", "marketing", "sotuv", "data"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: `${BASE}${s.path}`,
    lastModified: now,
    changeFrequency: s.freq,
    priority: s.priority,
  }));

  for (const d of DIRECTIONS) {
    entries.push({
      url: `${BASE}/vakansiyalar?direction=${d}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  try {
    const db = getDb();

    const { data: vacancies } = await db
      .from("vacancies")
      .select("id, created_at")
      .eq("status", "faol")
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .limit(1000);

    for (const v of (vacancies ?? []) as { id: string; created_at: string }[]) {
      entries.push({
        url: `${BASE}/vakansiya/${v.id}`,
        lastModified: new Date(v.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const { data: companies } = await db
      .from("companies")
      .select("id, created_at")
      .eq("is_demo", false)
      .limit(500);

    for (const c of (companies ?? []) as { id: string; created_at: string }[]) {
      entries.push({
        url: `${BASE}/kompaniya/${c.id}`,
        lastModified: new Date(c.created_at),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Baza yetib bo'lmasa ham statik qism qaytadi — sitemap butunlay
    // yiqilgandan ko'ra qisman bo'lgani yaxshi.
  }

  return entries;
}
