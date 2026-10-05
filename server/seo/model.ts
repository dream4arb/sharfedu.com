import { getFullHierarchy, type HierarchyStage } from "../data/cms-hierarchy";
import { getSeo } from "../admin/cmsStorage";
import { hasPublishedContent, lessonReadingSections } from "../../shared/seo/publication";
import { unitPreparationIntroductions } from "../../src/components/lessons/unitPreparationIntroduction";
import { isUnitPreparation } from "../../shared/curriculum/unit-preparation";

export const ORIGIN = "https://sharfedu.com";
const SITE = "منصة شارف التعليمية";
const stageAlias: Record<string, string> = { primary: "elementary", secondary: "high", intermediate: "middle" };
export const routeStage = (stage: string) => ({ elementary: "primary", high: "secondary" }[stage] || stage);
export const subjectPath = (stage: string, subject: string, grade: string, firstGrade: string) =>
  `/lesson/${routeStage(stage)}/${encodeURIComponent(subject)}${grade === firstGrade ? "" : `?grade=${encodeURIComponent(grade)}`}`;
type Link = { title: string; href: string };
export type SeoPage = {
  pagePath: string; title: string; description: string; keywords: string; canonical: string;
  ogTitle: string; ogDescription: string; ogImage: string; robots: string;
  status: number; heading: string; sections: { heading: string; paragraphs: string[] }[];
  links: Link[]; breadcrumbs: Link[]; structuredData: unknown[];
};
const INDEX = "index, follow, max-image-preview:large";
const NOINDEX = "noindex, follow";
export function resolveSeoPage(input: string, hierarchy: HierarchyStage[] = getFullHierarchy()): SeoPage {
  const url = new URL(input.startsWith("/") ? input : `/${input}`, ORIGIN);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  let canonicalPath = pathname;
  let heading = "الصفحة غير موجودة";
  let description = "الصفحة المطلوبة غير موجودة. يمكنك الرجوع إلى فهرس المراحل الدراسية.";
  let status = 404, robots = NOINDEX;
  let sections: SeoPage["sections"] = [];
  let links: Link[] = [{ title: "المراحل الدراسية", href: "/stages" }];
  const breadcrumbs: Link[] = [{ title: "الرئيسية", href: "/" }];
  let resource: Record<string, unknown> | undefined;
  let titleContext = "";
  const staticPages: Record<string, [string, string]> = {
    "/": ["منصة شارف التعليمية", "منصة شارف التعليمية للمراحل الابتدائية والمتوسطة والثانوية. اختر المرحلة والصف والمادة، وتابع الدروس المنشورة والشرح التفاعلي والاختبارات."],
    "/stages": ["المراحل الدراسية", "اختر المرحلة الدراسية والصف للوصول إلى موادك ودروسك على منصة شارف التعليمية."],
    "/features": ["مميزات منصة شارف التعليمية", "تعرف على تجربة التعلم في منصة شارف: شرح مرئي وأنشطة تفاعلية واختبارات ومتابعة تقدم الطالب."],
    "/privacy": ["سياسة الخصوصية", "سياسة الخصوصية وحماية بيانات المستخدمين في منصة شارف التعليمية."],
  };
  if (staticPages[pathname]) {
    [heading, description] = staticPages[pathname]; status = 200; robots = INDEX;
    links = hierarchy.map(stage => ({ title: `المرحلة ${stage.name}`, href: `/stage/${stage.slug}` }));
    if (pathname === "/privacy") links = [{ title: "الرئيسية", href: "/" }];
  } else if (/^\/(login|register|forgot-password|reset-password|dashboard|complete-profile|profile|admin|pdf-viewer|courses)(\/|$)/.test(pathname)) {
    heading = "حساب المستخدم"; description = "إدارة الحساب على منصة شارف التعليمية.";
    status = 200; robots = "noindex, nofollow"; links = [];
  } else if (pathname.startsWith("/stage/")) {
    const slug = pathname.slice(7);
    const stage = hierarchy.find(s => s.slug === (stageAlias[slug] || slug));
    if (stage) {
      canonicalPath = `/stage/${stage.slug}`; heading = `المرحلة ${stage.name}`;
      description = `مواد وصفوف المرحلة ${stage.name} على منصة شارف التعليمية. اختر صفك الدراسي ثم المادة.`;
      status = 200; robots = INDEX; links = [];
      for (const grade of stage.grades) {
        links.push(...grade.subjects.map(subject => ({ title: `${subject.name} — ${grade.name}`, href: subjectPath(stage.slug, subject.slug, grade.id, stage.grades[0].id) })));
      }
    }
  } else if (pathname.startsWith("/lesson/")) {
    const parts = pathname.split("/").filter(Boolean);
    const stage = hierarchy.find(s => s.slug === (stageAlias[parts[1]] || parts[1]));
    const id = parts[3];
    const grade = stage?.grades.find(g => id
      ? g.subjects.some(s => s.slug === parts[2] && s.semesters.some(sem => sem.chapters.some(ch => ch.lessons.some(l => l.id === id))))
      : g.id === (url.searchParams.get("grade") || stage.grades[0]?.id));
    const subject = grade?.subjects.find(s => s.slug === parts[2]);
    if (stage && grade && subject && parts.length <= 4) {
      const hub = subjectPath(stage.slug, subject.slug, grade.id, stage.grades[0].id);
      const sem = id ? subject.semesters.find(s => s.chapters.some(ch => ch.lessons.some(l => l.id === id))) : undefined;
      const chapter = sem?.chapters.find(ch => ch.lessons.some(l => l.id === id));
      const lesson = chapter?.lessons.find(l => l.id === id);
      if (!id || lesson) {
        canonicalPath = id ? `/lesson/${routeStage(stage.slug)}/${subject.slug}/${id}` : hub;
        breadcrumbs.push({ title: `المرحلة ${stage.name}`, href: `/stage/${stage.slug}` });
        if (id) breadcrumbs.push({ title: `${subject.name} — ${grade.name}`, href: hub });
        heading = lesson?.title || `${subject.name} — ${grade.name}`;
        if (lesson) titleContext = ` — ${subject.name} ${grade.name}`;
        const published = id ? hasPublishedContent(id, stage.slug, grade.id, subject.slug)
          : subject.semesters.some(s => s.chapters.some(ch => ch.lessons.some(l => hasPublishedContent(l.id, stage.slug, grade.id, subject.slug))));
        robots = published ? INDEX : NOINDEX; status = 200;
        description = lesson
          ? (published ? `شرح ${heading} في ${subject.name} ${grade.name}، ${sem?.name}، وحدة ${chapter?.name}. شرح الكتاب وأنشطة تفاعلية واختبار لمراجعة فهمك.`
            : `${heading} — ${subject.name} ${grade.name}. سيضاف محتوى الدرس بعد مراجعته.`)
          : `فهرس ${subject.name} ${grade.name}: الوحدات والدروس للفصلين الدراسيين، مع الوصول إلى المحتوى المنشور.`;
        links = subject.semesters.flatMap(s => s.chapters.flatMap(ch => ch.lessons.map(l => ({
          title: `${l.title} — ${ch.name}`, href: `/lesson/${routeStage(stage.slug)}/${subject.slug}/${l.id}`,
        }))));
        if (published && lesson) {
          if (isUnitPreparation(id)) {
            const unitNumber = chapter?.number || Number(chapter?.id.match(/\d+/)?.[0]);
            const intro = unitPreparationIntroductions[unitNumber];
            if (intro) sections = [
              { heading: "الفكرة الأساسية", paragraphs: [intro.idea] },
              { heading: "ما الذي ستتعلمه في هذه الوحدة؟", paragraphs: intro.learning },
              { heading: "لماذا ندرس هذه الوحدة؟", paragraphs: [intro.application] },
            ];
          } else sections = lessonReadingSections(id!);
          resource = { "@type": "LearningResource", "@id": `${ORIGIN}${canonicalPath}#lesson`, name: heading,
            description, url: `${ORIGIN}${canonicalPath}`, inLanguage: "ar-SA", learningResourceType: isUnitPreparation(id) ? "مقدمة وحدة" : "درس تفاعلي",
            educationalLevel: grade.name, about: [subject.name, chapter?.name].filter(Boolean), isAccessibleForFree: true,
            provider: { "@id": `${ORIGIN}/#organization` } };
        }
      }
    }
  }
  const canonical = `${ORIGIN}${canonicalPath}`;
  const title = heading.includes(SITE) ? heading : `${heading}${titleContext} | ${SITE}`;
  if (canonicalPath !== "/") breadcrumbs.push({ title: heading, href: canonicalPath });
  const structuredData: unknown[] = [{ "@context": "https://schema.org", "@graph": [
    { "@type": "EducationalOrganization", "@id": `${ORIGIN}/#organization`, name: SITE, url: `${ORIGIN}/` },
    { "@type": "WebSite", "@id": `${ORIGIN}/#website`, name: SITE, url: `${ORIGIN}/`, inLanguage: "ar-SA", publisher: { "@id": `${ORIGIN}/#organization` } },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, name: title, description, url: canonical, inLanguage: "ar-SA", isPartOf: { "@id": `${ORIGIN}/#website` } },
    { "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.title, item: `${ORIGIN}${b.href}` })) },
    ...(resource ? [resource] : []),
  ] }];
  return { pagePath: canonicalPath, title, description, keywords: `${heading}, شارف, تعليم`, canonical,
    ogTitle: title, ogDescription: description, ogImage: `${ORIGIN}/hero-main.webp`, robots, status, heading, sections, links, breadcrumbs, structuredData };
}

export async function pageWithOverrides(input: string): Promise<SeoPage> {
  const page = resolveSeoPage(input);
  // Exact-page overrides only. Parent/home metadata must not replace lesson metadata.
  const row = await getSeo(page.pagePath);
  if (row && page.status === 200) {
    page.title = row.title?.trim() || page.title;
    if (!page.title.includes(SITE)) page.title += ` | ${SITE}`;
    page.description = row.description?.trim() || page.description;
    page.keywords = row.keywords?.trim() || page.keywords;
    page.ogTitle = row.ogTitle?.trim() || page.title;
    page.ogDescription = row.ogDescription?.trim() || page.description;
    if (row.ogImage && /^https?:\/\//.test(row.ogImage)) page.ogImage = row.ogImage;
    const graph = (page.structuredData[0] as any)["@graph"];
    const web = graph.find((entry: any) => entry["@type"] === "WebPage");
    web.name = page.title; web.description = page.description;
  }
  return page;
}

export function sitemapPaths(hierarchy = getFullHierarchy()) {
  const paths = new Set(["/", "/features", "/stages", "/privacy"]);
  for (const stage of hierarchy) {
    paths.add(`/stage/${stage.slug}`);
    for (const grade of stage.grades) for (const subject of grade.subjects) {
      const lessons = subject.semesters.flatMap(s => s.chapters.flatMap(ch => ch.lessons));
      const published = lessons.filter(l => hasPublishedContent(l.id, stage.slug, grade.id, subject.slug));
      if (!published.length) continue;
      paths.add(subjectPath(stage.slug, subject.slug, grade.id, stage.grades[0].id));
      for (const lesson of published) paths.add(`/lesson/${routeStage(stage.slug)}/${subject.slug}/${lesson.id}`);
    }
  }
  return [...paths];
}
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths().map(p => `<url><loc>${escapeHtml(ORIGIN + p)}</loc></url>`).join("\n")}</urlset>`;
}
// Do not block private pages here: crawlers need to see their noindex response.
export const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /node_app/\nDisallow: /prompt-files/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
