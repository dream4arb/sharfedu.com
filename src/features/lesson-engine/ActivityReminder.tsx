/** A quiet suggestion beside the exam button, never a navigation gate. */
export function ActivityReminder({ pendingCount }: { pendingCount: number }) {
  if (pendingCount <= 0) return null;
  return (
    <p className="max-w-sm text-sm leading-6 text-slate-500" data-testid="activity-reminder">
      لديك أنشطة لم تجرّبها بعد. يمكنك تجربتها أو بدء الاختبار مباشرة.
    </p>
  );
}
