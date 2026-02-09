import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

const SITE_URL = "https://betanalizer.lovable.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function SEO({ title, description, path, noindex = false }: SEOProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} | Bet Analizer`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:site_name", "Bet Analizer");
    setMeta("property", "og:locale", "pt_BR");

    // Twitter Cards
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", OG_IMAGE);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    return () => {
      // Cleanup not strictly needed since next page will overwrite
    };
  }, [fullTitle, description, canonicalUrl, noindex]);

  return null;
}
