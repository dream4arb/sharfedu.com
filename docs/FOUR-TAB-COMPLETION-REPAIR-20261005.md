# Repair missing book completion at 75%

Reported case: user completed all four tabs, but sidebar still showed 75%. Live read-only inspection in the user's Chrome profile confirmed book had no completion check; video, interactive explanation and assessment had checks. No quiz restart or answer edits were performed.

Cause: the footer's Next and explicit completion button recorded content completion, while direct forward navigation through the header bypassed that behavior. Book page visibility emitted analytics only, not completion.

Fix:

- Centralized forward content completion inside `selectTab`, shared by header and footer navigation. Backward navigation, selecting the same tab and leaving assessment do not award completion. Assessment still requires checked answers.
- Book reader auto-completes only when every excerpt page has been seen and the end marker reached. Jumping to the end with skipped pages does not complete the reader; queued callbacks are ignored after unmount and completion is reported once.
- Kept manual completion, video-end completion, assessment restart and versioned progress storage/API format unchanged. No answer changes, bulk progress migration, curriculum changes, backend changes or schema changes.

Checks: four-tab progress tests (all 16 navigation pairs, 75% missing-book recovery, idempotence, persistence/merge/restart, reading-end/skipped-page cases), sidebar, production integration boundary, lesson navigation and book presentation passed. Full TypeScript check still reports unrelated existing server/auth, home assets, PDF canvas, API-base and Lesson page type errors; none in changed files. Production build and live checks recorded below.

## Verified production fix

- Source `6d31d46` pushed before successful Vite build. Existing Browserslist and chunk-size warnings only.
- Bundle SHA256 `28f80993762f0b0dafdc3225cae8d9c344611cbf17c88086b15ee38b28ec2358`; frontend-only atomic activation prepared 115 files.
- Completed private rollback backup `../tmp/lesson-ui-backup-20261005-book-completion/`, mode 700; previous index `1aea478deb513b33fe3129cdbc477365bda20461e46441d806c371b44cb8154f`.
- Live index `d8883d17039a68ca302eca91f8480f732cc4c6084bcfcc56b56882af173b9783`. Backend unchanged `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`; HTTP 200. Historical remote assets preserved; no process restart or bulk student-data edits.
- User's existing Chrome lesson state was retained through reload: book uncompleted, other three completed. Forward header selection from book to assessment immediately recorded the missing book flag and sidebar showed 100%.
- Existing answer count remained 5 of 5. Displayed report retained 100% mastery and all five skills. No answers entered or changed and restart button never clicked.
- Reloaded again: four completion checks, sidebar 100%, top header completed/100%, retained report. Material summary became 2%, 1 of 65 completed; expected from one fully completed lesson.
- Live console error log empty. Screenshot in workspace `production-lesson-completion-100-20261005.png` shows header, four checks and sidebar 100% together.
