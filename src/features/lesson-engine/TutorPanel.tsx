import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Lightbulb, Loader2, Mic, Send, Sparkles } from "lucide-react";
import type {
  InteractiveLessonDefinition,
  SkillMasterySnapshot,
  TutorReply,
  TutorVisualAction,
} from "@shared/lesson-engine/types";
import type { QuestionProgress } from "./useLessonSession";

interface TutorMessage {
  id: string;
  role: "tutor" | "student";
  text: string;
}

const quickActions = ["اشرح أبسط", "أعطني مثالًا", "اختبرني", "أعطني تلميحًا", "أعد الشرح"];

export function TutorPanel({
  lesson,
  currentStepId,
  mastery,
  questions,
  onVisualAction,
  onTutorQuestion,
}: {
  lesson: InteractiveLessonDefinition;
  currentStepId: string;
  mastery: SkillMasterySnapshot[];
  questions: Record<string, QuestionProgress>;
  onVisualAction: (action: TutorVisualAction) => void;
  onTutorQuestion: () => void;
}) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "welcome",
      role: "tutor",
      text: "أنا معك داخل درس زوايا المضلع. اسألني عن الرسم أو القانون، أو قل: لم أفهم لماذا نطرح 2؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recentAttempts = useMemo(() => Object.values(questions)
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5)
    .map(({ questionId, skillId, correct, attempts, hintsUsed }) => ({ questionId, skillId, correct, attempts, hintsUsed })), [questions]);

  async function ask(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "student", text: message }]);
    setInput("");
    setLoading(true);
    onTutorQuestion();
    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId: lesson.id,
          currentStepId,
          message,
          mastery,
          recentAttempts,
        }),
      });
      if (!response.ok) throw new Error("Tutor request failed");
      const reply = await response.json() as TutorReply;
      const replyText = [reply.message, reply.followUpQuestion].filter(Boolean).join("\n\n");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "tutor", text: replyText }]);
      if (reply.action) onVisualAction(reply.action);
    } catch {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "tutor",
        text: "تعذّر الاتصال بي الآن. تابع الخطوة الحالية، أو جرّب السؤال مرة أخرى بعد لحظة.",
      }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <aside className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-[0_18px_55px_-30px_rgba(8,145,178,0.55)] lg:sticky lg:top-5" aria-labelledby="tutor-title">
      <header className="bg-gradient-to-l from-cyan-800 to-cyan-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Bot className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-bold text-cyan-100">معلمك داخل الدرس</p>
            <h2 id="tutor-title" className="text-lg font-black">اسأل شارف</h2>
          </div>
          <span className="mr-auto flex items-center gap-1 rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-bold text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-300" /> مرتبط بالدرس</span>
        </div>
      </header>

      <div ref={scrollRef} className="max-h-[360px] min-h-[260px] space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "student" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${
              message.role === "student" ? "rounded-tr-sm bg-slate-900 text-white" : "rounded-tl-sm border border-cyan-100 bg-white text-slate-800"
            }`}>
              {message.text}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-end"><span className="flex items-center gap-2 rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> أفكر معك...</span></div>}
      </div>

      <div className="border-t border-slate-100 p-4">
        <p className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-500"><Sparkles className="h-3.5 w-3.5" /> طلب سريع</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <button key={action} type="button" onClick={() => void ask(action)} className="min-h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-800">
              {action === "أعطني تلميحًا" && <Lightbulb className="ml-1 inline h-3.5 w-3.5" />}{action}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-2 flex items-end gap-2">
          <label className="flex-1">
            <span className="sr-only">اكتب سؤالك لشارف</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(input);
                }
              }}
              maxLength={500}
              rows={2}
              placeholder="مثال: لماذا نطرح 2؟"
              className="w-full resize-none rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              data-testid="input-tutor-question"
            />
          </label>
          <button type="button" disabled title="المحادثة الصوتية ستضاف في مرحلة مستقلة" aria-label="المحادثة الصوتية ستتوفر لاحقًا" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400"><Mic className="h-5 w-5" /></button>
          <button type="submit" disabled={!input.trim() || loading} aria-label="أرسل السؤال" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-40" data-testid="button-send-tutor"><Send className="h-5 w-5" /></button>
        </form>
        <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">يجيب من سياق هذا الدرس، وقد يطلب منك التفكير قبل إظهار الحل.</p>
      </div>
    </aside>
  );
}
