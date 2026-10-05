# Per-lesson Reset Progress

Added إعادة التقدم next to إعادة الاختبار in the assessment header, both unanswered and report modes. The new action has an accessible RTL confirmation dialog stating exactly what is reset and that other lessons are untouched. Cancel does not change anything.

On confirmation, reset the current lesson's session (quiz answers, scores, hints, attempts, completion timestamp and visited steps), activity exploration, video selection/play state, visual action, and all four completion flags. Return to the book. Keep the existing assessment-only restart behavior unchanged.

Completion reset writes one explicit newer zero snapshot for the current subject/lesson, not deletion or four separate writes. Existing owner-scoped persistence and serialized API writes are reused, so old server completion does not resurrect the reset. Other lessons and subjects remain intact. No backend, schema, curriculum, or SEO changes.

Tests cover full reset 100 to 0, timestamp ordering, older-server merge, reload, API zero fields, nonmutation, unrelated lesson/subject preservation, fresh quiz session and confirmation/cancel wiring. Live checks recorded below after publication; user progress will not be reset during verification.

## Verified publication

- Local browser QA used the real lesson component and progress provider with disposable anonymous state: completed all four tabs to 100%, cancelled reset without changes, confirmed reset to 0% and book tab, then reloaded and retained 0%.
- Four-tab progress, mastery report, lesson presentation, production integration boundary and activities regression tests passed. Frontend production build passed.
- Published frontend-only bundle SHA256 `b7513e97802a2eb2af9331b2fc73996360c52a3ccc5283db30b82e3dd313c832`; 115 files, atomic index activation.
- Rollback backup: `../tmp/lesson-ui-backup-20261005-progress-reset/` (private permissions).
- Live index SHA256 `746a4ea23334e0e082afd93c3e94d8f4547c2a54c62ada58909997e1a95af292`; unchanged backend SHA256 `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`. Lesson HTTP 200.
- Actual Chrome verification: both adjacent reset buttons visible in the completed report; opened the new dialog and cancelled. Existing 100% completion and result retained. No reset confirmed on the user's profile.
- Screenshot: `production-progress-reset-20261005.png` in the main task workspace.
