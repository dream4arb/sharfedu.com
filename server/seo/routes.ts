import type { Express } from "express";
import { readFile } from "node:fs/promises";
import { getDisplayStructure, getAllLessons, getFullHierarchy } from "../data/cms-hierarchy";
import { escapeHtml as e, pageWithOverrides, resolveSeoPage, sitemapPaths, sitemapXml, robotsTxt, ORIGIN, type SeoPage } from "./model";
import { requireAdmin } from "../middleware/adminAuth";

export function seoSitemapInfo() {
  const paths = sitemapPaths();
  const entries = paths.map(url => ({ url, label: resolveSeoPage(url).heading, priority: url === "/" ? "1.0" : "0.8" }));
  return {
    baseUrl: ORIGIN, sitemapUrl: `${ORIGIN}/sitemap.xml`, robotsUrl: `${ORIGIN}/robots.txt`,
    totalUrls: paths.length,
    staticPages: entries.filter(p => !p.url.startsWith("/stage/") && !p.url.startsWith("/lesson/")),
    stagePages: entries.filter(p => p.url.startsWith("/stage/")),
    subjectPages: entries.filter(p => p.url.startsWith("/lesson/") && p.url.split("?")[0].split("/").filter(Boolean).length === 3),
    lessonCount: entries.filter(p => p.url.startsWith("/lesson/") && p.url.split("/").filter(Boolean).length === 4).length,
    lastGenerated: new Date().toISOString(),
  };
}

// Register after session/passport middleware, preserving the existing admin access policy.
export function installSeoAdminRoutes(app: Express) {
  app.get("/api/admin/sitemap-info", requireAdmin, (_req, res) => res.set("Cache-Control", "no-store").json(seoSitemapInfo()));
}

export function installSeoRoutes(app: Express) {
  app.get("/sitemap.xml", (_req, res) => res.type("application/xml").set("Cache-Control", "no-cache").send(sitemapXml()));
  app.get("/robots.txt", (_req, res) => res.type("text/plain").set("Cache-Control", "no-cache").send(robotsTxt));
  app.get("/api/seo", async (req, res, next) => {
    try { res.set("Cache-Control", "no-store").json(await pageWithOverrides(String(req.query.path || "/"))); }
    catch (error) { next(error); }
  });
  app.get("/api/public/structure", (_req, res) => {
    const displayStructure = getDisplayStructure();
    const lessonTitles: Record<string, string> = {};
    const lessonLocations: Record<string, { gradeId: string; gradeName: string; stageSlug: string; subjectSlug: string }> = {};
    for (const l of getAllLessons()) {
      lessonTitles[l.lessonId] = l.title;
      lessonLocations[l.lessonId] = { gradeId: l.gradeId, gradeName: l.gradeName, stageSlug: l.stageSlug, subjectSlug: l.subjectSlug };
    }
    for (const stage of getFullHierarchy()) for (const grade of stage.grades) for (const subject of grade.subjects) {
      displayStructure[`${stage.slug}_${grade.id}_${subject.slug}`] = { semesters: subject.semesters };
    }
    res.set("Cache-Control", "no-cache").json({ displayStructure, lessonTitles, lessonLocations });
  });
}

export function renderPublicBody(page: SeoPage) {
  return `<main dir="rtl" style="max-width:1100px;margin:40px auto;padding:24px;line-height:2;color:#183344">
    <nav aria-label="مسار الصفحة">${page.breadcrumbs.map(b => `<a href="${e(b.href)}">${e(b.title)}</a>`).join(" / ")}</nav>
    <h1>${e(page.heading)}</h1><p>${e(page.description)}</p>
    ${page.sections.map(s => `<section><h2>${e(s.heading)}</h2>${s.paragraphs.map(p => `<p>${e(p)}</p>`).join("")}</section>`).join("")}
    ${page.links.length ? `<nav aria-label="فهرس المحتوى"><h2>تصفح المحتوى</h2><ul>${page.links.map(l => `<li><a href="${e(l.href)}">${e(l.title)}</a></li>`).join("")}</ul></nav>` : ""}
  </main>`;
}
export async function renderSeoHtml(indexFile: string, page: SeoPage) {
  let html = await readFile(indexFile, "utf8");
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*(?:name=["'](?:description|keywords|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
  const json = JSON.stringify(page.structuredData).replace(/</g, "\\u003c");
  const meta = `<title>${e(page.title)}</title>
    <meta name="description" content="${e(page.description)}"><meta name="keywords" content="${e(page.keywords)}">
    <meta name="robots" content="${e(page.robots)}"><link rel="canonical" href="${e(page.canonical)}">
    <meta property="og:type" content="website"><meta property="og:locale" content="ar_SA"><meta property="og:site_name" content="منصة شارف التعليمية">
    <meta property="og:title" content="${e(page.ogTitle)}"><meta property="og:description" content="${e(page.ogDescription)}">
    <meta property="og:url" content="${e(page.canonical)}"><meta property="og:image" content="${e(page.ogImage)}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(page.ogTitle)}">
    <meta name="twitter:description" content="${e(page.ogDescription)}"><meta name="twitter:image" content="${e(page.ogImage)}">
    <script type="application/ld+json" id="page-structured-data">${json}</script>`;
  return html.replace("</head>", `${meta}</head>`).replace('<div id="root"></div>', `<div id="root">${renderPublicBody(page)}</div>`);
}
