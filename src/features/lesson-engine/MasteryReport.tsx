import { CheckCircle2, RefreshCcw, Target } from "lucide-react";
import type { InteractiveLessonDefinition, SkillMasterySnapshot } from "@shared/lesson-engine/types";

function masteryLabel(score: number) {
  if (score >= 85) return "متقن";
  if (score >= 65) return "جيد — يحتاج تثبيتًا";
  return "يحتاج مراجعة";
}

function masteryColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-amber-500";
  return "bg-rose-500";
}

export function MasteryReport({
  lesson,
  mastery,
  onReview,
}: {
  lesson: InteractiveLessonDefinition;
  mastery: SkillMasterySnapshot[];
  onReview: (skillId: string) => void;
}) {
  const enriched = lesson.skills.map((skill) => ({
    ...skill,
    snapshot: mastery.find((item) => item.skillId === skill.id) ?? { skillId: skill.id, score: 0, attempts: 0, correctAttempts: 0, hintsUsed: 0 },
  }));
  const overall = Math.round(enriched.reduce((total, item) => total + item.snapshot.score, 0) / enriched.length);
  const weakest = [...enriched].sort((a, b) => a.snapshot.score - b.snapshot.score)[0];
  const allMastered = enriched.every((item) => item.snapshot.score >= 85);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-cyan-300"><CheckCircle2 className="h-5 w-5" /> أكملت درس زوايا المضلع</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">مستوى الإتقان الحالي</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-300">هذا التقرير مبني على إجاباتك في اختبار الدرس وعدد المحاولات في كل مهارة.</p>
          </div>
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-cyan-400/25 bg-white/5">
            <div className="text-center"><span className="block text-4xl font-black tabular-nums">{overall}%</span><span className="text-xs text-slate-300">الإجمالي</span></div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <h3 className="flex items-center gap-2 text-xl font-black text-slate-900"><Target className="h-6 w-6 text-cyan-700" /> تفاصيل المهارات</h3>
        <div className="mt-5 space-y-5">
          {enriched.map(({ id, title, description, snapshot }) => (
            <div key={id}>
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-black text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>
                <span className="shrink-0 text-lg font-black tabular-nums text-slate-900">{snapshot.score}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`إتقان ${title}`} aria-valuenow={snapshot.score} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full transition-all ${masteryColor(snapshot.score)}`} style={{ width: `${snapshot.score}%` }} />
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">{masteryLabel(snapshot.score)}</p>
            </div>
          ))}
        </div>
      </section>

      {allMastered ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <p className="text-sm font-bold text-emerald-700">توصية شارف</p>
          <h3 className="mt-1 text-xl font-black text-emerald-950">أحسنت، أتقنت مهارات الدرس</h3>
          <p className="mt-2 leading-7 text-emerald-900">يمكنك الانتقال إلى الدرس التالي، والعودة إلى الخريطة البصرية متى احتجت إلى مراجعة سريعة.</p>
        </section>
      ) : (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-sm font-bold text-amber-700">توصية شارف</p>
          <h3 className="mt-1 text-xl font-black text-amber-950">راجع: {weakest.title}</h3>
          <p className="mt-2 leading-7 text-amber-900">{weakest.description}</p>
          <button type="button" onClick={() => onReview(weakest.id)} className="mt-4 flex min-h-12 items-center gap-2 rounded-xl bg-amber-400 px-5 font-black text-slate-950 hover:bg-amber-300">
            <RefreshCcw className="h-5 w-5" /> راجع هذه المهارة
          </button>
        </section>
      )}
    </div>
  );
}
