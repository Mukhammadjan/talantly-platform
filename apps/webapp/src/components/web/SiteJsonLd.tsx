const BASE = "https://talantly.uz";

// Bosh sahifa uchun tashkilot + sayt tavsifi. WebSite/SearchAction Google'ga
// natijalar ostida qidiruv maydonini ko'rsatish imkonini beradi.
const LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Talantly",
    url: BASE,
    logo: `${BASE}/assets/brand/talantly-mark.svg`,
    description:
      "O'zbekistondagi tekshirilgan amaliyot platformasi: har bir talant " +
      "bilim testi va jonli suhbatdan o'tadi.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toshkent",
      addressCountry: "UZ",
    },
    sameAs: ["https://t.me/Talantly_bot"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Talantly",
    url: BASE,
    inLanguage: "uz",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/vakansiyalar?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export function SiteJsonLd(): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(LD).replace(/</g, "\\u003c"),
      }}
    />
  );
}
