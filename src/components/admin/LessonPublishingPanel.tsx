import { useEffect, useRef, useState } from "react";
import { CONTENT_PROFILES, validatePublishableLesson, type ContentProfile } from "@shared/lesson-engine/publication-package";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

async function request(path: string, body?: unknown) {
  const response = await fetch(path, { credentials: "include", cache: "no-store", ...(body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error([data.message, ...(data.errors ?? [])].join("\n"));
  return data;
}
const lines = (value: string) => value.split("\n").map(x => x.trim()).filter(Boolean);

export function LessonPublishingPanel() {
  const [lessons, setLessons] = useState<Array<{ id: string; title: string; path: string; published: boolean }>>([]);
  const [search, setSearch] = useState(""), [id, setId] = useState("");
  const [profile, setProfile] = useState<ContentProfile>("general");
  const [loaded, setLoaded] = useState<any>(null), [draft, setDraft] = useState<any>(null);
  const [message, setMessage] = useState(""), [busy, setBusy] = useState(false), [reviewed, setReviewed] = useState(false), [preview, setPreview] = useState(false);
  const [advanced, setAdvanced] = useState("");
  const generation = useRef(0);
  useEffect(() => { request("/api/admin/lesson-publications").then(setLessons).catch(e => setMessage(e.message)); }, []);
  async function load(nextId: string, nextProfile = profile, freshTemplate = false) {
    const requestId = ++generation.current;
    setId(nextId); setLoaded(null); setDraft(null); setReviewed(false); setPreview(false); setMessage(""); setBusy(true);
    try {
      const data = await request(`/api/admin/lesson-publications/${encodeURIComponent(nextId)}?profile=${nextProfile}`);
      if (requestId !== generation.current) return;
      setLoaded(data); setDraft(freshTemplate ? data.template : data.draft);
      setProfile(freshTemplate ? nextProfile : data.draft.contentProfile ?? nextProfile);
    } catch (e: any) { if (requestId === generation.current) setMessage(e.message); }
    finally { if (requestId === generation.current) setBusy(false); }
  }
  function update(next: any) { setDraft(next); setReviewed(false); setPreview(false); }
  function setField(field: string, value: unknown) { update({ ...draft, [field]: value }); }
  function intro(field: string, value: unknown) { update({ ...draft, introduction: { ...draft.introduction, [field]: value } }); }
  function source(field: string, value: unknown) { update({ ...draft, curriculumSource: { ...draft.curriculumSource, [field]: value } }); }
  function step(index: number, field: string, value: unknown) { setField("steps", draft.steps.map((s: any, i: number) => i === index ? { ...s, [field]: value } : s)); }
  async function save(action: "draft" | "publish" | "withdraw") {
    setBusy(true); setMessage("");
    try {
      const data = await request(`/api/admin/lesson-publications/${encodeURIComponent(id)}`, { action, revision: loaded.revision, draft: { ...draft, contentProfile: profile }, reviewed });
      setLoaded({ ...loaded, ...data }); setDraft(data.draft); setMessage(data.message);
      setLessons(await request("/api/admin/lesson-publications"));
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }
  const field = (label: string, value: string, onChange: (value: string) => void, multi = false) => <label className="grid gap-2 text-sm font-bold">{label}{multi
    ? <Textarea value={value ?? ""} onChange={e => onChange(e.target.value)} className="min-h-24 font-normal leading-7" />
    : <Input value={value ?? ""} onChange={e => onChange(e.target.value)} className="font-normal" />}</label>;
  return <Card dir="rtl">
    <CardHeader><CardTitle>إعداد الدروس واعتماد النشر</CardTitle><CardDescription>المسودة تبقى خاصة. عند اعتماد درس مكتمل تُحدّث صفحته والسيو وخريطة الموقع معًا، دون تعديل الكود. تهيئة الوحدة تُدار منفصلة.</CardDescription></CardHeader>
    <CardContent className="space-y-6">
      {field("ابحث في المراحل والصفوف والمواد والدروس", search, setSearch)}
      <label className="grid gap-2 font-bold">اختر الدرس
        <select className="h-12 w-full rounded-xl border bg-white px-3" value={id} disabled={busy} onChange={e => { if (e.target.value) void load(e.target.value); }}>
          <option value="">اختر من الهيكل الدراسي</option>
          {lessons.filter(l => `${l.title} ${l.path}`.includes(search)).map(l => <option key={l.id} value={l.id}>{l.path} / {l.title}{l.published ? " — منشور" : ""}</option>)}
        </select>
      </label>
      {message && <p role="status" className="whitespace-pre-wrap rounded-xl border bg-slate-50 p-4 leading-7">{message}</p>}
      {draft && loaded && <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        <div className="rounded-xl bg-cyan-50 p-4 leading-8"><strong>{loaded.info.lessonTitle}</strong><p>{loaded.info.stageName} / {loaded.info.gradeName} / {loaded.info.subjectName} / {loaded.info.chapterName}</p><p>{loaded.published ? "هناك نسخة منشورة؛ حفظ المسودة لن يغيّرها." : "غير منشور؛ لن يظهر في الأرشفة قبل اكتماله واعتماده."}</p></div>
        <label className="grid gap-2 font-bold">قالب المادة
          <select className="h-12 rounded-xl border px-3" value={profile} onChange={e => { setProfile(e.target.value as ContentProfile); update({ ...draft, contentProfile: e.target.value }); }}>
            {Object.entries(CONTENT_PROFILES).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
          </select>
          <span className="text-sm font-normal text-muted-foreground">{CONTENT_PROFILES[profile].sections.join(" · ")} — القانون الرياضي والرسوم اختياريان، ولا يُفرضان على المواد الأخرى.</span>
        </label>
        <details className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">إنشاء مسودة جديدة من قالب المادة</summary><p className="my-3">يستبدل التحرير الظاهر فقط. تبقى النسخة المحفوظة والمنشورة كما هي إلى أن تضغط حفظ أو اعتماد.</p><Button type="button" variant="outline" onClick={() => load(id, profile, true)}>إنشاء القالب الفارغ</Button></details>
        <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <h3 className="font-bold sm:col-span-2">الشرح المبسط وأهداف التعلم</h3>
          {field("عنوان الفكرة الأساسية", draft.introduction?.heading, v => intro("heading", v))}
          {field("مدة التعلم بالدقائق", String(draft.estimatedMinutes ?? 20), v => setField("estimatedMinutes", Number(v)))}
          {field("شرح مبسط — فقرة في كل سطر", draft.introduction?.paragraphs?.join("\n"), v => intro("paragraphs", lines(v)), true)}
          {field("الأهداف — هدف في كل سطر", draft.objectives?.join("\n"), v => setField("objectives", lines(v)), true)}
          {field("الخلاصة الأساسية", draft.introduction?.takeaway, v => intro("takeaway", v), true)}
          {field("خطوات بناء الفهم — عنوان | شرح في كل سطر", draft.introduction?.foundationSteps?.map((s: any) => `${s.title} | ${s.description}`).join("\n"), v => intro("foundationSteps", lines(v).map(line => { const [title, ...description] = line.split("|"); return { title: title.trim(), description: description.join("|").trim() }; })), true)}
        </section>
        <section className="space-y-4 rounded-xl border p-4"><h3 className="font-bold">صفحات الكتاب ومراجعة المصدر</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {["authority", "portalUrl", "bookTitle", "requiredEdition", "editionEvidence"].map((key, i) => <div key={key}>{field(["الجهة المصدرة", "رابط المصدر الرسمي", "اسم الكتاب", "الطبعة المطلوبة", "دليل مراجعة الطبعة والمصدر"][i], draft.curriculumSource?.[key], v => source(key, v))}</div>)}
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.curriculumSource?.editionStatus === "verified"} onChange={e => source("editionStatus", e.target.checked ? "verified" : "pending")} />تم التحقق من الطبعة</label>
            {["pdfUrl", "officialPdfUrl", "attribution"].map((key, i) => <div key={key}>{field(["رابط ملف صفحات الدرس", "رابط الكتاب الرسمي كاملًا", "توثيق إذن العرض ونسبة المصدر"][i], draft.curriculumSource?.lessonExcerpt?.[key], v => source("lessonExcerpt", { ...draft.curriculumSource.lessonExcerpt, [key]: v }))}</div>)}
          </div>
          {field("صفحات العارض — رقم الصفحة | رابط الصورة | وصف الصورة، في كل سطر", draft.curriculumSource?.lessonExcerpt?.pages?.map((p: any) => `${p.pageNumber} | ${p.imageUrl} | ${p.alt}`).join("\n"), v => {
            const pages = lines(v).map(line => { const [number, imageUrl, ...alt] = line.split("|"); return { pageNumber: Number(number), imageUrl: imageUrl?.trim() ?? "", alt: alt.join("|").trim() }; });
            update({ ...draft, curriculumSource: { ...draft.curriculumSource, lessonPages: pages.map(p => p.pageNumber), lessonExcerpt: { ...draft.curriculumSource.lessonExcerpt, pages } } });
          }, true)}
        </section>
        <section className="space-y-4 rounded-xl border p-4"><h3 className="font-bold">الفيديو المناسب للدرس</h3>
          {(draft.videos ?? []).map((video: any, i: number) => <div key={i} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
            {["title", "url", "channelName"].map((key, k) => <div key={key}>{field(["عنوان الفيديو", "رابط تضمين يوتيوب أو ملف فيديو", "اسم صاحب الشرح"][k], video[key], v => setField("videos", draft.videos.map((x: any, n: number) => n === i ? { ...x, [key]: v } : x)))}</div>)}
            <label>نوع الفيديو<select className="mx-2 rounded border p-2" value={video.source ?? "youtube"} onChange={e => setField("videos", draft.videos.map((x: any, n: number) => n === i ? { ...x, source: e.target.value } : x))}><option value="youtube">يوتيوب</option><option value="hosted">ملف فيديو</option></select></label>
          </div>)}
          <Button type="button" variant="outline" disabled={(draft.videos?.length ?? 0) >= 4} onClick={() => setField("videos", [...(draft.videos ?? []), { id: `video-${Date.now()}`, title: "", url: "", source: "youtube", channelName: "" }])}>إضافة فيديو</Button>
        </section>
        <section className="space-y-4 rounded-xl border p-4"><h3 className="font-bold">الشرح والأنشطة المناسبة للمادة</h3>
          {draft.steps?.map((s: any, i: number) => ["concept", "worked_example", "practice", "warmup"].includes(s.type) ? <div key={s.id} className="space-y-3 rounded-xl bg-slate-50 p-4">
            {field("عنوان القسم", s.title, v => step(i, "title", v))}
            {field("الشرح — فقرة في كل سطر", s.body?.join("\n") ?? "", v => step(i, "body", lines(v)), true)}
            {s.activity && <>
              {field("تعليمات النشاط", s.activity.instructions, v => step(i, "activity", { ...s.activity, instructions: v }))}
              {field("النشاط — مطلب | تفسير يظهر عند الفتح، في كل سطر", s.activity.items.map((x: any) => `${x.prompt} | ${x.explanation}`).join("\n"), v => step(i, "activity", { ...s.activity, items: lines(v).map(line => { const [prompt, ...explanation] = line.split("|"); return { prompt: prompt.trim(), explanation: explanation.join("|").trim() }; }) }), true)}
            </>}
          </div> : null)}
          {field("ملخص الدرس — نقطة في كل سطر", draft.teacherSummary?.points?.join("\n"), v => setField("teacherSummary", { ...draft.teacherSummary, points: lines(v) }), true)}
          {field("نسبة الملخص ومراجعته", draft.teacherSummary?.attribution, v => setField("teacherSummary", { ...draft.teacherSummary, attribution: v }))}
        </section>
        <section className="space-y-4 rounded-xl border p-4"><h3 className="font-bold">المهارات والأسئلة والإجابات المدققة</h3>
          {draft.skills?.map((s: any, i: number) => <div key={s.id} className="grid gap-3 sm:grid-cols-3">{["title", "shortTitle", "description"].map((key, k) => <div key={key}>{field(["اسم المهارة", "اسم مختصر", "وصف المهارة"][k], s[key], v => setField("skills", draft.skills.map((x: any, n: number) => n === i ? { ...x, [key]: v } : x)))}</div>)}</div>)}
          {draft.questions?.map((q: any, i: number) => <div key={q.id} className="space-y-3 rounded-xl bg-slate-50 p-4">
            {field(`السؤال ${i + 1}`, q.prompt, v => setField("questions", draft.questions.map((x: any, n: number) => n === i ? { ...x, prompt: v } : x)))}
            <label>المهارة<select className="mx-2 rounded border p-2" value={q.skillId} onChange={e => setField("questions", draft.questions.map((x: any, n: number) => n === i ? { ...x, skillId: e.target.value } : x))}>{draft.skills.map((s: any) => <option key={s.id} value={s.id}>{s.title || s.id}</option>)}</select></label>
            {q.options?.map((o: any, k: number) => <div key={o.id}>{field(`الخيار ${k + 1}`, o.label, v => setField("questions", draft.questions.map((x: any, n: number) => n === i ? { ...x, options: x.options.map((y: any, m: number) => m === k ? { ...y, label: v } : y) } : x)))}</div>)}
            {q.type !== "ordering" && <label>الإجابة الصحيحة<select className="mx-2 rounded border p-2" value={String(q.correctAnswer)} onChange={e => setField("questions", draft.questions.map((x: any, n: number) => n === i ? { ...x, correctAnswer: x.type === "true_false" ? e.target.value === "true" : e.target.value } : x))}><option value="">اختر الإجابة المدققة</option>{q.options?.map((o: any) => <option key={o.id} value={o.id}>{o.label || o.id}</option>)}</select></label>}
            {["correctFeedback", "defaultIncorrectFeedback"].map((key, k) => <div key={key}>{field(["تفسير الإجابة الصحيحة", "تفسير الخطأ"][k], q[key], v => setField("questions", draft.questions.map((x: any, n: number) => n === i ? { ...x, [key]: v } : x)))}</div>)}
          </div>)}
          <Button type="button" variant="outline" onClick={() => {
            const questionId = `question-${Date.now()}`;
            update({ ...draft, questions: [...draft.questions, { id: questionId, skillId: draft.skills[0].id, type: "multiple_choice", prompt: "", options: [{ id: "a", label: "" }, { id: "b", label: "" }], correctAnswer: "", hints: [], correctFeedback: "", defaultIncorrectFeedback: "" }], assessmentQuestionIds: [...draft.assessmentQuestionIds, questionId], steps: draft.steps.map((s: any) => s.type === "assessment" ? { ...s, questionIds: [...(s.questionIds ?? []), questionId] } : s) });
          }}>إضافة سؤال</Button>
          {field("الحقائق المعتمدة للمعلم — حقيقة في كل سطر", draft.tutorKnowledge?.approvedFacts?.join("\n"), v => setField("tutorKnowledge", { ...draft.tutorKnowledge, approvedFacts: lines(v) }), true)}
          {field("أسئلة التفكير — سؤال في كل سطر", draft.tutorKnowledge?.socraticPrompts?.join("\n"), v => setField("tutorKnowledge", { ...draft.tutorKnowledge, socraticPrompts: lines(v) }), true)}
        </section>
        <details className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">خيارات متقدمة: استيراد أو تعديل حزمة المحتوى</summary><p className="my-3 text-sm">لإضافة قوانين أو أنواع أسئلة أخرى أو تعديل كامل للحزمة. لا تنشر هذه الخطوة شيئًا.</p><Button type="button" variant="outline" onClick={() => setAdvanced(JSON.stringify({ ...draft, contentProfile: profile }, null, 2))}>عرض الحزمة الحالية</Button><Textarea dir="ltr" value={advanced} onChange={e => setAdvanced(e.target.value)} className="my-3 min-h-64 font-mono text-xs" /><Button type="button" variant="outline" onClick={() => { try { const value = JSON.parse(advanced); if (value.id !== id || !Array.isArray(value.steps) || !Array.isArray(value.questions) || !value.introduction || !value.curriculumSource || !value.skills?.length) throw new Error("الحزمة لا تطابق الدرس أو ينقصها الهيكل الأساسي"); update(value); setProfile(value.contentProfile in CONTENT_PROFILES ? value.contentProfile : "general"); setMessage("تم الاستيراد إلى المحرر فقط؛ احفظ المسودة عند الانتهاء"); } catch (e: any) { setMessage(e.message); } }}>استيراد إلى المحرر</Button></details>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => save("draft")}>حفظ المسودة</Button>
          <Button type="button" variant="outline" onClick={() => { const result = validatePublishableLesson({ ...draft, contentProfile: profile }); setMessage(result.errors.length ? result.errors.join("\n") : "اجتاز فحص الاكتمال. راجع المحتوى والروابط والإجابات قبل الاعتماد."); setPreview(!result.errors.length); }}>فحص ومعاينة</Button>
        </div>
        {preview && <div className="rounded-xl border p-4"><h3 className="font-bold">{draft.title}</h3>{draft.introduction.paragraphs.map((p: string, i: number) => <p key={i} className="mt-3 leading-8">{p}</p>)}<p className="mt-3">{draft.curriculumSource.bookTitle} · {draft.questions.length} أسئلة مدققة · {draft.videos.length} فيديو</p></div>}
        <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 leading-7"><input type="checkbox" className="mt-2" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />راجعت المصدر وإذن عرض الصفحات، وعملت روابط الكتاب والفيديو، ودققت الشرح والأنشطة وجميع الإجابات. أعتمد نشر هذه النسخة للطلاب وللأرشفة.</label>
        <Button type="button" disabled={!reviewed} onClick={() => save("publish")}>اعتماد ونشر المحتوى والسيو والخريطة</Button>
        {loaded.published && <details className="rounded-xl border p-4"><summary className="cursor-pointer">إيقاف النشر مع الاحتفاظ بالمحتوى</summary><p className="my-3">تختفي النسخة من العرض والأرشفة، وتظل المسودة محفوظة ويمكن إعادة نشرها.</p><Button type="button" variant="outline" onClick={() => save("withdraw")}>إلغاء النشر والاحتفاظ بالمسودة</Button></details>}
      </fieldset>}
    </CardContent>
  </Card>;
}
