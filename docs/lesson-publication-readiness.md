# Lesson authoring and publication readiness — 2026-10-05

## Authoring workflow

In `/admin`, select **إعداد الدروس والنشر**, then select an existing lesson from
the academic hierarchy. Unit preparations are intentionally excluded.

1. Choose the subject profile: mathematics, English, science, Islamic studies,
   Arabic, or general. Section labels, teaching content and activities remain editable.
2. Supply the curriculum edition and source evidence, book page images/PDF references,
   objectives, explanation, video, activities, summary, skills and assessment answer keys.
3. Save a private draft. Draft changes never replace the approved public snapshot.
4. Run completeness validation, review the book/video/content/answers, confirm review,
   and approve publication. The public package, readable SEO text, metadata and sitemap
   all derive from the same approved snapshot; no code whitelist change is required.
5. Withdrawal removes public approval but retains the draft. Revisions protect against
   concurrent editors silently overwriting each other.

The sitemap is generated from the approved catalog on every request: publication is
reflected immediately, without waiting for the scheduled refresh. Empty lessons remain
excluded and noindexed. Approval does not guarantee a Google ranking or indexing date.

## Progress rules

- Opening or switching tabs earns no progress.
- Book: actual content scrolling, all listed pages viewed and the final content reached.
- Interactive explanation: actual downward content scrolling and the final section reached.
- Video: confirmed YouTube playing state or native media `playing` event, not preview load.
- Assessment: completed answer grading/report workflow. Each completed tab contributes 25%.
- Retesting resets assessment only; resetting lesson progress requires confirmation.
- Saved records are preserved; these rules do not retroactively revoke existing progress.

Authenticated progress endpoints use the signed-in account ID, including UUID/text IDs,
and reject attempts to read/write another account's progress. No database migration was
needed. Quiz results remain browser-local and account/lesson scoped; cross-device quiz
result synchronization has not been implemented or claimed.

## Verified

- TypeScript check: zero errors; production build succeeded.
- Automated tests: progress model/integration, flexible publication packages, publication
  API, UUID progress API, SEO, site integration, lesson sidebar and lesson navigation.
- Isolated student account: rapid tab switching stayed 0%; actual book and explanation
  end scrolling and real YouTube playback credited the corresponding tabs; full journey
  reached 100%; leaving/revisiting/reloading kept the result and progress.
- Desktop and a 390px mobile browser viewport tested. This is responsive simulation,
  not a physical-phone test.
- Retest removed only assessment progress; canceling full reset preserved progress;
  confirming full reset cleared all four tabs. API logout/login retained account progress.
- Isolated editor account: incomplete publication rejected; approved synthetic fixture
  simultaneously appeared in content/SEO/sitemap; draft edits left approval unchanged;
  conflicts rejected; withdrawal restored exclusion. No synthetic lesson was published live.
- Production candidate checked against a private database snapshot before activation.
  Live SEO check passed for all 19 sitemap URLs, redirects, canonical/schema metadata,
  noindex/404 boundaries and protected admin endpoints.
- Live polygon lesson reload retained the existing student's 100% and visible result.

## Deployment safety

Backup: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/tmp/readiness-backup-20261005`
(directory 700, consistent database safety snapshot 600). Only app PM2 ID 0 restarted.
Production database, environment and student data were not replaced. Old hashed assets
remain available on the live server for existing sessions. PDF.js worker matches 5.4.624.

This release prepares authoring infrastructure; it does not populate all lessons.
Curriculum accuracy, media permissions and answer correctness still require per-lesson
review. The existing dependency audit warnings were not fixed in this scoped release;
this is not a full security audit.
