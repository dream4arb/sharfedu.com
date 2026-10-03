import { ArrowLeft, Hand, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { LessonActivity } from "./lessonActivities";

export function ActivityReminder({ open, onOpenChange, pending, onReview, onContinue, onRestoreFocus }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: LessonActivity[];
  onReview: (activity: LessonActivity) => void;
  onContinue: () => void;
  onRestoreFocus: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[85dvh] w-[calc(100%-2rem)] gap-4 overflow-y-auto rounded-3xl border-cyan-100 bg-white p-5 sm:p-6 [&>button:last-child]:hidden"
        data-testid="activity-reminder" onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus(); }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800"><Hand className="h-6 w-6" aria-hidden="true" /></span>
          <DialogTitle className="min-w-0 flex-1 text-lg font-black leading-7 text-slate-950">قبل الاختبار، هل تريد تجربة الأنشطة؟</DialogTitle>
          <DialogClose aria-label="إغلاق التذكير" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"><X className="h-5 w-5" aria-hidden="true" /></DialogClose>
        </div>
        <DialogDescription className="text-right text-sm leading-7 text-slate-600">بقي {pending.length} من الأنشطة دون تجربة. يمكنك تجربتها الآن، أو بدء الاختبار مباشرة. تجربة النشاط لا تدخل في درجات الإتقان.</DialogDescription>
        <ul className="space-y-2">
          {pending.map((activity) => <li key={activity.stepId}>
            <button type="button" onClick={() => onReview(activity)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-right text-sm font-bold text-cyan-950 hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700">
              <span className="min-w-0">{activity.title}</span><ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </li>)}
        </ul>
        <button type="button" onClick={onContinue} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 py-3 text-sm font-black text-white hover:bg-cyan-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200" data-testid="continue-without-activities">ابدأ الاختبار الآن<ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
      </DialogContent>
    </Dialog>
  );
}
