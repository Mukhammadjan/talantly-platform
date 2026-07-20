import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDb } from "@/lib/server/db";

const BASE = "https://talantly.uz";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

interface Row {
  id: string;
  title: string;
  direction: string | null;
  level: string | null;
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string;
  description: string | null;
  city: string | null;
  district: string | null;
  work_formats: string[];
  status: string;
  is_demo: boolean;
  created_at: string;
  companies: { name: string; description: string | null } | null;
}

async function load(id: string): Promise<Row | null> {
  // UUID bo'lmagan id bilan Postgres 22P02 qaytaradi — oldindan to'sib qo'yamiz.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const { data } = await getDb()
      .from("vacancies")
      .select("*, companies(name, description)")
      .eq("id", id)
      .maybeSingle();
    return (data as Row | null) ?? null;
  } catch {
    return null;
  }
}

function money(v: Row): string {
  const f = (n: number): string => n.toLocaleString("ru-RU");
  if (v.salary_from && v.salary_to) {
    return `${f(v.salary_from)}–${f(v.salary_to)} so'm`;
  }
  if (v.salary_from || v.salary_to) {
    return `${f((v.salary_from ?? v.salary_to) as number)} so'm`;
  }
  return "Maosh kelishilgan";
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const v = await load(params.id);
  if (!v) {
    return { title: "Vakansiya topilmadi", robots: { index: false } };
  }

  const company = v.companies?.name ?? "Kompaniya";
  const place = [v.city, v.district].filter(Boolean).join(", ") || "Toshkent";
  const title = `${v.title} — ${company}`;
  const description =
    `${company} ${place} shahrida ${v.title} lavozimiga xodim izlamoqda. ` +
    `${money(v)}. ` +
    (v.description?.replace(/\s+/g, " ").trim().slice(0, 90) ?? "");

  // Yopilgan vakansiya indeksda qolmasin.
  const indexable = v.status === "faol" && !v.is_demo;

  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: `/vakansiya/${v.id}` },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: `${title} · Talantly`,
      description: description.slice(0, 300),
      url: `/vakansiya/${v.id}`,
      publishedTime: v.created_at,
    },
  };
}

/** Google for Jobs uchun JobPosting — vakansiya qidiruv natijalarida chiqadi. */
function jobPostingLd(v: Row): Record<string, unknown> {
  const company = v.companies?.name ?? "Kompaniya";
  const remoteOnly =
    v.work_formats.length > 0 && v.work_formats.every((f) => f === "masofaviy");

  // Vakansiyada muddat maydoni yo'q — e'lon 60 kun amal qiladi deb olamiz,
  // aks holda Google e'lonni "eskirgan" deb belgilaydi.
  const validThrough = new Date(
    new Date(v.created_at).getTime() + 60 * 86_400_000,
  ).toISOString();

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: v.title,
    description:
      (v.description ?? "").trim() ||
      `${company} kompaniyasida ${v.title} lavozimi.`,
    identifier: {
      "@type": "PropertyValue",
      name: company,
      value: v.id,
    },
    datePosted: v.created_at,
    validThrough,
    employmentType: v.level === "intern" ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      sameAs: BASE,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: v.city ?? "Toshkent",
        addressRegion: v.district || undefined,
        addressCountry: "UZ",
      },
    },
    industry: DIRECTION_LABEL[v.direction ?? ""] ?? undefined,
    url: `${BASE}/vakansiya/${v.id}`,
  };

  if (remoteOnly) {
    ld.jobLocationType = "TELECOMMUTE";
    ld.applicantLocationRequirements = {
      "@type": "Country",
      name: "Uzbekistan",
    };
  }

  if (v.salary_from || v.salary_to) {
    ld.baseSalary = {
      "@type": "MonetaryAmount",
      currency: v.salary_currency || "UZS",
      value: {
        "@type": "QuantitativeValue",
        minValue: v.salary_from ?? v.salary_to,
        maxValue: v.salary_to ?? v.salary_from,
        unitText: "MONTH",
      },
    };
  }

  return ld;
}

export default async function VacancyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}): Promise<JSX.Element> {
  const v = await load(params.id);
  const ld = v && v.status === "faol" && !v.is_demo ? jobPostingLd(v) : null;

  return (
    <>
      {ld ? (
        <script
          type="application/ld+json"
          // JSON.stringify chiqishi — foydalanuvchi kiritgan matn shu yerda
          // qochiriladi, XSS uchun `<` belgisini ham almashtiramiz.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ld).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
