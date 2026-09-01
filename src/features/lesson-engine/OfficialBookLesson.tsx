import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Download,
  ExternalLink,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { CurriculumSourceDefinition } from "@shared/lesson-engine/types";

interface OfficialBookLessonProps {
  source: CurriculumSourceDefinition;
  onPageViewed?: (pageNumber: number) => void;
}

const zoomLevels = [100, 125, 150];

export function OfficialBookLesson({ source, onPageViewed }: OfficialBookLessonProps) {
  const excerpt = source.lessonExcerpt;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);

  if (!excerpt?.pages.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <BookOpenText className="mx-auto h-10 w-10 text-cyan-700" />
        <h2 className="mt-3 text-xl font-black text-slate-950">صفحات الكتاب قيد الربط</h2>
        <p className="mt-2 leading-7 text-slate-600">يمكنك فتح الكتاب المعتمد كاملًا من بوابة وزارة التعليم.</p>
        <a href={source.portalUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-800 px-5 font-black text-white">
          افتح المصدر الرسمي <ExternalLink className="h-5 w-5" />
        </a>
      </section>
    );
  }

  const pages = excerpt.pages;
  const selectedPage = pages[selectedIndex];
  const zoom = zoomLevels[zoomIndex];

  function selectPage(index: number) {
    const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
    setSelectedIndex(nextIndex);
    onPageViewed?.(pages[nextIndex].pageNumber);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white" aria-labelledby="official-book-heading">
      <div className="border-b border-slate-200 bg-gradient-to-l from-emerald-50 via-white to-cyan-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <BookOpenText className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-black text-emerald-700">المرجع الرسمي للدرس</p>
              <h2 id="official-book-heading" className="mt-1 text-xl font-black leading-8 text-slate-950">{source.bookTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">الصفحات {source.lessonPages?.[0]}–{source.lessonPages?.at(-1)} · {pages.length} صفحات تشمل الشرح والأمثلة والتدريبات</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800">
            <ShieldCheck className="h-4 w-4" /> مصدر وزارة التعليم
          </span>
        </div>
        <p className="mt-4 rounded-2xl border border-emerald-100 bg-white/80 p-3 text-sm leading-7 text-slate-700">{excerpt.attribution}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2" aria-label="التنقل بين صفحات الدرس">
          <button type="button" onClick={() => selectPage(selectedIndex - 1)} disabled={selectedIndex === 0} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 disabled:opacity-35">
            <ArrowRight className="h-4 w-4" /> السابقة
          </button>
          <span className="min-w-24 text-center text-sm font-black text-slate-700" aria-live="polite">صفحة {selectedPage.pageNumber}</span>
          <button type="button" onClick={() => selectPage(selectedIndex + 1)} disabled={selectedIndex === pages.length - 1} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 disabled:opacity-35">
            التالية <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2" aria-label="تكبير صفحة الكتاب">
          <button type="button" onClick={() => setZoomIndex((index) => Math.max(0, index - 1))} disabled={zoomIndex === 0} aria-label="تصغير الصفحة" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-35"><Minus className="h-5 w-5" /></button>
          <span className="w-14 text-center text-sm font-black text-slate-700" dir="ltr">{zoom}%</span>
          <button type="button" onClick={() => setZoomIndex((index) => Math.min(zoomLevels.length - 1, index + 1))} disabled={zoomIndex === zoomLevels.length - 1} aria-label="تكبير الصفحة" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-35"><Plus className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="overflow-auto bg-slate-200/70 p-3 sm:p-5" data-testid="official-book-page-viewer">
        <figure className="mx-auto" style={{ width: `${zoom}%`, maxWidth: zoom === 100 ? "900px" : "none" }}>
          <img
            key={selectedPage.imageUrl}
            src={selectedPage.imageUrl}
            alt={selectedPage.alt}
            width={1417}
            height={1826}
            decoding="async"
            className="h-auto w-full rounded-xl bg-white shadow-lg ring-1 ring-slate-300"
          />
          <figcaption className="sr-only">{selectedPage.alt}</figcaption>
        </figure>
      </div>

      <div className="border-t border-slate-200 p-4 sm:p-5">
        <ul className="flex gap-3 overflow-x-auto pb-2" aria-label="صفحات درس زوايا المضلع">
          {pages.map((page, index) => (
            <li key={page.pageNumber} className="shrink-0">
              <button
                type="button"
                onClick={() => selectPage(index)}
                aria-current={index === selectedIndex ? "page" : undefined}
                aria-label={`اعرض صفحة ${page.pageNumber}`}
                className={`w-20 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${index === selectedIndex ? "border-cyan-700 ring-4 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}
              >
                <img src={page.imageUrl} alt="" loading="lazy" width={70} height={90} className="aspect-[.776] w-full rounded-md object-cover object-top" />
                <span className="mt-1 block text-xs font-black text-slate-700">ص {page.pageNumber}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a href={excerpt.pdfUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-center font-black text-white hover:bg-cyan-800">
            نسخة صفحات الدرس <Download className="h-5 w-5" />
          </a>
          <a href={excerpt.officialPdfUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-center font-black text-slate-800 hover:border-cyan-500 hover:text-cyan-800">
            الكتاب كاملًا من المصدر <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
