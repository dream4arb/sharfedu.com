import katex from "katex";
import "katex/dist/katex.min.css";

export function MathFormula({ expression, label }: { expression: string; label?: string }) {
  const html = katex.renderToString(expression, {
    throwOnError: false,
    displayMode: true,
    strict: "ignore",
  });

  return (
    <div
      className="my-5 overflow-x-auto rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-5 text-center text-xl text-slate-900 sm:text-2xl"
      dir="ltr"
      role="img"
      aria-label={label ?? expression}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
