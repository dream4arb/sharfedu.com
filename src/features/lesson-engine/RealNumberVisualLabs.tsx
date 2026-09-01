import { useMemo, useState } from "react";
import { ArrowLeftRight, Brackets, Check, Layers3, Play, Repeat2 } from "lucide-react";

type NumberExample = {
  id: string;
  label: string;
  note: string;
  memberships: Array<"N" | "W" | "Z" | "Q" | "I" | "R">;
};

const numberExamples: NumberExample[] = [
  { id: "five", label: "5", note: "عدد موجب يُستعمل في العد", memberships: ["N", "W", "Z", "Q", "R"] },
  { id: "zero", label: "0", note: "كلي وصحيح، لكنه ليس طبيعيًا وفق تعريف الكتاب", memberships: ["W", "Z", "Q", "R"] },
  { id: "negative", label: "−8", note: "يمكن كتابته −8/1", memberships: ["Z", "Q", "R"] },
  { id: "fraction", label: "3/4", note: "كسر بين عددين صحيحين", memberships: ["Q", "R"] },
  { id: "root", label: "√2", note: "عشري غير منتهٍ وغير دوري", memberships: ["I", "R"] },
];

const setMeta = [
  { id: "R", label: "الحقيقية R", classes: "border-slate-800 bg-slate-900 text-white" },
  { id: "Q", label: "النسبية Q", classes: "border-cyan-700 bg-cyan-50 text-cyan-950" },
  { id: "Z", label: "الصحيحة Z", classes: "border-violet-600 bg-violet-50 text-violet-950" },
  { id: "W", label: "الكلية W", classes: "border-amber-500 bg-amber-50 text-amber-950" },
  { id: "N", label: "الطبيعية N", classes: "border-emerald-600 bg-emerald-50 text-emerald-950" },
] as const;

export function RealNumberSetsLab() {
  const [selectedId, setSelectedId] = useState(numberExamples[0].id);
  const selected = numberExamples.find((example) => example.id === selectedId) ?? numberExamples[0];

  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-gradient-to-l from-cyan-50 to-white p-5 sm:p-6">
        <p className="text-sm font-black text-cyan-700">تفاعل بلا درجات</p>
        <h2 className="mt-1 text-xl font-black">اختر عددًا، ثم راقب الصناديق التي تضيء</h2>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="اختر عددًا لاستكشاف مجموعاته">
          {numberExamples.map((example) => (
            <button key={example.id} type="button" onClick={() => setSelectedId(example.id)} aria-pressed={example.id === selected.id} className={`min-h-12 min-w-16 shrink-0 rounded-xl border px-4 text-lg font-black transition ${example.id === selected.id ? "border-cyan-700 bg-cyan-800 text-white ring-4 ring-cyan-100" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"}`} dir="ltr">{example.label}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-2">
          {setMeta.map((set, index) => {
            const active = selected.memberships.includes(set.id);
            return (
              <div key={set.id} className={`rounded-2xl border-2 p-3 transition-all duration-300 ${active ? `${set.classes} translate-x-0 opacity-100 shadow-sm` : "border-slate-200 bg-slate-50 text-slate-400 opacity-55"}`} style={{ marginInlineStart: `${index * 18}px` }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">{set.label}</span>
                  {active && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-emerald-700"><Check className="h-4 w-4" /></span>}
                </div>
              </div>
            );
          })}
          <div className={`mr-10 rounded-2xl border-2 p-3 transition ${selected.memberships.includes("I") ? "border-rose-500 bg-rose-50 text-rose-950 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400 opacity-55"}`}>
            <div className="flex items-center justify-between"><span className="font-black">غير النسبية I — فرع آخر داخل R</span>{selected.memberships.includes("I") && <Check className="h-5 w-5 text-rose-600" />}</div>
          </div>
        </div>

        <aside className="flex flex-col justify-center rounded-3xl bg-slate-950 p-6 text-center text-white">
          <span className="text-5xl font-black" dir="ltr">{selected.label}</span>
          <p className="mt-4 leading-7 text-slate-300">{selected.note}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2" dir="ltr">
            {selected.memberships.map((set) => <span key={set} className="rounded-full bg-cyan-300/15 px-3 py-1.5 font-black text-cyan-200">{set}</span>)}
          </div>
        </aside>
      </div>
    </section>
  );
}

const decimalExamples = [
  { id: "ending", label: "0.375", pattern: "0.375000…", result: "نسبي Q", reason: "ينتهي، ويمكن كتابته 3/8", color: "emerald" },
  { id: "repeating", label: "0.2727…", pattern: "0.27 27 27 …", result: "نسبي Q", reason: "يتكرر بنمط ثابت", color: "cyan" },
  { id: "irrational", label: "√2", pattern: "1.41421356…", result: "غير نسبي I", reason: "لا ينتهي ولا يتكرر", color: "rose" },
] as const;

export function DecimalPatternLab() {
  const [selectedId, setSelectedId] = useState<string>(decimalExamples[0].id);
  const selected = decimalExamples.find((item) => item.id === selectedId) ?? decimalExamples[0];
  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-800"><Repeat2 className="h-6 w-6" /></span><div><p className="text-sm font-black text-violet-700">شاهد البصمة</p><h2 className="text-xl font-black">النهاية والتكرار هما المفتاح</h2></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {decimalExamples.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selected.id === item.id} className={`rounded-2xl border-2 p-4 text-center transition ${selected.id === item.id ? "border-violet-600 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 hover:border-violet-300"}`}>
            <span className="block text-2xl font-black" dir="ltr">{item.label}</span><span className="mt-1 block text-xs text-slate-500">اضغط لاستكشافه</span>
          </button>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
        <p className="text-center text-3xl font-black tracking-wider text-cyan-200" dir="ltr">{selected.pattern}</p>
        <div className="mx-auto mt-4 h-1.5 max-w-md overflow-hidden rounded-full bg-white/10"><div key={selected.id} className="h-full w-full origin-right animate-[pulse_1.6s_ease-in-out_infinite] rounded-full bg-cyan-400" /></div>
        <div className="mt-5 grid gap-3 text-center sm:grid-cols-2"><div className="rounded-xl bg-white/10 p-3"><span className="block text-xs text-slate-300">النتيجة</span><strong className="text-lg text-white">{selected.result}</strong></div><div className="rounded-xl bg-white/10 p-3"><span className="block text-xs text-slate-300">لماذا؟</span><strong className="text-sm text-white">{selected.reason}</strong></div></div>
      </div>
    </section>
  );
}

const propertyExamples = [
  { id: "commutative", title: "التبديلية", icon: ArrowLeftRight, before: "4 + 7", after: "7 + 4", note: "غيّرنا الترتيب فقط" },
  { id: "associative", title: "التجميعية", icon: Brackets, before: "(2 + 3) + 5", after: "2 + (3 + 5)", note: "غيّرنا الأقواس فقط" },
  { id: "distributive", title: "التوزيعية", icon: Layers3, before: "3(2 + 4)", after: "3×2 + 3×4", note: "وصل الضرب إلى كل حد" },
] as const;

export function OperationPropertiesLab() {
  const [selectedId, setSelectedId] = useState<string>(propertyExamples[0].id);
  const [swapped, setSwapped] = useState(false);
  const selected = useMemo(() => propertyExamples.find((item) => item.id === selectedId) ?? propertyExamples[0], [selectedId]);
  const Icon = selected.icon;

  function select(id: string) {
    setSelectedId(id);
    setSwapped(false);
  }

  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <p className="text-sm font-black text-amber-700">مختبر حركة</p>
        <h2 className="mt-1 text-xl font-black">لاحظ ما يتغير وما يبقى ثابتًا</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {propertyExamples.map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} aria-pressed={selected.id === item.id} className={`min-h-12 rounded-xl border px-3 font-black ${selected.id === item.id ? "border-amber-500 bg-amber-50 text-amber-950 ring-4 ring-amber-100" : "border-slate-200 text-slate-600"}`}>{item.title}</button>)}
        </div>
      </div>
      <div className="grid items-center gap-5 bg-slate-50 p-5 sm:p-7 lg:grid-cols-[1fr_auto_1fr]">
        <div className={`rounded-2xl border-2 bg-white p-6 text-center text-2xl font-black transition-all duration-500 ${swapped ? "border-emerald-400 opacity-70" : "border-cyan-500 shadow-md"}`} dir="ltr">{selected.before}</div>
        <button type="button" onClick={() => setSwapped((value) => !value)} className="mx-auto flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white hover:bg-cyan-800"><Play className="h-5 w-5" /> حرّك</button>
        <div className={`rounded-2xl border-2 bg-white p-6 text-center text-2xl font-black transition-all duration-500 ${swapped ? "border-emerald-500 shadow-md ring-4 ring-emerald-100" : "border-slate-200 opacity-55"}`} dir="ltr">{selected.after}</div>
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-slate-200 p-4 text-center"><Icon className="h-5 w-5 text-amber-600" /><p className="font-bold text-slate-700">{selected.note}، لذلك تبقى القيمة نفسها.</p></div>
    </section>
  );
}

const rationalLinePoints = [
  { id: "minus-three-halves", label: "−3/2", value: -1.5, decimal: "−1.5" },
  { id: "minus-half", label: "−1/2", value: -0.5, decimal: "−0.5" },
  { id: "quarter", label: "1/4", value: 0.25, decimal: "0.25" },
  { id: "five-fourths", label: "5/4", value: 1.25, decimal: "1.25" },
] as const;

export function RationalNumberLineLab() {
  const [selectedId, setSelectedId] = useState<string>(rationalLinePoints[0].id);
  const selected = rationalLinePoints.find((point) => point.id === selectedId) ?? rationalLinePoints[0];
  const position = ((selected.value + 2) / 4) * 100;
  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-black text-cyan-700">خط حيّ</p><h2 className="mt-1 text-xl font-black">اختر كسرًا وشاهد مكانه ومسافته من الصفر</h2></div><span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">لا توجد درجات هنا</span></div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="أعداد نسبية على خط الأعداد">
        {rationalLinePoints.map((point) => <button key={point.id} type="button" onClick={() => setSelectedId(point.id)} aria-pressed={selected.id === point.id} className={`min-h-12 min-w-20 shrink-0 rounded-xl border px-4 text-lg font-black ${selected.id === point.id ? "border-cyan-700 bg-cyan-800 text-white ring-4 ring-cyan-100" : "border-slate-200 text-slate-700"}`} dir="ltr">{point.label}</button>)}
      </div>
      <div className="mt-10 overflow-hidden rounded-3xl bg-slate-950 px-6 pb-7 pt-12 text-white sm:px-10">
        <div className="relative h-2 rounded-full bg-slate-600">
          {[-2, -1, 0, 1, 2].map((tick) => <div key={tick} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${((tick + 2) / 4) * 100}%` }}><span className="block h-5 w-1 rounded-full bg-slate-300" /><span className="mt-2 block -translate-x-[calc(50%-2px)] text-sm font-bold text-slate-300" dir="ltr">{tick}</span></div>)}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ left: `${position}%` }}><span className="absolute bottom-5 left-1/2 w-max -translate-x-1/2 rounded-xl bg-cyan-300 px-3 py-2 text-center font-black text-slate-950 shadow-lg" dir="ltr">{selected.label}<small className="mr-2 font-bold text-cyan-900">= {selected.decimal}</small></span><span className="block h-7 w-7 rounded-full border-4 border-white bg-cyan-400 shadow-lg" /></div>
        </div>
        <div className="mt-12 grid gap-3 text-center sm:grid-cols-2"><div className="rounded-xl bg-white/10 p-3"><span className="block text-xs text-slate-300">الاتجاه</span><strong>{selected.value < 0 ? "يسار الصفر — عدد سالب" : "يمين الصفر — عدد موجب"}</strong></div><div className="rounded-xl bg-white/10 p-3"><span className="block text-xs text-slate-300">القيمة المطلقة</span><strong dir="ltr">{Math.abs(selected.value)}</strong></div></div>
      </div>
    </section>
  );
}

const fractionConversions = [
  { id: "three-eighths", fraction: "3/8", division: "3 ÷ 8", decimal: "0.375", note: "عشري منتهٍ" },
  { id: "minus-five-fourths", fraction: "−5/4", division: "−5 ÷ 4", decimal: "−1.25", note: "عشري منتهٍ" },
  { id: "one-third", fraction: "1/3", division: "1 ÷ 3", decimal: "0.333…", note: "عشري دوري" },
] as const;

export function FractionDecimalMachine() {
  const [selectedId, setSelectedId] = useState<string>(fractionConversions[0].id);
  const [stage, setStage] = useState(0);
  const selected = fractionConversions.find((item) => item.id === selectedId) ?? fractionConversions[0];
  function select(id: string) { setSelectedId(id); setStage(0); }
  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5 sm:p-6"><p className="text-sm font-black text-violet-700">آلة التحويل</p><h2 className="mt-1 text-xl font-black">اضغط «التالي» لترى ما يحدث بين الكسر والعشري</h2><div className="mt-4 flex gap-2 overflow-x-auto">{fractionConversions.map((item) => <button key={item.id} type="button" onClick={() => select(item.id)} className={`min-h-11 min-w-20 shrink-0 rounded-xl border px-4 font-black ${selected.id === item.id ? "border-violet-600 bg-violet-50 text-violet-900" : "border-slate-200"}`} dir="ltr">{item.fraction}</button>)}</div></div>
      <div className="grid items-center gap-4 bg-slate-50 p-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:p-7">
        <div className="rounded-2xl border-2 border-cyan-300 bg-white p-6 text-center"><span className="block text-xs font-bold text-slate-500">الكسر</span><strong className="mt-2 block text-3xl" dir="ltr">{selected.fraction}</strong></div>
        <ArrowLeftRight className={`mx-auto h-7 w-7 text-violet-600 transition ${stage >= 1 ? "opacity-100" : "opacity-20"}`} />
        <div className={`rounded-2xl border-2 bg-white p-6 text-center transition duration-500 ${stage >= 1 ? "border-violet-400 opacity-100" : "border-slate-200 opacity-30"}`}><span className="block text-xs font-bold text-slate-500">حوّل خط الكسر إلى قسمة</span><strong className="mt-2 block text-2xl" dir="ltr">{selected.division}</strong></div>
        <ArrowLeftRight className={`mx-auto h-7 w-7 text-emerald-600 transition ${stage >= 2 ? "opacity-100" : "opacity-20"}`} />
        <div className={`rounded-2xl border-2 bg-white p-6 text-center transition duration-500 ${stage >= 2 ? "border-emerald-400 opacity-100 shadow-md" : "border-slate-200 opacity-30"}`}><span className="block text-xs font-bold text-slate-500">الناتج</span><strong className="mt-2 block text-3xl" dir="ltr">{selected.decimal}</strong><span className="mt-2 block text-xs font-bold text-emerald-700">{selected.note}</span></div>
      </div>
      <div className="border-t border-slate-200 p-4 text-center"><button type="button" onClick={() => setStage((value) => (value >= 2 ? 0 : value + 1))} className="min-h-12 rounded-xl bg-violet-700 px-6 font-black text-white hover:bg-violet-800">{stage >= 2 ? "أعد التحويل" : "الخطوة التالية"}</button></div>
    </section>
  );
}
