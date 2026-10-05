const SITE_NAME = "منصة شارف التعليمية";

/** القيم الافتراضية للـ SEO عند عدم وجود بيانات في قاعدة البيانات */
export const DEFAULT_SEO = {
  title: "منصة شارف التعليمية - Sharaf | تعليم شامل لجميع المراحل الدراسية",
  description:
    "منصة شارف التعليمية - منصة تعليمية سعودية شاملة لجميع المراحل الدراسية من الابتدائية للثانوية والقدرات والتحصيلي. دروس تفاعلية واختبارات ذكية.",
  keywords: "شارف, شارف السعودية, منصة تعليمية, دروس تفاعلية, تعليم ذكي, تعليم, السعودية, ابتدائي, متوسط, ثانوي, قدرات, تحصيلي",
} as const;

export interface PageMetaOptions {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  structuredData?: unknown[];
}

/**
 * تحديث عنوان الصفحة ووصف وكلمات الـ meta للـ SEO (ربط مع قاعدة البيانات).
 */
export function setPageMeta(title: string, description?: string, keywords?: string): void;
export function setPageMeta(opts: PageMetaOptions): void;
export function setPageMeta(
  titleOrOpts: string | PageMetaOptions,
  description?: string,
  keywords?: string
): void {
  const opts: PageMetaOptions =
    typeof titleOrOpts === "string"
      ? { title: titleOrOpts, description, keywords }
      : titleOrOpts;

  const { title, description: desc, keywords: kw, ogTitle, ogDescription, ogImage } = opts;

  // <title>
  document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // <meta name="description">
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", desc ?? DEFAULT_SEO.description);
  }

  // <meta name="keywords">
  let metaKw = document.querySelector('meta[name="keywords"]');
  if (!metaKw) {
    metaKw = document.createElement("meta");
    metaKw.setAttribute("name", "keywords");
    document.head.appendChild(metaKw);
  }
  metaKw.setAttribute("content", kw ?? DEFAULT_SEO.keywords);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  const queryGrade = new URLSearchParams(window.location.search).get("grade");
  canonical.href = opts.canonical || `https://sharfedu.com${window.location.pathname}${queryGrade && queryGrade !== "1" ? `?grade=${encodeURIComponent(queryGrade)}` : ""}`;

  // Open Graph
  const setOg = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };
  setOg("og:url", canonical.href);
  setOg("og:title", ogTitle || document.title);
  setOg("og:description", ogDescription || desc || DEFAULT_SEO.description);
  setOg("og:image", ogImage || "https://sharfedu.com/hero-main.webp");
  const setName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  setName("twitter:title", ogTitle || document.title);
  setName("twitter:description", ogDescription || desc || DEFAULT_SEO.description);
  setName("twitter:image", ogImage || "https://sharfedu.com/hero-main.webp");
  if (opts.robots) setName("robots", opts.robots);
  if (opts.structuredData) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    const script = document.createElement("script"); script.type = "application/ld+json";
    script.id = "page-structured-data"; script.textContent = JSON.stringify(opts.structuredData); document.head.appendChild(script);
  }
}
