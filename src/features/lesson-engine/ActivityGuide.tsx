import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { Check, Hand } from "lucide-react";
import type { LessonActivity } from "./lessonActivities";

export function ActivityGuide({ activity, tried, onTry, children }: {
  activity: LessonActivity;
  tried: boolean;
  onTry: (stepId: string) => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const hasCued = useRef(false);
  const [cueActive, setCueActive] = useState(false);
  const instructionId = `activity-instruction-${activity.stepId}`;

  useEffect(() => {
    if (tried || hasCued.current || !root.current) return;
    // Draw attention to one useful control, not every button at once.
    const target = root.current.querySelector<HTMLElement>("[data-activity-primary]:not(:disabled)")
      ?? root.current.querySelector<HTMLElement>("button[aria-pressed='false']:not(:disabled)")
      ?? root.current.querySelector<HTMLElement>("button[aria-selected='false']:not(:disabled)")
      ?? root.current.querySelector<HTMLElement>("button:not(:disabled)");
    if (!target) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function illuminate() {
      if (hasCued.current) return;
      hasCued.current = true;
      setCueActive(true);
      target!.classList.add("sharaf-activity-glow");
      timer = setTimeout(() => {
        target!.classList.remove("sharaf-activity-glow");
        setCueActive(false);
      }, 2400);
    }
    const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      illuminate();
      observer?.disconnect();
    }, { threshold: 0.6 });
    if (observer) observer.observe(target);
    else illuminate();
    return () => {
      observer?.disconnect();
      if (timer) clearTimeout(timer);
      target.classList.remove("sharaf-activity-glow");
    };
  }, [tried]);

  function recordInteraction(event: SyntheticEvent<HTMLDivElement>) {
    if (tried || !(event.target instanceof Element)) return;
    const control = event.target.closest("button, input[type='range'], [role='slider']");
    if (!control || !root.current?.contains(control) || control.matches(":disabled, [aria-disabled='true']")) return;
    // Re-selecting the default choice is not exploration; changing it is.
    if (control.getAttribute("aria-pressed") === "true" || control.getAttribute("aria-selected") === "true") return;
    setCueActive(false);
    onTry(activity.stepId);
  }

  return (
    <div ref={root} data-testid={`activity-${activity.stepId}`} data-activity-tried={tried} data-activity-cue={!tried && cueActive ? "active" : "idle"}
      onClickCapture={recordInteraction} onChangeCapture={recordInteraction}>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3">
        <span role="status" className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${tried ? "bg-emerald-100 text-emerald-800" : "bg-cyan-800 text-white"}`}>
          {tried ? <Check className="h-4 w-4" aria-hidden="true" /> : <Hand className="h-4 w-4" aria-hidden="true" />}
          {tried ? "جرّبت النشاط" : "جرّب بنفسك"}
        </span>
        <p id={instructionId} className="min-w-0 flex-1 basis-52 text-sm font-bold leading-7 text-cyan-950">{activity.instruction}</p>
      </div>
      <div role="group" aria-describedby={instructionId} aria-label={`نشاط: ${activity.title}`}>{children}</div>
    </div>
  );
}
