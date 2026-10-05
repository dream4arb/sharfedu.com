import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { setPageMeta, DEFAULT_SEO } from "@/lib/seo";

export function SeoHead() {
  const [pathname] = useLocation();
  const search = useSearch();
  useEffect(() => {
    const controller = new AbortController();
    const path = (pathname || "/") + (search ? `?${search}` : "");
    // Keep the authoritative initial HTML metadata while the request is pending.
    // Reset only after client navigation to a different page/grade.
    const canonicalHref = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const currentCanonical = canonicalHref ? new URL(canonicalHref) : null;
    const grade = new URLSearchParams(search).get("grade") || "1";
    if (!currentCanonical || currentCanonical.pathname !== pathname ||
        (currentCanonical.searchParams.get("grade") || "1") !== grade) {
      setPageMeta({ ...DEFAULT_SEO, robots: "noindex, follow", structuredData: [] });
    }
    fetch(`/api/seo?path=${encodeURIComponent(path)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("SEO unavailable"); return r.json(); })
      .then(data => { if (!controller.signal.aborted) setPageMeta(data); })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname, search]);
  return null;
}
