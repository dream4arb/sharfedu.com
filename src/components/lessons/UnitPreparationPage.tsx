import { ArrowLeft, Check, Compass, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { unitPreparationIntroductions } from "./unitPreparationIntroduction";

export default function UnitPreparationPage({ unitNumber, unitName, firstLessonHref, firstLessonTitle }: {
  unitNumber: number; unitName: string; firstLessonHref?: string; firstLessonTitle?: string;
}) {
  const introduction = unitPreparationIntroductions[unitNumber];
  return <section className="space-y-6" dir="rtl" data-testid="unit-preparation-page">
    <header className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 text-center dark:border-amber-900 dark:bg-amber-950/20">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Compass aria-hidden="true" /></span>
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">الوحدة {unitNumber} · التهيئة للوحدة</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold">{unitName}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">تعرّف الفكرة الأساسية للوحدة قبل أن تبدأ دروسها.</p>
    </header>
    {introduction && <>
      <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="preparation-idea-title" data-testid="preparation-main-idea">
        <h3 id="preparation-idea-title" className="flex items-center gap-2 text-xl font-bold"><Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />الفكرة الأساسية</h3>
        <p className="mt-4 text-base leading-8 sm:leading-9">{introduction.idea}</p>
      </section>
      <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="preparation-learning-title">
        <h3 id="preparation-learning-title" className="text-lg font-bold">ما الذي ستتعلمه في هذه الوحدة؟</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 list-none p-0">{introduction.learning.map(point => <li key={point} className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-7">
          <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><span>{point}</span>
        </li>)}</ul>
      </section>
      <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="preparation-application-title">
        <h3 id="preparation-application-title" className="text-lg font-bold">لماذا ندرس هذه الوحدة؟</h3>
        <p className="mt-3 text-base leading-8">{introduction.application}</p>
      </section>
      <p className="text-center text-xs leading-6 text-muted-foreground" data-testid="preparation-source">شرح مبسط مستند إلى مقدمة الوحدة في كتاب {introduction.book}، صفحة {introduction.page}.</p>
    </>}
    {firstLessonHref && <div className="text-center"><Link href={firstLessonHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-semibold" data-testid="button-start-unit">
      ابدأ أول درس{firstLessonTitle ? `: ${firstLessonTitle}` : ""}<ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link></div>}
  </section>;
}
