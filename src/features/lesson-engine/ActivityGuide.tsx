import { useRef, type ReactNode, type SyntheticEvent } from "react";
import type { LessonActivity } from "./lessonActivities";

export function ActivityGuide({ activity, tried, onTry, children }: {
  activity: LessonActivity;
  tried: boolean;
  onTry: (stepId: string) => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  function recordInteraction(event: SyntheticEvent<HTMLDivElement>) {
    if (tried || !(event.target instanceof Element)) return;
    const control = event.target.closest("button, input[type='range'], [role='slider']");
    if (!control || !root.current?.contains(control) || control.matches(":disabled, [aria-disabled='true']")) return;
    // Re-selecting the default choice is not exploration; changing it is.
    if (control.getAttribute("aria-pressed") === "true" || control.getAttribute("aria-selected") === "true") return;
    onTry(activity.stepId);
  }

  return (
    <div ref={root} role="group" aria-label={`نشاط: ${activity.title}`} data-testid={`activity-${activity.stepId}`} data-activity-tried={tried}
      onClickCapture={recordInteraction} onChangeCapture={recordInteraction}>
      {children}
    </div>
  );
}
