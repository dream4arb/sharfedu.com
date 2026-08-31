import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import type { TutorVisualAction } from "@shared/lesson-engine/types";

interface Point { x: number; y: number }

function polygonPoints(sides: number, radius = 112, center = 150): Point[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  });
}

export function PolygonLab({
  externalAction,
  onDiscovered,
}: {
  externalAction?: TutorVisualAction | null;
  onDiscovered?: (sides: number) => void;
}) {
  const [sides, setSides] = useState(5);
  const [split, setSplit] = useState(false);
  const points = useMemo(() => polygonPoints(sides), [sides]);
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const diagonals = points.slice(2, -1);

  useEffect(() => {
    if (!externalAction) return;
    setSides(externalAction.sides);
    setSplit(externalAction.split);
  }, [externalAction]);

  function chooseSides(nextSides: number) {
    setSides(nextSides);
    setSplit(false);
  }

  function divide() {
    setSplit(true);
    onDiscovered?.(sides);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="polygon-lab-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-cyan-700">سبورة تفاعلية</p>
          <h2 id="polygon-lab-title" className="mt-1 text-xl font-black text-slate-900">اكتشف عدد المثلثات</h2>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1" aria-label="اختر عدد أضلاع المضلع">
          {[5, 6, 7].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => chooseSides(count)}
              aria-pressed={sides === count}
              className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold transition sm:flex-none ${
                sides === count ? "bg-white text-cyan-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {count} أضلاع
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative mx-auto aspect-square w-full max-w-[390px] rounded-3xl bg-gradient-to-b from-cyan-50 to-white p-3">
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full"
            role="img"
            aria-labelledby="polygon-title polygon-desc"
          >
            <title id="polygon-title">مضلع مكوّن من {sides} أضلاع</title>
            <desc id="polygon-desc">
              {split ? `مقسّم من رأس واحد إلى ${sides - 2} مثلثات` : "اضغط زر تقسيم المضلع لإظهار المثلثات"}
            </desc>
            <polygon points={pointString} fill="#cffafe" stroke="#0e7490" strokeWidth="5" strokeLinejoin="round" />
            {split && diagonals.map((point, index) => (
              <line
                key={`${sides}-${index}`}
                x1={points[0].x}
                y1={points[0].y}
                x2={point.x}
                y2={point.y}
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength="1"
                className="sharaf-draw-line"
                style={{ animationDelay: `${index * 180}ms` }}
              />
            ))}
            {points.map((point, index) => (
              <g key={`point-${index}`}>
                <circle cx={point.x} cy={point.y} r="7" fill={index === 0 ? "#f59e0b" : "#0e7490"} />
                <text x={point.x} y={point.y - 13} textAnchor="middle" className="fill-slate-700 text-[13px] font-bold">
                  {index + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="rounded-2xl bg-slate-950 p-5 text-white" aria-live="polite">
          <p className="text-sm text-slate-300">عدد الأضلاع</p>
          <p className="mt-1 text-3xl font-black tabular-nums" dir="ltr">n = {sides}</p>
          {split ? (
            <div className="mt-5 space-y-2">
              <p className="text-sm text-amber-300">عدد المثلثات</p>
              <p className="text-3xl font-black tabular-nums" dir="ltr">{sides} - 2 = {sides - 2}</p>
              <p className="pt-2 text-lg font-bold tabular-nums" dir="ltr">{sides - 2} × 180° = {(sides - 2) * 180}°</p>
              <button type="button" onClick={() => setSplit(false)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 font-bold hover:bg-white/10">
                <RotateCcw className="h-4 w-4" /> أعد الرسم
              </button>
            </div>
          ) : (
            <button type="button" onClick={divide} data-testid="button-split-polygon" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 font-black text-slate-950 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">
              <Play className="h-5 w-5" /> قسّم المضلع
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
