import { useEffect, useRef, useState } from "react";
import {
  BookOpenText,
  Download,
  ExternalLink,
  Minus,
  Plus,
} from "lucide-react";
import type { CurriculumSourceDefinition } from "@shared/lesson-engine/types";

interface OfficialBookLessonProps {
  source: CurriculumSourceDefinition;
  lessonTitle: string;
  onPageViewed?: (pageNumber: number) => void;
}

const zoomLevels = [100, 125, 150];

export function OfficialBookLesson({ source, lessonTitle, onPageViewed }: OfficialBookLessonProps) {
  const excerpt = source.lessonExcerpt;
  const [zoomIndex, setZoomIndex] = useState(0);
  const pageListRef = useRef<HTMLDivElement>(null);
  const viewedPages = useRef(new Set<number>());
  const pageViewedCallback = useRef(onPageViewed);
  pageViewedCallback.current = onPageViewed;

  useEffect(() => {
    const pageList = pageListRef.current;
    if (!pageList || !excerpt) return;
    viewedPages.current.clear();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const pageNumber = Number((entry.target as HTMLElement).dataset.bookPage);
        if (viewedPages.current.has(pageNumber)) continue;
        viewedPages.current.add(pageNumber);
        pageViewedCallback.current?.(pageNumber);
      }
    }, { threshold: 0.1 });
    pageList.querySelectorAll("[data-book-page]").forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [excerpt]);

  if (!excerpt?.pages.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <BookOpenText className="mx-auto h-10 w-10 text-cyan-700" />
        <h1 className="mt-3 text-xl font-black text-slate-950">صفحات الكتاب قيد الربط</h1>
        <p className="mt-2 leading-7 text-slate-600">يمكنك فتح الكتاب المعتمد كاملًا من بوابة وزارة التعليم.</p>
        <a href={source.portalUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-800 px-5 font-black text-white">
          افتح المصدر الرسمي <ExternalLink className="h-5 w-5" />
        </a>
      </section>
    );
  }

  const pages = excerpt.pages;
  const zoom = zoomLevels[zoomIndex];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white" aria-labelledby="official-book-heading">
      <div className="grid grid-cols-1 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]" data-testid="official-book-toolbar">
        <h1 id="official-book-heading" className="min-w-0 text-center text-sm font-black leading-6 text-slate-900 md:col-start-2 md:row-start-1">صفحة درس {lessonTitle}</h1>

        <div className="flex items-center justify-self-center gap-2 md:col-start-3 md:row-start-1 md:justify-self-end" aria-label="تكبير صفحة الكتاب">
          <button type="button" onClick={() => setZoomIndex((index) => Math.max(0, index - 1))} disabled={zoomIndex === 0} aria-label="تصغير الصفحة" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-35"><Minus className="h-5 w-5" /></button>
          <span className="w-12 text-center text-sm font-black text-slate-700" dir="ltr">{zoom}%</span>
          <button type="button" onClick={() => setZoomIndex((index) => Math.min(zoomLevels.length - 1, index + 1))} disabled={zoomIndex === zoomLevels.length - 1} aria-label="تكبير الصفحة" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-35"><Plus className="h-5 w-5" /></button>
        </div>
      </div>

      <div ref={pageListRef} className="space-y-8 bg-slate-100 p-3 sm:space-y-10 sm:p-6" data-testid="official-book-page-viewer">
        {pages.map((page, index) => (
          <div key={page.pageNumber} className="overflow-x-auto rounded-2xl" data-testid={`book-page-${page.pageNumber}`}>
            <figure data-book-page={page.pageNumber} className="mx-auto overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm" style={{ width: `${zoom}%`, maxWidth: zoom === 100 ? "900px" : "none" }}>
              <figcaption className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">صفحة {page.pageNumber} <span className="mr-2 font-normal text-slate-500">· {index + 1} من {pages.length}</span></figcaption>
              <img
                src={page.imageUrl}
                alt={page.alt}
                width={1417}
                height={1826}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="block h-auto w-full bg-white"
              />
            </figure>
          </div>
        ))}
      </div>

      <section className="border-t border-slate-200 p-4 sm:p-5" data-testid="official-book-source-details" aria-labelledby="official-book-source-heading">
        <h2 id="official-book-source-heading" className="py-2 text-sm font-bold text-cyan-800">المصدر وملفات الكتاب</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-slate-800">{source.bookTitle}</p>
        <p className="mt-2 text-xs leading-6 text-slate-600">{excerpt.attribution}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a href={excerpt.pdfUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-center font-black text-white hover:bg-cyan-800">
            نسخة صفحات الدرس <Download className="h-5 w-5" />
          </a>
          <a href={excerpt.officialPdfUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-center font-black text-slate-800 hover:border-cyan-500 hover:text-cyan-800">
            الكتاب كاملًا من المصدر <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </section>
    </section>
  );
}
