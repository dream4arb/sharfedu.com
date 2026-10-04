import { AlertTriangle, Check } from "lucide-react";
import type { LessonIntroductionDefinition } from "@shared/lesson-engine/types";
import { PolygonExample } from "./LessonIntroduction";
import { MathFormula } from "./MathFormula";

/** Presentation only: all facts, examples and explanations come from lesson content. */
export function StudioLessonIntroduction({ introduction }: { introduction: LessonIntroductionDefinition }) {
  return (
    <div className="studio-introduction">
      <div className={`studio-intro-layout ${introduction.examples.length ? "studio-intro-with-examples" : ""}`}>
        <section aria-labelledby="lesson-introduction-heading" className="studio-narrative">
          <p className="studio-kicker">الفكرة الأساسية</p>
          <h2 id="lesson-introduction-heading">{introduction.heading}</h2>
          <div className="studio-prose">{introduction.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
        </section>
        {introduction.examples.length > 0 && <div className="studio-examples" aria-label="من المثلث إلى المضلع">
          {introduction.examples.map(example => <PolygonExample key={example.sides} {...example} />)}
        </div>}
      </div>

      <ol className="studio-foundations">
        {introduction.foundationSteps.map((step, index) => <li key={step.title}>
          <span className="studio-foundation-number">{index + 1}</span>
          <div><h3>{step.title}</h3><p>{step.description}</p></div>
        </li>)}
      </ol>
      <div className="studio-takeaway"><Check aria-hidden="true" /><p><strong>{introduction.takeawayLabel ?? "ما الذي نلاحظه؟"}</strong> {introduction.takeaway}</p></div>

      <div className="studio-concept-grid">
        <section className="studio-formula-sheet" aria-labelledby="formula-preview-heading">
          <p className="studio-kicker">{introduction.formula.eyebrow ?? "معنى القانون، لا حفظه فقط"}</p>
          <h3 id="formula-preview-heading">{introduction.formula.heading ?? "كل رمز يحكي جزءًا من الفكرة"}</h3>
          <MathFormula expression={introduction.formula.expression} label={introduction.formula.label} />
          <dl className="studio-definitions">{introduction.formula.parts.map(part => <div key={part.symbol}>
            <dt dir="ltr">{part.symbol}</dt><dd>{part.meaning}</dd>
          </div>)}</dl>
        </section>
        <section className="studio-worked-example" aria-labelledby="intro-example-heading">
          <p className="studio-kicker">تطبيق أمامك خطوة بخطوة</p>
          <h3 id="intro-example-heading">{introduction.workedExample.title}</h3>
          <ol>{introduction.workedExample.steps.map((step, index) => <li key={step}>
            <span>{index + 1}</span><p>{step}</p>
          </li>)}</ol>
          <p className="studio-example-result" dir="ltr">{introduction.workedExample.result}</p>
        </section>
      </div>
      <div className="studio-mistake"><AlertTriangle aria-hidden="true" /><div>
        <p><strong>خطأ شائع:</strong> <span className="line-through" dir="ltr">{introduction.commonMistake.wrong}</span></p>
        <p>{introduction.commonMistake.correction}</p>
      </div></div>
    </div>
  );
}
