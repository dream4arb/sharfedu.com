import { sitemapPaths } from "../seo/model";

/** Served dynamically from the live hierarchy and publication registry.
 * CMS saves must never replace the sitemap with a stale static file. */
export async function generateSitemapFiles(): Promise<{ totalUrls: number; writtenTo: string[] }> {
  return { totalUrls: sitemapPaths().length, writtenTo: ["dynamic:/sitemap.xml"] };
}
