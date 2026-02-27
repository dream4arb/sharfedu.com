import { useEffect } from "react";
import { useLocation } from "wouter";
import { setPageMeta, DEFAULT_SEO } from "@/lib/seo";

const STAGE_TITLES: Record<string, string> = {
  elementary: "المرحلة الابتدائية",
  middle: "المرحلة المتوسطة",
  high: "المرحلة الثانوية",
  paths: "المسارات",
  qudurat: "القدرات والتحصيلي",
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  elementary: "دروس ومواد المرحلة الابتدائية من الصف الأول إلى السادس - منصة شارف.",
  middle: "دروس ومواد المرحلة المتوسطة - منصة شارف التعليمية.",
  high: "دروس ومواد المرحلة الثانوية والتحضير للجامعة - منصة شارف.",
  paths: "المسارات الأكاديمية والتخصصية - منصة شارف.",
  qudurat: "تحضير اختبارات القدرات والتحصيلي - منصة شارف.",
};

/** تطبيق قيم افتراضية للـ SEO عند عدم وجود بيانات في قاعدة البيانات */
function applyDefaults(path: string) {
  if (path === "/") {
    setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/dashboard") {
    setPageMeta("لوحة التحكم", "لوحة تحكم الطالب - تتبع التقدم والدروس والاختبارات على منصة شارف.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin") {
    setPageMeta("لوحة تحكم الإدارة", "إدارة المحتوى والمستخدمين والإعدادات - منصة شارف.", DEFAULT_SEO.keywords);
    return;
  }
  const coursesMatch = path.match(/^\/courses\/(.+)$/);
  if (coursesMatch) {
    const gradeLevel = coursesMatch[1];
    const title = STAGE_TITLES[gradeLevel] || "المواد الدراسية";
    const desc = STAGE_DESCRIPTIONS[gradeLevel] || "اختر المادة وابدأ التعلم - منصة شارف.";
    setPageMeta(title, desc, DEFAULT_SEO.keywords);
    return;
  }
  const stageMatch = path.match(/^\/stage\/(.+)$/);
  if (stageMatch) {
    const stageId = stageMatch[1];
    const title = STAGE_TITLES[stageId] || "المرحلة الدراسية";
    const desc = STAGE_DESCRIPTIONS[stageId] || "منصة شارف التعليمية.";
    setPageMeta(title, desc, DEFAULT_SEO.keywords);
    return;
  }
  if (path.startsWith("/lesson/")) {
    setPageMeta("الدرس", "شاهد الدرس والملخص والاختبارات - منصة شارف.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/pdf-viewer") {
    setPageMeta("عرض PDF", "عرض الملف - منصة شارف.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin/pdf-extractor") {
    setPageMeta("استخراج PDF", "أدوات الإدارة - منصة شارف.", DEFAULT_SEO.keywords);
    return;
  }
  setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
}

/**
 * مكوّن SEO الديناميكي: يجلب البيانات من جدول seo_data ويحدّث الهيدر.
 * الأولوية: قاعدة البيانات → القيم الافتراضية.
 */
export function SeoHead() {
  const [pathname] = useLocation();

  useEffect(() => {
    const path = pathname || "/";

    fetch(`/api/seo?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        // استخدام بيانات من قاعدة البيانات إن وُجدت (title أو description)
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
