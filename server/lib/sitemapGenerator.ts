import path from "path";
import { writeFile, access as fsAccess } from "fs/promises";

const BASE_URL = process.env.BASE_URL || "https://sharfedu.com";

export async function generateSitemapFiles(): Promise<{ totalUrls: number; writtenTo: string[] }> {
  const { getAllLessons, getFullHierarchy } = await import("../data/cms-hierarchy");
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/features", changefreq: "monthly", priority: "0.8" },
    { loc: "/stages", changefreq: "monthly", priority: "0.9" },
    { loc: "/login", changefreq: "monthly", priority: "0.5" },
    { loc: "/register", changefreq: "monthly", priority: "0.6" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  ];

  const stagePages: typeof staticPages = [];
  const hierarchy = getFullHierarchy();
  for (const stage of hierarchy) {
    stagePages.push({ loc: `/stage/${stage.slug}`, changefreq: "weekly", priority: "0.9" });
    for (const grade of stage.grades ?? []) {
      for (const subject of grade.subjects) {
        stagePages.push({ loc: `/lesson/${stage.slug}/${subject.slug}`, changefreq: "weekly", priority: "0.8" });
      }
    }
  }

  const lessonPages: typeof staticPages = [];
  const allLessons = getAllLessons();
  for (const lesson of allLessons) {
    lessonPages.push({
      loc: `/lesson/${lesson.stageSlug}/${lesson.subjectSlug}/${lesson.lessonId}`,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  const allPages = [...staticPages, ...stagePages, ...lessonPages];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const page of allPages) {
    xml += `  <url>\n    <loc>${BASE_URL}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  }
  xml += `</urlset>`;

  const robotsTxt = [
    "User-agent: *", "Allow: /", "",
    "Disallow: /api/", "Disallow: /admin", "Disallow: /dashboard",
    "Disallow: /profile", "Disallow: /pdf-viewer", "Disallow: /admin/pdf-extractor", "",
    `Sitemap: ${BASE_URL}/sitemap.xml`,
  ].join("\n");

  const serverDir = path.dirname(process.argv[1] || "");
  const writtenTo: string[] = [];

  const nodeAppPublic = path.resolve(serverDir, "server", "public");
  try {
    await fsAccess(nodeAppPublic);
    await writeFile(path.resolve(nodeAppPublic, "sitemap.xml"), xml, "utf-8");
    await writeFile(path.resolve(nodeAppPublic, "robots.txt"), robotsTxt, "utf-8");
    writtenTo.push(nodeAppPublic);
  } catch {}

  const publicHtml = path.resolve(serverDir, "..", "..");
  try {
    const testPath = path.resolve(publicHtml, "index.html");
    await fsAccess(testPath);
    await writeFile(path.resolve(publicHtml, "sitemap.xml"), xml, "utf-8");
    await writeFile(path.resolve(publicHtml, "robots.txt"), robotsTxt, "utf-8");
    writtenTo.push(publicHtml);
  } catch {}

  if (writtenTo.length === 0) {
    const cwdPublic = path.resolve(process.cwd(), "server", "public");
    try {
      await fsAccess(cwdPublic);
      await writeFile(path.resolve(cwdPublic, "sitemap.xml"), xml, "utf-8");
      await writeFile(path.resolve(cwdPublic, "robots.txt"), robotsTxt, "utf-8");
      writtenTo.push(cwdPublic);
    } catch {}
  }

  return { totalUrls: allPages.length, writtenTo };
}
