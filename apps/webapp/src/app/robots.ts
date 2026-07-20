import type { MetadataRoute } from "next";

// Mini App ekranlari (Telegram ichida ishlaydi, initData'siz bo'sh ko'rinadi)
// va shaxsiy kabinetlar indeksga tushmasligi kerak.
const DISALLOW = [
  "/api/",
  "/talant",
  "/izlovchi",
  "/welcome",
  "/rol",
  "/doska",
  "/taklif",
  "/nomzod/",
  // Ro'yxat (/nomzodlar) ochiq, individual profillar — shaxsiy ma'lumot.
  "/nomzodlar/",
  "/suhbat",
  "/tolov",
  "/profil-forma",
  "/kabinet",
  "/kompaniyam",
  "/sozlamalar",
  "/xarita",
  "/konikma",
  "/shaxsiyat",
  "/kompaniya/tahrir",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOW }],
    sitemap: "https://talantly.uz/sitemap.xml",
    host: "https://talantly.uz",
  };
}
