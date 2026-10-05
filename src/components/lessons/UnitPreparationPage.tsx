import { useState } from "react";
import { ArrowLeft, Check, Compass } from "lucide-react";
import { Link } from "wouter";
import { unitPreparationReviews } from "./unitPreparationReview";

export default function UnitPreparationPage({ unitNumber, unitName, firstLessonHref, firstLessonTitle }: {
  unitNumber: number; unitName: string; firstLessonHref?: string; firstLessonTitle?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const review = unitPreparationReviews[unitNumber];
  return <section className="space-y-6" dir="rtl" data-testid="unit-preparation-page">
    <header className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 text-center dark:border-amber-900 dark:bg-amber-950/20">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Compass aria-hidden="true" /></span>
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">الوحدة {unitNumber} · التهيئة للوحدة</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold">{unitName}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">مراجعة سريعة لما تحتاجه قبل البدء. هذه التهيئة دون درجات، ولا تدخل في نسبة إنجاز الدروس.</p>
    </header>
    {review && <>
      <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="preparation-review-title">
        <h3 id="preparation-review-title" className="text-lg font-bold">تذكّر قبل أن تبدأ</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 list-none p-0">{review.reminders.map(reminder => <li key={reminder} className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-7">
          <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><span>{reminder}</span>
        </li>)}</ul>
      </section>
      <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="preparation-practice-title">
        <h3 id="preparation-practice-title" className="text-lg font-bold">جرّب بلا درجات</h3>
        <p className="mt-2 text-sm text-muted-foreground">أسئلة تمهيدية من إعداد منصة شارف؛ يمكنك تغيير إجابتك بحرية.</p>
        <div className="mt-5 space-y-6">{review.questions.map((question, index) => {
          const selected = answers[index];
          const answered = selected !== undefined;
          return <fieldset key={question.prompt} className="min-w-0 space-y-3" data-testid={`preparation-question-${index + 1}`}>
            <legend className="font-semibold text-sm sm:text-base leading-7">{question.prompt}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{question.options.map((option, optionIndex) => <button key={option} type="button"
              aria-pressed={selected === optionIndex} onClick={() => setAnswers(previous => ({ ...previous, [index]: optionIndex }))}
              className={`min-h-12 rounded-xl border px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected === optionIndex ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
              {option}
            </button>)}</div>
            {answered && <p role="status" className={`rounded-xl p-3 text-sm leading-7 ${selected === question.correct ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"}`}>
              {selected === question.correct ? "صحيح. " : "راجع الفكرة: "}{question.explanation}
            </p>}
          </fieldset>;
        })}</div>
      </section>
    </>}
    {firstLessonHref && <div className="text-center"><Link href={firstLessonHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-semibold" data-testid="button-start-unit">
      ابدأ أول درس{firstLessonTitle ? `: ${firstLessonTitle}` : ""}<ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link></div>}
  </section>;
}
