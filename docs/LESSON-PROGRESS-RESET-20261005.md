# Per-lesson Reset Progress

Added إعادة التقدم next to إعادة الاختبار in the assessment header, both unanswered and report modes. The new action has an accessible RTL confirmation dialog stating exactly what is reset and that other lessons are untouched. Cancel does not change anything.

On confirmation, reset the current lesson's session (quiz answers, scores, hints, attempts, completion timestamp and visited steps), activity exploration, video selection/play state, visual action, and all four completion flags. Return to the book. Keep the existing assessment-only restart behavior unchanged.

Completion reset writes one explicit newer zero snapshot for the current subject/lesson, not deletion or four separate writes. Existing owner-scoped persistence and serialized API writes are reused, so old server completion does not resurrect the reset. Other lessons and subjects remain intact. No backend, schema, curriculum, or SEO changes.

Tests cover full reset 100 to 0, timestamp ordering, older-server merge, reload, API zero fields, nonmutation, unrelated lesson/subject preservation, fresh quiz session and confirmation/cancel wiring. Live checks recorded below after publication; user progress will not be reset during verification.
