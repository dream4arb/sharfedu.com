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
  elementary: "دروس وشروحات المرحلة الابتدائية من الصف الأول إلى السادس. رياضيات، علوم، لغتي، إسلامية وغيرها - منصة شارف التعليمية.",
  middle: "دروس وشروحات المرحلة المتوسطة من الأول إلى الثالث متوسط. رياضيات، علوم، اجتماعيات وغيرها - منصة شارف التعليمية.",
  high: "دروس وشروحات المرحلة الثانوية والتحضير للجامعة. فيزياء، كيمياء، أحياء، رياضيات وغيرها - منصة شارف التعليمية.",
  paths: "المسارات الأكاديمية والتخصصية للمرحلة الثانوية - إدارة أعمال، علوم صحية، حاسب آلي - منصة شارف التعليمية.",
  qudurat: "تحضير شامل لاختبارات القدرات العامة والتحصيلي. تدريبات وأسئلة محلولة - منصة شارف التعليمية.",
};

const STAGE_KEYWORDS: Record<string, string> = {
  elementary: "المرحلة الابتدائية, رياضيات ابتدائي, علوم ابتدائي, لغتي, شارف, تعليم, السعودية",
  middle: "المرحلة المتوسطة, رياضيات متوسط, علوم متوسط, شارف, تعليم, السعودية",
  high: "المرحلة الثانوية, فيزياء, كيمياء, أحياء, رياضيات ثانوي, شارف, تعليم, السعودية",
  paths: "المسارات الثانوية, إدارة أعمال, علوم صحية, حاسب, شارف, السعودية",
  qudurat: "القدرات العامة, التحصيلي, اختبارات القدرات, تحضير القدرات, شارف, السعودية",
};

function applyDefaults(path: string) {
  if (path === "/") {
    setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/login") {
    setPageMeta("تسجيل الدخول", "سجّل دخولك إلى منصة شارف التعليمية للوصول إلى دروسك ومتابعة تقدمك الدراسي.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/register") {
    setPageMeta("إنشاء حساب جديد", "أنشئ حسابك المجاني على منصة شارف التعليمية وابدأ رحلتك التعليمية مع دروس تفاعلية لجميع المراحل.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/forgot-password") {
    setPageMeta("استعادة كلمة المرور", "استعد كلمة المرور الخاصة بحسابك على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/reset-password") {
    setPageMeta("إعادة تعيين كلمة المرور", "أدخل رمز التحقق وكلمة المرور الجديدة لإعادة تعيين حسابك.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/dashboard" || path === "/complete-profile") {
    setPageMeta("لوحة التحكم", "لوحة تحكم الطالب - تتبع التقدم والدروس والاختبارات على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/profile") {
    setPageMeta("الملف الشخصي", "إدارة ملفك الشخصي وإعدادات حسابك على منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin") {
    setPageMeta("لوحة تحكم الإدارة", "إدارة المحتوى والمستخدمين والإعدادات - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  const coursesMatch = path.match(/^\/courses\/(.+)$/);
  if (coursesMatch) {
    const gradeLevel = coursesMatch[1];
    const title = STAGE_TITLES[gradeLevel] || "المواد الدراسية";
    const desc = STAGE_DESCRIPTIONS[gradeLevel] || "اختر المادة وابدأ التعلم مع دروس تفاعلية وشروحات مبسّطة - منصة شارف التعليمية.";
    const kw = STAGE_KEYWORDS[gradeLevel] || DEFAULT_SEO.keywords;
    setPageMeta(title, desc, kw);
    return;
  }
  const stageMatch = path.match(/^\/stage\/(.+)$/);
  if (stageMatch) {
    const stageId = stageMatch[1];
    const title = STAGE_TITLES[stageId] || "المرحلة الدراسية";
    const desc = STAGE_DESCRIPTIONS[stageId] || "دروس وشروحات تفاعلية لجميع المواد الدراسية - منصة شارف التعليمية.";
    const kw = STAGE_KEYWORDS[stageId] || DEFAULT_SEO.keywords;
    setPageMeta(title, desc, kw);
    return;
  }
  if (path.startsWith("/lesson/")) {
    setPageMeta("الدرس", "شاهد الدرس والملخص والاختبارات التفاعلية - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/pdf-viewer") {
    setPageMeta("عرض ملف PDF", "عرض ملف الدرس أو الملخص بصيغة PDF - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  if (path === "/admin/pdf-extractor") {
    setPageMeta("استخراج PDF", "أدوات الإدارة - منصة شارف التعليمية.", DEFAULT_SEO.keywords);
    return;
  }
  setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
}

export function SeoHead() {
  const [pathname] = useLocation();

  useEffect(() => {
    const path = pathname || "/";

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
