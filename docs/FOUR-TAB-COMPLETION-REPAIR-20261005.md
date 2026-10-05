# Repair missing book completion at 75%

Reported case: user completed all four tabs, but sidebar still showed 75%. Live read-only inspection in the user's Chrome profile confirmed book had no completion check; video, interactive explanation and assessment had checks. No quiz restart or answer edits were performed.

Cause: the footer's Next and explicit completion button recorded content completion, while direct forward navigation through the header bypassed that behavior. Book page visibility emitted analytics only, not completion.

Fix:

- Centralized forward content completion inside `selectTab`, shared by header and footer navigation. Backward navigation, selecting the same tab and leaving assessment do not award completion. Assessment still requires checked answers.
- Book reader auto-completes only when every excerpt page has been seen and the end marker reached. Jumping to the end with skipped pages does not complete the reader; queued callbacks are ignored after unmount and completion is reported once.
- Kept manual completion, video-end completion, assessment restart and versioned progress storage/API format unchanged. No answer changes, bulk progress migration, curriculum changes, backend changes or schema changes.

Checks: four-tab progress tests (all 16 navigation pairs, 75% missing-book recovery, idempotence, persistence/merge/restart, reading-end/skipped-page cases), sidebar, production integration boundary, lesson navigation and book presentation passed. Full TypeScript check still reports unrelated existing server/auth, home assets, PDF canvas, API-base and Lesson page type errors; none in changed files. Production build and live checks recorded below.
