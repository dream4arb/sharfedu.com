# Persistent assessment result visibility

User requested that the result always appear when returning to the assessment tab, until pressing Restart Assessment.

Cause: returning to the report required `session.completedAt`, which is awarded only when all four tabs are complete. Result rendering also required a transient report step. Thus a checked quiz could return to the questions and the redundant Show Results gate.

Fix: derive report visibility directly from the saved checked-answer completeness when in the assessment tab. Return navigation selects the report whenever all quiz questions have been checked, regardless of overall lesson completion or saved step. Remove the redundant Show Results button; an incomplete test explains that the result appears automatically. Existing result review accordion and correction flow are retained. Restart clears quiz answers as before and is the only normal action that returns the completed quiz to an unanswered test.

No answer reset, score change, new storage key, backend or schema change. Existing sessions including those without completedAt display their retained results.

Verification: mastery report tests cover restored complete quiz without completedAt and with saved book step, retained answers, restart and reload after restart. Four-tab progress, navigation and production-integration tests and production build run before frontend-only publication. Live return and refresh checks recorded after deployment.

## Production verification

- Source commit `de04c10`; successful Vite build, mastery-report, four-tab-progress, navigation, production integration, presentation and activities tests.
- Frontend-only publication prepared 115 files with private rollback backup `../tmp/lesson-ui-backup-20261005-persistent-result/`; previous index preserved. Bundle SHA256 `3585af3abd20a05673cc3e991904f01a7f02765bb15f1c20dbdebf1eefa16e71`.
- Activated index `cecece8fe71d905b04f0db0de060aeb6a938e2d552e45c675844a7aeea688817`; backend unchanged `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`, live HTTP 200. Older remote assets retained.
- User Chrome: left assessment for video, returned to assessment; result visible immediately, zero Show Results buttons. Refreshed and waited for page render; result remained visible. Opened answer review: all five correct answers retained; overall mastery 100%. No restart or answer edits performed on user's session.
- Closed answer review and captured `production-persistent-result-20261005.png`. Live console error log empty. Existing restart clearing/reload behavior covered by automated tests; no user data reset for testing.
