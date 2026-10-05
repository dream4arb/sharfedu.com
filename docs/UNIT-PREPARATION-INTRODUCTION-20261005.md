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
