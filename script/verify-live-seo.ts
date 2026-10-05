import assert from "node:assert/strict";
const origin = "https://sharfedu.com";
const sitemap = await fetch(origin + "/sitemap.xml");
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, "&"));
assert.equal(urls.length, new Set(urls).size);
assert.ok(!xml.includes("<lastmod>"));
const results: { url: string; status: number; title: string }[] = [];
for (let i = 0; i < urls.length; i += 4) {
  await Promise.all(urls.slice(i, i + 4).map(async url => {
    const response = await fetch(url);
    const html = await response.text();
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get("x-robots-tag") || "", /^index,/);
    assert.equal((html.match(/<title>/g) || []).length, 1, url);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, url);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1].replace(/&amp;/g, "&");
    assert.equal(canonical, url, url);
    assert.match(html, /name="robots" content="index,/);
    const data = html.match(/id="page-structured-data">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(data, url); JSON.parse(data);
    results.push({ url, status: response.status, title: html.match(/<title>(.*?)<\/title>/)?.[1] || "" });
  }));
}
for (const [path, status, robots] of [
  ["/lesson/secondary/math/math-high1-s1-4-6", 200, "noindex, follow"],
  ["/lesson/secondary/math?grade=2", 200, "noindex, follow"],
  ["/login", 200, "noindex, nofollow"],
  ["/admin", 200, "noindex, nofollow"],
  ["/lesson/secondary/math/not-a-real-lesson", 404, "noindex"],
  ["/this-page-is-missing", 404, "noindex"],
  ["/assets/missing.js", 404, "noindex"],
] as const) {
  const response = await fetch(origin + path);
  assert.equal(response.status, status, path);
  assert.ok((response.headers.get("x-robots-tag") || "").startsWith(robots), path);
}
for (const [path, target] of [
  ["/lesson/high/math/l-mm6el08l", "/lesson/secondary/math/l-mm6el08l"],
  ["/lesson/secondary/math/l-mm6el08l/", "/lesson/secondary/math/l-mm6el08l"],
  ["/stage/secondary", "/stage/high"],
  ["/index.html", "/"],
] as const) {
  const response = await fetch(origin + path, { redirect: "manual" });
  assert.equal(response.status, 301, path);
  assert.equal(new URL(response.headers.get("location")!, origin).href, origin + target);
}
assert.equal((await fetch(origin + "/api/admin/sitemap-info")).status, 401);
const robots = await (await fetch(origin + "/robots.txt")).text();
assert.ok(robots.includes("Sitemap: " + origin + "/sitemap.xml"));
assert.equal((await fetch(origin + "/hero-main.webp")).status, 200);
for (const variant of ["http://sharfedu.com", "http://www.sharfedu.com", "https://www.sharfedu.com"]) {
  const path = "/lesson/secondary/math/l-mm6el08l?seo-check=1";
  const response = await fetch(variant + path, { redirect: "manual" });
  assert.equal(response.status, 301, variant);
  assert.equal(response.headers.get("location"), origin + path, variant);
}
console.log(JSON.stringify({ passed: true, sitemapUrls: urls.length, results }, null, 2));
