import type { ReactNode } from "react";
import type { InteractiveLessonDefinition, LessonStepDefinition } from "@shared/lesson-engine/types";

/** Split the presentation without changing saved content IDs or lesson step indexes. */
export function buildLearningSections(lesson: InteractiveLessonDefinition, stepIndexes: number[]) {
  const sections: Array<{ step: LessonStepDefinition; index: number; content: "objectives" | "introduction" | "default"; sectionNumber: number }> = [];
  for (const index of stepIndexes) {
    const step = lesson.steps[index];
    if (step.type === "objectives") {
      sections.push({ step: { ...step, id: `${step.id}-objectives`, eyebrow: "الهدف من الدرس", title: "الهدف من الدرس" }, index, content: "objectives", sectionNumber: sections.length + 1 });
      sections.push({ step: { ...step, eyebrow: "شرح الدرس" }, index, content: "introduction", sectionNumber: sections.length + 1 });
    } else {
      sections.push({ step, index, content: "default", sectionNumber: sections.length + 1 });
    }
  }
  return sections;
}

/** Open, reusable lesson sections. Only this tab receives the studio theme. */
export function LearningSection({ step, index, sectionNumber, onFocus, children }: {
  step: LessonStepDefinition;
  index: number;
  sectionNumber: number;
  onFocus: () => void;
  children: ReactNode;
}) {
  return (
    <section id={`learning-section-${step.id}`} tabIndex={-1}
      aria-labelledby={`learning-title-${step.id}`} className="studio-section"
      data-testid={`learning-section-${step.id}`} onFocusCapture={onFocus}>
      <header className="studio-section-head" data-learning-step-index={index}>
        <div className="studio-section-meta" data-testid={`learning-meta-${step.id}`}>
          <span className="studio-section-number" aria-hidden="true">{sectionNumber}</span>
          <p className="studio-section-label">القسم {sectionNumber} · {step.eyebrow.replace(/^\d+\.\s*/, "")}</p>
        </div>
        <h2 id={`learning-title-${step.id}`} className="studio-section-title">{step.title}</h2>
      </header>
      <div className="studio-section-body">{children}</div>
    </section>
  );
}
