import { useEffect } from "react";
import { useLocation } from "wouter";
import { setPageMeta, DEFAULT_SEO } from "@/lib/seo";

const PAGES_WITH_OWN_SEO = ["/", "/stage/", "/lesson/"];

function applyDefaults(path: string) {
  if (path === "/dashboard") {
    setPageMeta("لوحة التحكم", "لوحة تحكم الطالب - تتبع التقدم والدروس والاختبارات على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin") {
    setPageMeta("لوحة تحكم الإدارة", "إدارة المحتوى والمستخدمين والإعدادات - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/pdf-viewer") {
    setPageMeta("عرض PDF", "عرض الملف - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin/pdf-extractor") {
    setPageMeta("استخراج PDF", "أدوات الإدارة - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/login" || path === "/register") {
    setPageMeta("تسجيل الدخول", "سجل دخولك أو أنشئ حساباً جديداً على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/profile") {
    setPageMeta("الملف الشخصي", "إدارة بياناتك الشخصية والاشتراك على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
}

export function SeoHead() {
  const [pathname] = useLocation();

  useEffect(() => {
    const path = pathname || "/";
    const managedByPage = PAGES_WITH_OWN_SEO.some((p) => p === path || (p.endsWith("/") && path.startsWith(p)));
    if (managedByPage) return;

    fetch(`/api/seo?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.title || data.description)) {
          setPageMeta({
            title: data.title || DEFAULT_SEO.title,
            description: data.description || DEFAULT_SEO.description,
            keywords: data.keywords || DEFAULT_SEO.keywords,
            ogTitle: data.ogTitle,
            ogDescription: data.ogDescription,
            ogImage: data.ogImage,
          });
        } else {
          applyDefaults(path);
        }
      })
      .catch(() => applyDefaults(path));
  }, [pathname]);

  return null;
}
