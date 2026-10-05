# Unit preparation presentation — 2026-10-05

Authorized: preparation is a distinct, unnumbered introduction within each unit, before instructional lessons, excluded from course progress, with a short ungraded review rather than four lesson tabs.

- Identify the eight audited first-secondary mathematics preparation entries by stable IDs derived from the unchanged curriculum manifest. Preserve all 73 identifiers, original book titles, order, URLs, CMS records and historical progress records.
- Number the remaining 65 instructional/exploration/extension entries independently (35 first semester; 30 second semester). Search preserves those numbers and can find preparations across semesters.
- Existing subject outline progress uses exactly the 65 instructional IDs for both numerator and denominator. Preparations never call progress APIs or persistence. No student records are erased or rewritten.
- Dedicated preparation view: prerequisite reminders, two original platform warm-up questions per unit with immediate explanations, no grades, no completion button, no four tabs and no rating. Clearly attributed to platform authoring, not ministry transcription. CTA opens first instructional entry in the same unit.
- Existing regular lesson rendering, other site pages, shared sidebar framework, backend and database are unchanged. Polygon remains the only published four-tab lesson.

Regression checks passed: test-unit-preparation, test-lesson-sidebar, test-production-lesson-integration, test-four-tab-progress, test-lesson-presentation and test-lesson-navigation. Vite production build passed (existing size/Browserslist warnings).

Deployment and live verification will be recorded after fresh private backup and atomic frontend activation.
