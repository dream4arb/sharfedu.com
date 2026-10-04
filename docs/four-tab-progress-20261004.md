# Lesson tab completion

Scope: remove native bullet markers from the two lesson-card lists only; retain all other sidebar markup and published lesson content.

Each published lesson uses the reusable `four-tabs-v1` record with book, video, learn and assessment flags. Each flag contributes exactly 25%, independently of assessment mastery. Opening a tab does not mark it complete. Content tabs can be confirmed with the footer completion button or the existing Next action; ending a lesson video also completes the video tab. Assessment completes after every question has a checked answer. Restart removes only the assessment flag and answers, preserving the other three tabs.

The original one-click mark-complete shortcut is no longer offered in the new lesson UI. Header, lesson-card badge and subject summary read the same completion provider. The subject summary in the lesson page is restricted to the displayed lesson IDs.

Storage is isolated by student ID (and a separate guest key), subject and lesson ID. Signed-in completion is loaded/saved through the existing progress API. Versioned JSON occupies the existing text `questions_progress` column, so no database schema or backend deployment is required. API writes are serialized, coalesced, retried and held until hydration succeeds. Timestamp-based snapshot merge preserves assessment resets instead of unioning flags. Legacy progress data is retained, not reinterpreted as four-tab completion. Local authenticated quiz histories are also owner-scoped to avoid awarding completion from another student's answers.

Checks: four-tab model and persistence round trips; restart/merge/idempotence; original sidebar preservation except scoped marker classes; lesson navigation and presentation regressions; Vite frontend build. Repository-wide TypeScript checking still reports pre-existing backend auth, bcrypt, image declarations, PDF canvas and SubjectData errors, but none in new progress code.

Deployment uses the existing frontend-only publisher, a fresh private rollback index and the unchanged backend digest. No lesson content, curriculum IDs, credentials or unrelated service changes are part of this task.
