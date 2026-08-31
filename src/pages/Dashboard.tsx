import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpenCheck, CheckCircle2, CircleUserRound, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { polygonAnglesLesson } from "@shared/lesson-engine/polygon-angles";

interface LocalQuestionProgress {
  skillId: string;
  score: number;
}

interface LocalLessonSession {
  stepIndex: number;
  startedAt: string;
  completedAt?: string;
  questions: Record<string, LocalQuestionProgress>;
}

interface RemoteSkill {
  skillId: string;
  score: number;
}

function readLocalSession(): LocalLessonSession | null {
  try {
    const raw = localStorage.getItem(`sharaf:lesson-engine:${polygonAnglesLesson.id}`);
    return raw ? JSON.parse(raw) as LocalLessonSession : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [localSession] = useState<LocalLessonSession | null>(() => readLocalSession());
  const [remoteSkills, setRemoteSkills] = useState<RemoteSkill[]>([]);

  useEffect(() => {
    fetch(`/api/lesson-engine/progress/${polygonAnglesLesson.id}`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.skills) setRemoteSkills(data.skills); })
      .catch(() => undefined);
  }, []);

  const localMastery = useMemo(() => polygonAnglesLesson.skills.map((skill) => {
    const results = Object.values(localSession?.questions ?? {}).filter((question) => question.skillId === skill.id);
    const score = results.length ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length) : 0;
    return { skillId: skill.id, score };
  }), [localSession]);

  const mastery = polygonAnglesLesson.skills.map((skill) => {
    const remote = remoteSkills.find((item) => item.skillId === skill.id)?.score ?? 0;
    const local = localMastery.find((item) => item.skillId === skill.id)?.score ?? 0;
    return { ...skill, score: Math.max(remote, local) };
  });
  const overall = mastery.some((skill) => skill.score > 0)
    ? Math.round(mastery.reduce((sum, skill) => sum + skill.score, 0) / mastery.length)
    : 0;
  const stepProgress = localSession
    ? Math.round(((localSession.stepIndex + 1) / polygonAnglesLesson.steps.length) * 100)
    : 0;
  const weakest = [...mastery].filter((skill) => skill.score > 0).sort((a, b) => a.score - b.score)[0];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-black text-cyan-800"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-800 text-white">ش</span> شارف</Link>
          <div className="mr-auto flex items-center gap-2 text-sm text-slate-600"><CircleUserRound className="h-5 w-5" />{user?.firstName || "طالب شارف"}</div>
          <Link href="/profile" className="text-sm font-bold text-cyan-800 hover:underline">الملف الشخصي</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm font-black text-cyan-700">لوحة الطالب</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">مرحبًا {user?.firstName || "بك"}</h1>
        <p className="mt-2 text-slate-600">هنا يظهر تقدمك الحقيقي فقط، دون نقاط أو إنجازات افتراضية.</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800"><BookOpenCheck className="h-6 w-6" /></span><div><p className="text-sm font-bold text-slate-500">آخر درس</p><h2 className="text-xl font-black">{polygonAnglesLesson.title}</h2></div></div>
            {localSession ? (
              <>
                <div className="mt-6 flex items-center justify-between text-sm"><span className="font-bold">تقدم الرحلة</span><span className="font-black tabular-nums">{stepProgress}%</span></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-700" style={{ width: `${stepProgress}%` }} /></div>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">{localSession.completedAt ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> مكتمل — يمكنك مراجعته في أي وقت</> : "محفوظ على هذا الجهاز"}</p>
              </>
            ) : <p className="mt-5 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-600">لم تبدأ النموذج التفاعلي بعد.</p>}
            <Link href="/lesson/secondary/math/l-mm6el08l"><Button className="mt-6 w-full font-black">{localSession ? "استكمل أو راجع الدرس" : "ابدأ الدرس"}<ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
          </section>

          <section className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="flex items-center gap-2 text-sm font-bold text-cyan-300"><Target className="h-5 w-5" /> الإتقان الحالي</p>
            <p className="mt-4 text-5xl font-black tabular-nums">{overall}%</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">متوسط مهارات النموذج المتاحة حاليًا.</p>
            {weakest && <div className="mt-6 rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-amber-300">يحتاج مراجعة أكثر</p><p className="mt-1 font-black">{weakest.title}</p></div>}
          </section>
        </div>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-black">المهارات</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {mastery.map((skill) => (
              <div key={skill.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3"><p className="font-black">{skill.title}</p><span className="font-black tabular-nums">{skill.score}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${skill.score >= 85 ? "bg-emerald-500" : skill.score >= 65 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${skill.score}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
