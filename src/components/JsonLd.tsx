import { useEffect } from "react";

const SITE_URL = "https://betanalizer.lovable.app";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bet Analizer",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "Plataforma de análise de risco para apostas esportivas. Ferramenta educacional de análise estatística.",
  foundingDate: "2026",
  areaServed: {
    "@type": "Country",
    name: "Brasil",
  },
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bet Analizer",
  url: SITE_URL,
  description:
    "Plataforma digital de análise de risco para apostas esportivas.",
  inLanguage: "pt-BR",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bet Analizer",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  description:
    "Ferramenta educacional de análise de risco e estatística para apostas esportivas. Não garante ganhos financeiros.",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BRL",
    lowPrice: "0",
    highPrice: "79.90",
    offerCount: "4",
  },
  aggregateRating: undefined,
};

export function JsonLd() {
  useEffect(() => {
    const id = "json-ld-structured-data";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify([
      organizationSchema,
      websiteSchema,
      softwareSchema,
    ]);

    return () => {
      script?.remove();
    };
  }, []);

  return null;
}
