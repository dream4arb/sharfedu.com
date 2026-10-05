import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveSeoPage, sitemapPaths, escapeHtml } from "../server/seo/model";
import { renderPublicBody, renderSeoHtml, seoSitemapInfo } from "../server/seo/routes";
import { setCurrentHierarchy, type HierarchyStage } from "../server/data/cms-hierarchy";
import { hasPublishedContent } from "../shared/seo/publication";
const hierarchy: HierarchyStage[] = [{ slug: "high", name: "الثانوية", grades: [
  { id: "1", name: "أول ثانوي", subjects: [{ slug: "math", name: "الرياضيات", semesters: [
    { id: "s2", name: "الفصل الدراسي الثاني", chapters: [{ id: "ch5", name: "الأشكال الرباعية", number: 5, lessons: [
      { id: "math-high1-s2-prep-5", title: "التهيئة للفصل 5" }, { id: "l-mm6el08l", title: "زوايا المضلع" }, { id: "empty", title: "المستطيل" },
    ] }] },
  ] }] },
  { id: "2", name: "ثاني ثانوي", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }] },
] }];
setCurrentHierarchy(hierarchy);
const lesson = resolveSeoPage("/lesson/secondary/math/l-mm6el08l");
assert.equal(lesson.status, 200); assert.ok(lesson.robots.startsWith("index"));
assert.ok(lesson.title.includes("أول ثانوي")); assert.ok(lesson.description.includes("الفصل الدراسي الثاني"));
assert.equal(lesson.canonical, "https://sharfedu.com/lesson/secondary/math/l-mm6el08l");
assert.equal(resolveSeoPage("/lesson/high/math/l-mm6el08l?utm_source=test").canonical, lesson.canonical);
assert.ok(JSON.stringify(lesson.structuredData).includes("LearningResource"));
assert.ok(renderPublicBody(lesson).includes("540°"));
assert.ok(renderPublicBody(lesson).includes("\u2066(5 − 2) × 180° = 540°\u2069"));
const prep = resolveSeoPage("/lesson/secondary/math/math-high1-s2-prep-5");
assert.ok(prep.sections[0].paragraphs[0].includes("الأشكال الرباعية"));
assert.ok(resolveSeoPage("/lesson/secondary/math/empty").robots.startsWith("noindex"));
assert.equal(resolveSeoPage("/lesson/secondary/math/missing").status, 404);
assert.equal(resolveSeoPage("/random-missing").status, 404);
for (const privatePath of ["/admin", "/login", "/register", "/profile", "/dashboard", "/complete-profile", "/pdf-viewer"]) {
  assert.ok(resolveSeoPage(privatePath).robots.startsWith("noindex"));
}
const second = resolveSeoPage("/lesson/secondary/math?grade=2");
assert.ok(second.title.includes("ثاني ثانوي")); assert.ok(second.canonical.endsWith("?grade=2"));
assert.ok(second.robots.startsWith("noindex")); assert.equal(second.links.length, 0);
const paths = sitemapPaths(); assert.equal(paths.length, new Set(paths).size);
const info = await seoSitemapInfo();
assert.equal(info.totalUrls, paths.length);
assert.equal(info.totalUrls, info.staticPages.length + info.stagePages.length + info.subjectPages.length + info.lessonCount);
assert.equal(info.lessonCount, 2);
assert.ok(!info.staticPages.some(p => /login|register/.test(p.url)));
assert.ok(paths.includes(lesson.pagePath)); assert.ok(paths.includes(prep.pagePath));
assert.ok(!paths.some(p => /login|register|empty|grade=2/.test(p)));
assert.equal(hasPublishedContent("m2-1-1", "middle", "2", "math"), false);
assert.equal(hasPublishedContent("l-mm6el08l", "high", "2", "math"), false);
assert.equal(escapeHtml('<img onerror="x">'), "&lt;img onerror=&quot;x&quot;&gt;");
const html = await renderSeoHtml("index.html", lesson);
assert.equal((html.match(/<title>/g) || []).length, 1);
assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
assert.equal((html.match(/property="og:title"/g) || []).length, 1);
assert.equal((html.match(/name="twitter:title"/g) || []).length, 1);
assert.ok(!html.includes("SearchAction")); assert.ok(html.includes("540°"));
const script = html.match(/id="page-structured-data">([\s\S]*?)<\/script>/)![1]; JSON.parse(script);
const client = readFileSync("src/components/SeoHead.tsx", "utf8");
assert.ok(client.includes("AbortController")); assert.ok(client.includes("useSearch"));
console.log("PASS: route HTML, grade-specific canonical, schema, noindex/404, publication-only unique sitemap, safe escaping, stale request cancellation.");
