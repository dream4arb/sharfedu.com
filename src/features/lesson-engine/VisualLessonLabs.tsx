import { useMemo, useState } from "react";
import { Check, ChevronLeft, Play, RotateCcw, Route, Shapes, Sparkles } from "lucide-react";

interface Point { x: number; y: number }

function polygonPoints(sides: number, radius = 96, centerX = 140, centerY = 120): Point[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function PolygonDrawing({ sides, split, highlightedVertices = 0 }: { sides: number; split: boolean; highlightedVertices?: number }) {
  const points = useMemo(() => polygonPoints(sides), [sides]);
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const diagonals = points.slice(2, -1);

  return (
    <svg viewBox="0 0 280 240" className="h-full w-full" role="img" aria-label={`مضلع من ${sides} أضلاع${split ? ` مقسّم إلى ${sides - 2} ${sides - 2 === 1 ? "مثلث" : "مثلثات"}` : ""}`}>
      <polygon points={pointString} fill="#ecfeff" stroke="#0e7490" strokeWidth="5" strokeLinejoin="round" />
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
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
      {points.map((point, index) => (
        <circle
          key={`vertex-${index}`}
          cx={point.x}
          cy={point.y}
          r={index < highlightedVertices ? 9 : 6}
          fill={index < highlightedVertices || index === 0 ? "#f59e0b" : "#0e7490"}
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
}

const polygonNames: Record<number, string> = {
  3: "مثلث",
  4: "رباعي",
  5: "خماسي",
  6: "سداسي",
  7: "سباعي",
  8: "ثماني",
};

export function PolygonPatternExplorer() {
  const [sides, setSides] = useState(3);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="pattern-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800"><Shapes className="h-6 w-6" /></span>
        <div>
          <p className="text-sm font-black text-cyan-700">تعلّم باللمس والمشاهدة</p>
          <h2 id="pattern-title" className="mt-1 text-xl font-black text-slate-950">كل ضلع جديد يصنع مثلثًا جديدًا</h2>
          <p className="mt-2 leading-7 text-slate-600">المس الأشكال بالترتيب، ولاحظ كيف يكبر المضلع ويظهر داخله مثلث إضافي.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="الأشكال المتاحة">
        {[3, 4, 5].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setSides(count)}
            aria-pressed={sides === count}
            className={`min-h-14 rounded-2xl border-2 px-2 text-sm font-black transition ${sides === count ? "border-cyan-700 bg-cyan-50 text-cyan-900 ring-4 ring-cyan-100" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300"}`}
          >
            {polygonNames[count]}
          </button>
        ))}
      </div>

      <div className="mt-5 grid items-center gap-5 rounded-3xl bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_250px]">
        <div className="mx-auto aspect-[7/6] w-full max-w-[430px]">
          <PolygonDrawing sides={sides} split />
        </div>
        <div className="rounded-2xl bg-slate-950 p-5 text-white" aria-live="polite">
          <p className="text-sm font-bold text-cyan-200">ما يظهر أمامك</p>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3">
            <span>الأضلاع</span><strong className="text-2xl tabular-nums">{sides}</strong>
          </div>
          <div className="my-2 text-center text-amber-300">ينقص اثنان</div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-400 p-3 text-slate-950">
            <span>المثلثات</span><strong className="text-2xl tabular-nums">{sides - 2}</strong>
          </div>
          <p className="mt-4 text-center text-lg font-black" dir="ltr">{sides} - 2 = {sides - 2}</p>
        </div>
      </div>
    </section>
  );
}

export function FormulaDiscoveryLab() {
  const [sides, setSides] = useState(5);
  const [stage, setStage] = useState(0);
  const triangles = sides - 2;
  const sum = triangles * 180;
  const stageLabels = ["قسّم الشكل", "عدّ المثلثات", "حوّلها إلى درجات"];

  function chooseSides(nextSides: number) {
    setSides(nextSides);
    setStage(0);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="formula-lab-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-cyan-700">ابنِ القانون بيدك</p>
          <h2 id="formula-lab-title" className="mt-1 text-xl font-black text-slate-950">من عدد الأضلاع إلى مجموع الزوايا</h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">اختر مضلعًا، ثم تقدّم في التحول البصري خطوة خطوة.</p>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1" role="group" aria-label="اختيار عدد الأضلاع">
          {[5, 6, 7, 8].map((count) => (
            <button key={count} type="button" onClick={() => chooseSides(count)} aria-pressed={sides === count} className={`min-h-11 rounded-xl px-3 text-sm font-black ${sides === count ? "bg-white text-cyan-800 shadow-sm" : "text-slate-600"}`}>{count}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl bg-gradient-to-b from-cyan-50 to-white p-3">
          <div className="mx-auto aspect-[7/6] w-full max-w-[430px]">
            <PolygonDrawing sides={sides} split={stage >= 1} />
          </div>
        </div>

        <div className="space-y-3" aria-live="polite">
          <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${stage >= 0 ? "border-cyan-300 bg-cyan-50" : "border-slate-200"}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-800 font-black text-white">{sides}</span>
            <span><strong className="block text-slate-950">عدد الأضلاع</strong><span className="text-sm text-slate-600">هذه قيمة n</span></span>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${stage >= 1 ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
            <span className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 font-black ${stage >= 1 ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-500"}`} dir="ltr">{stage >= 1 ? "− 2" : "…"}</span>
            <span><strong className="block">{stage >= 1 ? "ننقص 2 من n" : "تظهر بعد تقسيم الشكل"}</strong><span className="text-sm">{stage >= 1 ? "الضلعان المجاوران للرأس يحدّان أول وآخر مثلث" : ""}</span></span>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${stage >= 2 ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
            <span className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 font-black text-white ${stage >= 2 ? "bg-violet-700" : "bg-slate-300"}`}>{stage >= 2 ? triangles : "؟"}</span>
            <span><strong className="block">{stage >= 2 ? "عدد المثلثات" : "ثم نعدّ المثلثات"}</strong>{stage >= 2 && <span className="text-sm" dir="ltr">{sides} − 2 = {triangles}</span>}</span>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border p-4 transition ${stage >= 3 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
            <span className={`flex h-10 min-w-16 items-center justify-center rounded-xl px-2 font-black text-white ${stage >= 3 ? "bg-emerald-700" : "bg-slate-300"}`} dir="ltr">{stage >= 3 ? "× 180°" : "…"}</span>
            <span><strong className="block">{stage >= 3 ? "المجموع النهائي" : "وأخيرًا نحوّلها إلى درجات"}</strong>{stage >= 3 && <span className="text-lg font-black tabular-nums" dir="ltr">{triangles} × 180° = {sum}°</span>}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-slate-950 p-4 text-white sm:flex-row">
        <div className="text-center sm:text-right">
          <p className="text-sm font-bold text-cyan-200" dir="ltr">S = (n − 2) × 180°</p>
          <p className="mt-1 font-black" dir="ltr">S = ({sides} − 2) × 180° {stage === 3 ? `= ${sum}°` : ""}</p>
        </div>
        {stage < 3 ? (
          <button type="button" onClick={() => setStage((value) => Math.min(3, value + 1))} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 font-black text-slate-950 sm:w-auto"><Play className="h-5 w-5" />{stageLabels[stage]}</button>
        ) : (
          <button type="button" onClick={() => setStage(0)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 font-black sm:w-auto"><RotateCcw className="h-5 w-5" />أعد المشهد</button>
        )}
      </div>
    </section>
  );
}

export function MissingAngleLab() {
  const [stage, setStage] = useState(0);
  const labels = ["أظهر الزوايا المعروفة", "اجمع القطع", "أكمل الدائرة"];
  const known = [
    { value: 135, color: "bg-cyan-600" },
    { value: 90, color: "bg-violet-600" },
    { value: 90, color: "bg-amber-500" },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="missing-angle-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800"><Sparkles className="h-6 w-6" /></span>
        <div>
          <p className="text-sm font-black text-violet-700">مثال يتحرك أمامك</p>
          <h2 id="missing-angle-title" className="mt-1 text-xl font-black text-slate-950">املأ 360° ثم شاهد الجزء المتبقي</h2>
          <p className="mt-2 leading-7 text-slate-600">الزاوية المجهولة ليست رقمًا نحفظه؛ إنها المساحة التي لم تملأها الزوايا المعروفة.</p>
        </div>
      </div>

      <div className="mt-5 grid items-center gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-3">
          <svg viewBox="0 0 290 260" className="mx-auto aspect-[29/26] w-full max-w-[430px]" role="img" aria-label="رباعي زواياه تسعون وتسعون ومئة وخمس وثلاثون وزاوية مجهولة">
            <polygon points="45,220 245,220 145,120 45,120" fill="#f5f3ff" stroke="#6d28d9" strokeWidth="5" strokeLinejoin="round" />
            <path d="M 45 190 A 30 30 0 0 1 75 220 L 45 220 Z" fill={stage >= 1 ? "#f59e0b" : "#e2e8f0"} />
            <path d="M 166.2 141.2 A 30 30 0 0 1 115 120 L 145 120 Z" fill={stage >= 1 ? "#0891b2" : "#e2e8f0"} />
            <path d="M 75 120 A 30 30 0 0 1 45 150 L 45 120 Z" fill={stage >= 1 ? "#7c3aed" : "#e2e8f0"} />
            <path d="M 215 220 A 30 30 0 0 1 223.8 198.8 L 245 220 Z" fill={stage >= 3 ? "#059669" : "#ffffff"} stroke="#059669" strokeWidth="3" />
            <text x="68" y="198" textAnchor="middle" className={`${stage >= 1 ? "fill-white" : "fill-slate-700"} text-[16px] font-black`}>90°</text>
            <text x="145" y="153" textAnchor="middle" className={`${stage >= 1 ? "fill-white" : "fill-slate-700"} text-[16px] font-black`}>135°</text>
            <text x="68" y="145" textAnchor="middle" className={`${stage >= 1 ? "fill-white" : "fill-slate-700"} text-[16px] font-black`}>90°</text>
            <text x="217" y="199" textAnchor="middle" className={`text-[18px] font-black ${stage >= 3 ? "fill-white" : "fill-emerald-700"}`}>{stage >= 3 ? "45°" : "؟"}</text>
          </svg>
        </div>

        <div>
          <p className="text-sm font-black text-slate-600">شريط مجموع زوايا الرباعي</p>
          <div className="mt-3 overflow-hidden rounded-2xl border-4 border-slate-100 bg-slate-200" dir="ltr" aria-label={stage >= 3 ? "اكتمل المجموع إلى 360 درجة" : "الزوايا المعروفة تساوي 315 درجة"}>
            <div className="flex h-20 w-full">
              {known.map((angle, index) => (
                <div key={`${angle.value}-${index}`} className={`${stage >= 1 ? angle.color : "bg-slate-300"} flex items-center justify-center border-r border-white/40 font-black text-white transition-colors duration-500`} style={{ width: `${(angle.value / 360) * 100}%` }}>{stage >= 1 ? `${angle.value}°` : ""}</div>
              ))}
              <div className={`${stage >= 3 ? "bg-emerald-600" : "bg-white"} flex items-center justify-center font-black transition-colors duration-500`} style={{ width: `${(45 / 360) * 100}%` }}><span className={stage >= 3 ? "text-white" : "text-emerald-700"}>{stage >= 3 ? "45°" : "؟"}</span></div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-center text-white" aria-live="polite">
            {stage === 0 && <p className="font-bold text-slate-300">ابدأ بإظهار الزوايا التي نعرفها.</p>}
            {stage === 1 && <p className="text-xl font-black" dir="ltr">135° + 90° + 90°</p>}
            {stage === 2 && <><p className="text-sm text-slate-300">الممتلئ من الشريط</p><p className="mt-1 text-3xl font-black" dir="ltr">315°</p></>}
            {stage === 3 && <><p className="text-sm text-emerald-300">المتبقي هو الزاوية المجهولة</p><p className="mt-1 text-3xl font-black" dir="ltr">360° − 315° = 45°</p></>}
          </div>

          <button type="button" onClick={() => stage < 3 ? setStage(stage + 1) : setStage(0)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 font-black text-white hover:bg-violet-800">
            {stage < 3 ? <><Play className="h-5 w-5" />{labels[stage]}</> : <><RotateCcw className="h-5 w-5" />أعد المشهد</>}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ExteriorTurnLab() {
  const [sides, setSides] = useState(4);
  const [turns, setTurns] = useState(0);
  const angle = 360 / sides;

  function chooseSides(nextSides: number) {
    setSides(nextSides);
    setTurns(0);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="exterior-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Route className="h-6 w-6" /></span>
        <div>
          <p className="text-sm font-black text-emerald-700">جرّب المشي حول الشكل</p>
          <h2 id="exterior-title" className="mt-1 text-xl font-black text-slate-950">كل دوران صغير يصنع في النهاية دورة كاملة</h2>
          <p className="mt-2 leading-7 text-slate-600">في المضلع المنتظم تكون الدورات متساوية. اضغط للتوقف عند كل رأس حتى تعود لاتجاه البداية.</p>
        </div>
      </div>

      <div className="mt-5 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-3xl bg-emerald-50 p-3">
          <div className="mx-auto aspect-[7/6] w-full max-w-[430px]"><PolygonDrawing sides={sides} split={false} highlightedVertices={turns} /></div>
        </div>
        <div>
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1" role="group" aria-label="اختر المضلع المنتظم">
            {[3, 4, 5, 6].map((count) => <button key={count} type="button" onClick={() => chooseSides(count)} aria-pressed={sides === count} className={`min-h-11 rounded-xl font-black ${sides === count ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600"}`}>{count}</button>)}
          </div>
          <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-center text-white" aria-live="polite">
            <p className="text-sm text-slate-300">توقفت عند {turns} من {sides} رؤوس</p>
            <p className="mt-2 text-3xl font-black tabular-nums" dir="ltr">{turns} × {angle}° = {turns * angle}°</p>
            {turns === sides && <p className="mt-3 flex items-center justify-center gap-2 font-black text-emerald-300"><Check className="h-5 w-5" />اكتملت دورة 360°</p>}
          </div>
          <button type="button" onClick={() => setTurns((value) => value < sides ? value + 1 : 0)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-black text-white hover:bg-emerald-800">
            {turns < sides ? <><ChevronLeft className="h-5 w-5" />انتقل إلى الرأس التالي</> : <><RotateCcw className="h-5 w-5" />أعد الجولة</>}
          </button>
        </div>
      </div>
    </section>
  );
}

const recapTracks = [
  {
    id: "sum",
    label: "مجموع الزوايا",
    color: "cyan",
    items: ["عدّ الأضلاع n", "كوّن n − 2 مثلثًا", "اضرب في 180°", "تحصل على S"],
  },
  {
    id: "missing",
    label: "زاوية مجهولة",
    color: "violet",
    items: ["احسب مجموع المضلع", "اجمع الزوايا المعروفة", "اطرح المعروف", "الباقي هو المجهول"],
  },
  {
    id: "exterior",
    label: "الزوايا الخارجية",
    color: "emerald",
    items: ["ابدأ باتجاه واحد", "دُر عند كل رأس", "أكمل اللفة", "المجموع 360°"],
  },
] as const;

const recapClasses = {
  cyan: { active: "bg-cyan-800 text-white", card: "border-cyan-200 bg-cyan-50", number: "bg-cyan-800" },
  violet: { active: "bg-violet-800 text-white", card: "border-violet-200 bg-violet-50", number: "bg-violet-800" },
  emerald: { active: "bg-emerald-800 text-white", card: "border-emerald-200 bg-emerald-50", number: "bg-emerald-800" },
};

export function VisualLessonMap() {
  const [activeId, setActiveId] = useState<(typeof recapTracks)[number]["id"]>("sum");
  const active = recapTracks.find((track) => track.id === activeId) ?? recapTracks[0];
  const styles = recapClasses[active.color];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="lesson-map-title">
      <p className="text-sm font-black text-cyan-700">خريطة بصرية قبل الاختبار</p>
      <h2 id="lesson-map-title" className="mt-1 text-xl font-black text-slate-950">اختر المسار الذي تريد تثبيته</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="مسارات ملخص الدرس">
        {recapTracks.map((track) => (
          <button key={track.id} type="button" role="tab" aria-selected={activeId === track.id} onClick={() => setActiveId(track.id)} className={`min-h-12 rounded-xl px-3 font-black transition ${activeId === track.id ? recapClasses[track.color].active : "bg-slate-100 text-slate-700"}`}>{track.label}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4" role="tabpanel" aria-live="polite">
        {active.items.map((item, index) => (
          <div key={item} className={`relative flex min-h-28 flex-col justify-center rounded-2xl border p-4 ${styles.card}`}>
            <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full font-black text-white ${styles.number}`}>{index + 1}</span>
            <strong className="leading-7 text-slate-950">{item}</strong>
            {index < active.items.length - 1 && <ChevronLeft className="absolute -left-5 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-slate-400 md:block" />}
          </div>
        ))}
      </div>
    </section>
  );
}
