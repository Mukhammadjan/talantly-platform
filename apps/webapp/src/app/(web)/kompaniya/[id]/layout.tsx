import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDb } from "@/lib/server/db";

const BASE = "https://talantly.uz";

interface Row {
  id: string;
  name: string;
  activity_type: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  is_demo: boolean;
}

async function load(id: string): Promise<Row | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const { data } = await getDb()
      .from("companies")
      .select(
        "id, name, activity_type, city, district, description, logo_url, is_verified, is_demo",
      )
      .eq("id", id)
      .maybeSingle();
    return (data as Row | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const c = await load(params.id);
  if (!c) return { title: "Kompaniya topilmadi", robots: { index: false } };

  const place = [c.city, c.district].filter(Boolean).join(", ") || "Toshkent";
  const description =
    (c.description?.replace(/\s+/g, " ").trim().slice(0, 200) ||
      `${c.name} — ${place}dagi kompaniya.`) +
    ` Talantly'da ochiq vakansiyalari va tekshiruv holati.`;

  return {
    title: c.name,
    description,
    alternates: { canonical: `/kompaniya/${c.id}` },
    robots: c.is_demo ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "profile",
      title: `${c.name} · Talantly`,
      description,
      url: `/kompaniya/${c.id}`,
    },
  };
}

export default async function CompanyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}): Promise<JSX.Element> {
  const c = await load(params.id);
  const ld =
    c && !c.is_demo
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: c.name,
          url: `${BASE}/kompaniya/${c.id}`,
          logo: c.logo_url || undefined,
          description: c.description || undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: c.city ?? "Toshkent",
            addressCountry: "UZ",
          },
        }
      : null;

  return (
    <>
      {ld ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ld).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
