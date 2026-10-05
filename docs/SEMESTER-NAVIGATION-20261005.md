# Semester-scoped lesson navigation

Previous/next page navigation now uses only the current lesson's semester, respecting chapter and lesson order in the current CMS/fallback structure. Never link from the end of semester one into semester two or back from the start of semester two into semester one. The first entry has no previous button, the last has no next-lesson button. Unit preparations stay in their existing chronological position inside each semester. Existing return-to-dashboard action at the end is retained.

No names, identifiers, curriculum records, lesson content, progress, assessment state, sidebar styling or backend changes.

Regression checks cover both semester edges, interior neighbors, preparations, multiple chapters including empty chapters, invalid IDs and absent IDs. Existing sidebar, preparation and production-boundary tests retained.

## Publication and live verification

- Sidebar, unit preparation, production integration, four-tab progress and lesson navigation tests passed; frontend build passed.
- Frontend-only bundle SHA256 `9f7c06a21fef21d8c2c979932ca2ab256b974006c7eab0a26ab73baab6acdb69`, 115 files, atomic activation. Private rollback backup: `../tmp/lesson-ui-backup-20261005-semester-navigation/`.
- Live index SHA256 `b45c58adf4676de031594dcd97ae592b74b1ced39622d585e0a6e050ce46efa7`. Backend unchanged: `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`. Preparation page HTTP 200.
- Live DOM verification of current CMS structure: `intro-1` has no previous button and retains next to التبرير الاستقرائي والتخمين; `math-high1-s1-4-6` has no next-lesson button and retains previous to متباينة المثلث; `math-high1-s2-prep-5` has no previous button and retains next to زوايا المضلع; `l-ml48d59z` has no next-lesson button and retains previous to the circle exploration.
- Screenshot proof in main task workspace: `production-semester-start-20261005.png` and `production-semester-end-20261005.png`. No user quiz or completion action performed.
