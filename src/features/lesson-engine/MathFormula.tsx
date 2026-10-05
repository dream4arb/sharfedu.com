import { lazy, Suspense } from "react";
const RenderedMathFormula = lazy(() => import("./RenderedMathFormula"));

export function MathFormula({ expression, label }: { expression: string; label?: string }) {
  return (
    <Suspense fallback={<div className="my-5 min-h-[86px] rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-5 text-center text-xl text-slate-900 sm:text-2xl" dir="ltr" role="img" aria-label={label ?? expression}>{label ?? expression}</div>}>
      <RenderedMathFormula expression={expression} label={label} />
    </Suspense>
  );
}
