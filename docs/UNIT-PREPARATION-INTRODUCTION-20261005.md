# Preparation correction: unit introduction, not questions

User explicitly requested removal of preparation questions and introduction of each unit's basic idea from the book. This supersedes the warm-up-question presentation recorded in UNIT-PREPARATION-20261005.md.

- Removed the entire question registry, selection state, option buttons and feedback section. No questions, hints, answers or scoring remain in preparation views.
- Each of the eight preparation views now starts with `الفكرة الأساسية`, followed by learning goals and a simplified real-life application, paraphrased from the book's chapter-opening `والآن` and `لماذا؟` sections. A short book/page attribution distinguishes paraphrase from verbatim transcription.
- Visually reviewed all eight full opening pages; extraction alone was not reliable because some PDF fonts have nonstandard encodings.

| Unit | Book | Printed opening page |
| --- | --- | --- |
| 1: التبرير والبرهان | الرياضيات 1-1 | 10 |
| 2: التوازي والتعامد | الرياضيات 1-1 | 84 |
| 3: المثلثات المتطابقة | الرياضيات 1-1 | 144 |
| 4: العلاقات في المثلث | الرياضيات 1-1 | 212 |
| 5: الأشكال الرباعية | الرياضيات 1-2 | 10 |
| 6: التشابه | الرياضيات 1-2 | 70 |
| 7: التحويلات الهندسية والتماثل | الرياضيات 1-2 | 116 |
| 8: الدائرة | الرياضيات 1-2 | 176 |

Local source files verified visually: primary repository `.local/math1-student-official.pdf` (274 pages; SHA256 `2ccfb468d0723a8c0b84eaa8d76c6f89d6759cea0ec83140dea5e788a8099bbc`) and `.local/math1-part2-official.pdf` (248 pages; SHA256 `7990cdac13951368de4e9ee6e17ab936a8dba77db4fb0e54240414a97232fac4`). Book identification follows rendered chapter titles, not filenames or prior manifest hash labels.

No changes to sidebar hierarchy/IDs, book-order names, regular lesson content, other pages, backend, database or student progress. Preparation remains unnumbered, ungraded, outside the 65-entry progress calculation.

Checks passed: test-unit-preparation, test-production-lesson-integration, test-lesson-sidebar, test-four-tab-progress. Final deployment/live checks recorded below after activation.

## Verified production activation

- Source commit: `feb90ef`, pushed before building. Vite production build and whitespace checks passed.
- Uploaded frontend bundle SHA256: `e9ead0a881cd496ab66a7b9d8e67709bef83d4880d09761db9c09631b6e44626`.
- Completed private rollback backup: `../tmp/lesson-ui-backup-20261005-preparation-idea/`, directory mode 700. Previous index SHA256: `da6dd96660eebf3da02e24f59dca00f270aa51a3e6c5abd82ca60d2ac7b251c7`.
- Atomic activation confirmed; live index SHA256: `3ccd6d68d43d9bd9505d4fbb4893c710549921c50b7542a7e235fd07e61e40cc`. Backend unchanged: `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`.
- Production preparation route returned HTTP 200. Browser checks visited all eight preparation cards and verified the custom basic idea, correct book/page attribution, and absence of question groups.
- Unit 5 live DOM starts with the basic idea, followed by learning goals and application. No fieldsets or answer controls remain; first-lesson link still targets the published polygon lesson.
- Responsive check at 390 x 844: document client/scroll widths both 375, no horizontal overflow. Full visual inspection passed; temporary viewport override reset.
- Existing isolated guest progress remained 100% for polygon angles, 2% material progress, 1 of 65 complete. No student records were changed.
- Full-page screenshot: workspace `production-preparation-idea-20261005.png`.
