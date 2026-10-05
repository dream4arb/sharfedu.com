import type { Express } from "express";
import { readFile } from "node:fs/promises";
import { getDisplayStructure, getAllLessons, getFullHierarchy } from "../data/cms-hierarchy";
import { escapeHtml as e, pageWithOverrides, resolveSeoPage, sitemapPaths, sitemapXml, robotsTxt, ORIGIN, type SeoPage } from "./model";
import { requireAdmin } from "../middleware/adminAuth";
import { getPublicationCatalog } from "../lesson-publication/store";
import { installLessonPublicationRoutes } from "../lesson-publication/routes";
import path from "node:path";
import { bookImageAttributes } from "../../shared/lesson-engine/book-image";

export async function seoSitemapInfo() {
  const catalog = await getPublicationCatalog();
  const paths = sitemapPaths(getFullHierarchy(), catalog);
  const entries = paths.map(url => ({ url, label: resolveSeoPage(url, getFullHierarchy(), catalog).heading, priority: url === "/" ? "1.0" : "0.8" }));
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
  installLessonPublicationRoutes(app);
  app.get("/api/admin/sitemap-info", requireAdmin, async (_req, res, next) => {
    try { res.set("Cache-Control", "no-store").json(await seoSitemapInfo()); } catch (error) { next(error); }
  });
}

export function installSeoRoutes(app: Express) {
  app.get("/sitemap.xml", async (_req, res, next) => {
    try { res.type("application/xml").set("Cache-Control", "no-cache").send(sitemapXml(await getPublicationCatalog())); } catch (error) { next(error); }
  });
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
  const isLessonRoute = page.status === 200 && page.pagePath.startsWith("/lesson/");
  if (!isLessonRoute) {
    let homeHint = "";
    if (page.pagePath === "/") try {
      const manifest = JSON.parse(await readFile(path.join(path.dirname(indexFile), "assets/manifest.json"), "utf8"));
      const home = manifest["src/pages/Home.tsx"];
      if (home?.file) homeHint = `<link rel="modulepreload" crossorigin href="/${e(home.file)}">`;
      for (const css of home?.css ?? []) homeHint += `<link rel="stylesheet" crossorigin href="/${e(css)}">`;
    } catch { /* No production manifest in development. */ }
    return html.replace("</head>", `${meta}${homeHint}</head>`).replace('<div id="root"></div>', `<div id="root">${renderPublicBody(page)}</div>`);
  }

  // Bootstrap public content only, never user, session, draft or progress data.
  // The HTML and client consume the same published revision and course structure.
  const parts = page.pagePath.split("?")[0].split("/").filter(Boolean);
  const hierarchy = getFullHierarchy();
  const stage = hierarchy.find(s => s.slug === ({ primary: "elementary", secondary: "high", intermediate: "middle" }[parts[1]] || parts[1]));
  const catalog = await getPublicationCatalog();
  const entry = parts[3] && page.robots.startsWith("index") ? catalog[parts[3]] : undefined;
  const gradeId = entry?.location.grade || (parts[3] ? stage?.grades.find(g => g.subjects.some(s => s.slug === parts[2] && s.semesters.some(sem => sem.chapters.some(ch => ch.lessons.some(l => l.id === parts[3])))))?.id : new URL(page.canonical).searchParams.get("grade")) || stage?.grades[0]?.id;
  const structure = { displayStructure: {} as Record<string, unknown>, lessonTitles: {} as Record<string, string>, lessonLocations: {} as Record<string, unknown> };
  if (stage) for (const grade of stage.grades.filter(g => g.id === stage.grades[0].id || g.id === gradeId)) {
    const subject = grade.subjects.find(s => s.slug === parts[2]);
    if (!subject) continue;
    structure.displayStructure[`${stage.slug}_${grade.id}_${subject.slug}`] = { semesters: subject.semesters };
    for (const semester of subject.semesters) for (const chapter of semester.chapters) for (const lesson of chapter.lessons) {
      structure.lessonTitles[lesson.id] = lesson.title;
      structure.lessonLocations[lesson.id] = { gradeId: grade.id, gradeName: grade.name, stageSlug: stage.slug, subjectSlug: subject.slug };
    }
  }
  const bootstrap = JSON.stringify({ path: page.pagePath.split("?")[0], entry, structure }).replace(/</g, "\\u003c");
  let hints = "";
  try {
    const manifest = JSON.parse(await readFile(path.join(path.dirname(indexFile), "assets/manifest.json"), "utf8"));
    const seen = new Set<string>();
    const styles = new Set(Array.from(html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g), match => match[1]));
    const scripts = new Set(Array.from(html.matchAll(/<script\b[^>]*src="([^"]+)"/g), match => match[1]));
    const preload = (key: string) => {
      if (seen.has(key) || !manifest[key]) return;
      seen.add(key);
      const asset = manifest[key];
      if (asset.file?.endsWith(".js") && !scripts.has(`/${asset.file}`)) hints += `<link rel="modulepreload" crossorigin href="/${e(asset.file)}">`;
      for (const css of asset.css ?? []) {
        if (styles.has(`/${css}`)) continue;
        styles.add(`/${css}`);
        hints += `<link rel="stylesheet" crossorigin href="/${e(css)}">`;
      }
      for (const imported of asset.imports ?? []) preload(imported);
    };
    preload("src/pages/Lesson.tsx");
  } catch { /* Development uses Vite rather than the production manifest. */ }
  const firstPage = entry?.lesson.curriculumSource.lessonExcerpt?.pages[0];
  if (firstPage) {
    const image = bookImageAttributes(firstPage);
    hints += `<link rel="preload" as="image" href="${e(image.src)}"${image.srcSet ? ` imagesrcset="${e(image.srcSet)}" imagesizes="${e(image.sizes!)}"` : ""} fetchpriority="high">`;
  }
  // Lesson-critical styling arrives with HTML instead of extra blocking round trips
  // on mobile. Other routes retain their cached external stylesheets.
  for (const match of Array.from(html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/assets\/(?:index-[^"/]+\.css|tajawal-v12\.css))"[^>]*>/g))) {
    try {
      const css = await readFile(path.join(path.dirname(indexFile), match[1].slice(1)), "utf8");
      // Only inline standalone CSS; preserve the base URL for relative asset URLs.
      if (/url\(\s*["']?(?!\/|data:|#)[^"')\s]/i.test(css)) continue;
      html = html.replace(match[0], `<style data-lesson-critical-css>${css.replace(/<\/style/gi, "<\\/style")}</style>`);
    } catch { /* Keep the original link if a build asset is unavailable. */ }
  }
  // Keep the readable server fallback outside the mount target. Replacing a large
  // article with a loader and then an unrelated layout was the major mobile CLS.
  // It remains visible without JS or if the app fails; the mounted lesson replaces it.
  return html.replace("</head>", `${meta}${hints}<script type="application/json" id="public-lesson-bootstrap">${bootstrap}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root"></div><div id="lesson-seo-fallback">${renderPublicBody(page)}</div><noscript><style>#root{display:none}</style></noscript>`);
}
