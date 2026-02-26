import { useState, useEffect } from "react";

export interface CmsTabContent {
  contentType: string;
  dataValue: string;
}

/**
 * جلب محتوى التبويب من جدول cms_content حسب lesson_id و tab_type
 */
export function useCmsTabContent(lessonId: string | undefined, tabType: string) {
  const [content, setContent] = useState<CmsTabContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId || !tabType) {
      setContent(null);
      return;
    }

    setLoading(true);
    fetch(`/api/content/lesson/${encodeURIComponent(lessonId)}/tab/${encodeURIComponent(tabType)}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        setContent(data && data.dataValue ? data : null);
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [lessonId, tabType]);

  return { content, loading };
}
