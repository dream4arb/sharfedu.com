# Unit preparation presentation — 2026-10-05

Authorized: preparation is a distinct, unnumbered introduction within each unit, before instructional lessons, excluded from course progress, with a short ungraded review rather than four lesson tabs.

- Identify the eight audited first-secondary mathematics preparation entries by stable IDs derived from the unchanged curriculum manifest, including the preserved production ID `intro-1` for chapter 1. Preserve all 73 identifiers, original book titles, order, URLs, CMS records and historical progress records.
- Number the remaining 65 instructional/exploration/extension entries independently (35 first semester; 30 second semester). Search preserves those numbers and can find preparations across semesters.
- Existing subject outline progress uses exactly the 65 instructional IDs for both numerator and denominator. Preparations never call progress APIs or persistence. No student records are erased or rewritten.
- Dedicated preparation view: prerequisite reminders, two original platform warm-up questions per unit with immediate explanations, no grades, no completion button, no four tabs and no rating. Clearly attributed to platform authoring, not ministry transcription. CTA opens first instructional entry in the same unit.
- Existing regular lesson rendering, other site pages, shared sidebar framework, backend and database are unchanged. Polygon remains the only published four-tab lesson.

Regression checks passed: test-unit-preparation, test-lesson-sidebar, test-production-lesson-integration, test-four-tab-progress, test-lesson-presentation and test-lesson-navigation. Vite production build passed (existing size/Browserslist warnings).

## Deployment and live verification

- Source commits `7c51e65`, `f16df11` pushed before activation. Initial browser check found retained `intro-1`; final revision correctly excludes all eight preparations.
- Original pre-change rollback: `../tmp/lesson-ui-backup-20261005-preparation/`, permissions 700, original index SHA256 `d2ddaefc4afa13ef7e866fa698185a7dad07a9a87a03d86a20a7abb7b62b86af`.
- Final activation backup: `../tmp/lesson-ui-backup-20261005-preparation-final/`. Bundle SHA256 `c5d1af30fb8736eb2a867f774e948eb95d4f474e02773387b46f829d816b4c87`; live index SHA256 `da6dd96660eebf3da02e24f59dca00f270aa51a3e6c5abd82ca60d2ac7b251c7`.
- Backend SHA256 remains `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`. No database writes, restarts or credential changes. Remote historical hashed assets retained.
- Production GET 200. Read-only public structure confirms 73 entries, eight preparations. Browser search returns eight preparation cards; outline completion denominator is 65.
- Isolated guest QA: polygon remains 100%, four original tabs present, first instructional entry numbered 1. Preparation question selection (incorrect then correct) does not alter progress. Chapter 1 original `intro-1` opens proper review with no tabs/completion status; chapter 5 CTA opens polygon.
- Mobile 390×844: page client/scroll widths both 375 (no horizontal overflow); drawer closes after preparation selection (exit animation settles; dialog count 0). Viewport reset.
- Screenshots: workspace `production-unit-preparation-20261005.png` (desktop/full context) and `production-preparation-mobile-20261005.png`.
- TypeScript check reports only existing unrelated errors: bcrypt modules/auth fields, image declarations, PDF canvas, ImportMeta.env and SubjectData.grades. No new preparation/component errors.
