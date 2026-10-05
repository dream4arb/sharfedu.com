# Production lesson sidebar redesign — 2026-10-05

User authorized replacing the lesson sidebar with a more professional outline inspired by the existing attachment cards. No curriculum, lesson content, other page, database, or backend change.

## Delivered

- Scoped, reusable RTL LessonSidebar with quiet white cards and teal current-lesson accent.
- Semester selector, individually expandable chapter headings, current chapter automatically opened on lesson navigation.
- Arabic-normalized search across all semesters, original lesson numbering and CMS title overrides retained, clear/no-result handling.
- Current-lesson shortcut scrolls only the sidebar; respects reduced-motion preference.
- Existing per-lesson percentages and subject progress are read from the same progress provider; no completion/grade writes or new scoring behavior.
- Four existing attachment destinations/placeholder handling retained. Mobile drawer closes on lesson, attachment, home, or stage navigation.
- Keyboard-accessible search, semantic accordion buttons, focus outlines and aria-current.
- Existing administrator lesson/chapter add/edit/delete actions retained outside navigation links.

## Verification

- PASS test-lesson-sidebar.ts: Arabic search, cross-semester results, IDs and numbering, active location, no curriculum mutation, admin/attachment/progress wiring.
- PASS test-production-lesson-integration.ts: main lesson body and admin dialogs equal pre-redesign 364f773; audited curriculum unchanged; other pages/shared sidebar/backend unchanged; only polygon published.
- PASS test-four-tab-progress.ts, test-lesson-presentation.ts, test-lesson-navigation.ts.
- Vite production build successful. TypeScript still reports only the pre-existing bcrypt/auth user typing, image module declarations, PDF canvas, import.meta.env and SubjectData.grades errors; no new sidebar type errors.
- Production browser: polygon's semester 2 / chapter 5 automatically opened; completed test guest polygon 100%, unrelated parallelogram 0%, material aggregate 1% across 73 entries.
- Search for المنطق while semester 2 selected returned its semester 1 lesson with original number 3. Clear search, semester selection and keyboard Enter on chapter headings verified.
- Existing worksheets placeholder page still opens; no fictitious files added.
- Mobile 390 x 844: search and cards fit; selecting a lesson closes drawer and preserves route/progress. Opening an attachment closes the drawer without covering the placeholder. Viewport reset afterward.
- Final browser console error log empty. Production route GET returned HTTP 200.
- No real student account/progress data edited; browser QA used the prior isolated guest session.

## Deployment / recovery

Source commits: d16b5ee, 45368b8, pushed to feat/production-lesson-tabs-20261004 before activation.

Frontend-only assets deployed; old hashed assets retained remotely, no restart.

Original pre-redesign backup:
../tmp/lesson-ui-backup-20261005-sidebar/index.html
SHA256 b35d6cb04466c6a05f42e68f250185586e79bdf0259edbf49a7590e42145a9eb

Final polish backup:
../tmp/lesson-ui-backup-20261005-sidebar-final/

Final production index SHA256:
0292996c56e31205d5a54ae195fd0df9478cc58349352103be1e108701d951d6

Final bundle SHA256:
eac974bcca73967ae9322ecba26bc82d75cbe36a3ce53ed881c9dd008b559ca2

Backend index.cjs SHA256 unchanged:
7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63

Private publisher retained within each backup. For a user-requested rollback use the original backup publisher with --rollback --backup-name lesson-ui-backup-20261005-sidebar from the application public_html working directory. Do not delete old assets or restart unrelated services.

Desktop evidence: C:/Users/سعيد/Documents/Codex/2026-08-31/new-chat-4/production-sidebar-redesign-20261005.png
Mobile evidence: C:/Users/سعيد/Documents/Codex/2026-08-31/new-chat-4/production-sidebar-mobile-20261005.png
