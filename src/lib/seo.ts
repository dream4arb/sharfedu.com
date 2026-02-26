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
  if (ogTitle) setOg("og:title", ogTitle);
  if (ogDescription) setOg("og:description", ogDescription);
  if (ogImage) setOg("og:image", ogImage);
}
