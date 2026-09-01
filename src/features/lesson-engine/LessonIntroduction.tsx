import { AlertTriangle, ArrowLeft, Check, Lightbulb } from "lucide-react";
import type { LessonIntroductionDefinition } from "@shared/lesson-engine/types";
import { MathFormula } from "./MathFormula";

function regularPolygonPoints(sides: number, radius = 46, center = 60) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });
}

function PolygonExample({ label, sides, triangles, angleSum }: LessonIntroductionDefinition["examples"][number]) {
  const points = regularPolygonPoints(sides);
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const diagonals = points.slice(2, -1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28" role="img" aria-label={`${label} مقسم إلى ${triangles} ${triangles === 1 ? "مثلث" : "مثلثات"}`}>
        <polygon points={pointString} fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        {diagonals.map((point, index) => (
          <line key={index} x1={points[0].x} y1={points[0].y} x2={point.x} y2={point.y} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3" />
        ))}
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3" fill="#0f172a" />)}
      </svg>
      <h3 className="mt-2 font-black text-slate-950">{label}</h3>
      <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
        <span>{sides} أضلاع</span>
        <ArrowLeft className="h-4 w-4 text-amber-600" aria-hidden="true" />
        <span>{triangles} {triangles === 1 ? "مثلث" : "مثلثات"}</span>
      </div>
      <p className="mt-2 font-black tabular-nums text-cyan-800">{triangles} × 180° = {angleSum}°</p>
    </article>
  );
}

export function LessonIntroduction({ introduction }: { introduction: LessonIntroductionDefinition }) {
  return (
    <section className="rounded-3xl border border-cyan-200 bg-gradient-to-b from-cyan-50 to-white p-5 sm:p-7" aria-labelledby="lesson-introduction-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-800 text-white"><Lightbulb className="h-6 w-6" /></span>
        <div>
          <p className="text-sm font-black text-cyan-700">الفكرة الأساسية</p>
          <h2 id="lesson-introduction-heading" className="mt-1 text-2xl font-black leading-tight text-slate-950">{introduction.heading}</h2>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-lg leading-8 text-slate-800">
        {introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {introduction.foundationSteps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-cyan-100 bg-white p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 font-black text-cyan-800">{index + 1}</span>
            <h3 className="mt-3 text-lg font-black text-slate-950">{step.title}</h3>
            <p className="mt-2 leading-7 text-slate-700">{step.description}</p>
          </article>
        ))}
      </div>

      {introduction.examples.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {introduction.examples.map((example) => <PolygonExample key={example.sides} {...example} />)}
        </div>
      )}

      <div className="mt-5 flex gap-3 rounded-2xl bg-amber-50 p-4 leading-7 text-amber-950">
        <Check className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
        <p><strong>{introduction.takeawayLabel ?? "ما الذي نلاحظه؟"}</strong> {introduction.takeaway}</p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="formula-preview-heading">
          <p className="text-sm font-black text-violet-700">{introduction.formula.eyebrow ?? "معنى القانون، لا حفظه فقط"}</p>
          <h3 id="formula-preview-heading" className="mt-1 text-xl font-black text-slate-950">{introduction.formula.heading ?? "كل رمز يحكي جزءًا من الفكرة"}</h3>
          <MathFormula expression={introduction.formula.expression} label={introduction.formula.label} />
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {introduction.formula.parts.map((part) => (
              <div key={part.symbol} className="rounded-xl bg-slate-50 p-3">
                <dt className="font-black text-cyan-800" dir="ltr">{part.symbol}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-700">{part.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl bg-slate-950 p-5 text-white" aria-labelledby="intro-example-heading">
          <p className="text-sm font-black text-cyan-300">تطبيق أمامك خطوة بخطوة</p>
          <h3 id="intro-example-heading" className="mt-1 text-xl font-black">{introduction.workedExample.title}</h3>
          <ol className="mt-4 space-y-3">
            {introduction.workedExample.steps.map((step, index) => (
              <li key={step} className="flex gap-3 leading-7 text-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-cyan-200">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-xl bg-cyan-900/70 p-4 text-center text-xl font-black tabular-nums" dir="ltr">{introduction.workedExample.result}</p>
        </section>
      </div>

      <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 leading-7 text-rose-950">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
        <div>
          <p className="font-black">خطأ شائع: <span className="line-through" dir="ltr">{introduction.commonMistake.wrong}</span></p>
          <p className="mt-1">{introduction.commonMistake.correction}</p>
        </div>
      </div>
    </section>
  );
}
