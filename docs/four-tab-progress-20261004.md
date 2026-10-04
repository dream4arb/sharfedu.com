# Lesson tab completion

Scope: remove native bullet markers from the two lesson-card lists only; retain all other sidebar markup and published lesson content.

Each published lesson uses the reusable `four-tabs-v1` record with book, video, learn and assessment flags. Each flag contributes exactly 25%, independently of assessment mastery. Opening a tab does not mark it complete. Content tabs can be confirmed with the footer completion button or the existing Next action; ending a lesson video also completes the video tab. Assessment completes after every question has a checked answer. Restart removes only the assessment flag and answers, preserving the other three tabs.

The original one-click mark-complete shortcut is no longer offered in the new lesson UI. Header, lesson-card badge and subject summary read the same completion provider. The subject summary in the lesson page is restricted to the displayed lesson IDs.

Storage is isolated by student ID (and a separate guest key), subject and lesson ID. Signed-in completion is loaded/saved through the existing progress API. Versioned JSON occupies the existing text `questions_progress` column, so no database schema or backend deployment is required. API writes are serialized, coalesced, retried and held until hydration succeeds. Timestamp-based snapshot merge preserves assessment resets instead of unioning flags. Legacy progress data is retained, not reinterpreted as four-tab completion. Local authenticated quiz histories are also owner-scoped to avoid awarding completion from another student's answers.

Checks: four-tab model and persistence round trips; restart/merge/idempotence; original sidebar preservation except scoped marker classes; lesson navigation and presentation regressions; Vite frontend build. Repository-wide TypeScript checking still reports pre-existing backend auth, bcrypt, image declarations, PDF canvas and SubjectData errors, but none in new progress code.

Deployment uses the existing frontend-only publisher, a fresh private rollback index and the unchanged backend digest. No lesson content, curriculum IDs, credentials or unrelated service changes are part of this task.

## Published verification

- Source commit: `9667b00`, pushed before activation.
- Fresh private rollback directory: application `tmp/lesson-ui-backup-20261004-progress-tabs`; publisher confirmed backup/preparation before activation.
- Live index SHA256: `b35d6cb04466c6a05f42e68f250185586e79bdf0259edbf49a7590e42145a9eb`.
- Backend remained `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`; no service restart.
- Isolated guest browser: opening book stayed 0; explicit book/video completion reached 25/50; Next from learning reached 75; two checked answers stayed 75; all five checked answers reached 100 in both header and sidebar.
- Reload preserved 100. Restart cleared answers and only assessment credit; 75 and 0/5 answers persisted after reload.
- Five deliberately wrong checked answers still completed assessment while mastery showed 0. Correcting them awarded full mastery 100, with completion still 100.
- All 34 rendered second-semester lesson menu items had computed list style `none`, with no external markers. Unpublished parallelogram remained 0 and content-pending.
- No browser console errors. Screenshot: workspace `outputs/production-four-tab-progress-20261004.png`.
- No real student account was used or modified for browser testing; account-scoped API persistence is implemented via the existing routes, with model round-trip and ordering guards tested locally.
