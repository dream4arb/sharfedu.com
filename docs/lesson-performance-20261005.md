# Polygon lesson performance — 2026-10-05

Scope: `https://sharfedu.com/lesson/secondary/math/l-mm6el08l` and reusable lesson-loading infrastructure. No curriculum content was added. No student progress, quiz answers, sessions, production database, or account configuration was replaced.

## Baseline

PageSpeed report at 20:02:11 Asia/Riyadh:
https://pagespeed.web.dev/analysis/https-sharfedu-com-lesson-secondary-math-l-mm6el08l/08grhbbnaj?form_factor=mobile

Mobile performance 48, accessibility 95, best practices 100, SEO 100. FCP 2.9 s; LCP 6.1 s; TBT 30 ms; CLS 1.179; speed index 2.9 s. Desktop performance 96, FCP 0.7 s, LCP 1.1 s, TBT 10 ms, CLS 0.06, speed index 1.4 s. These are laboratory results; PageSpeed reports no available real-user CrUX data.

## Implemented

- Determine the mobile viewport before the first React render, preventing the desktop sidebar from painting first on mobile.
- Deliver a public published-lesson/bootstrap structure with server HTML, while still revalidating against existing public APIs. No private/user/draft/progress data is embedded.
- Keep server-readable SEO content outside the client mount target, with a no-JavaScript fallback. Prevent the original article → loader → unrelated layout shift.
- Preload the lesson route and its first responsive book image; deduplicate existing script/styles and align request credentials.
- Reserve each book page's aspect ratio; retain all eight original pages, original high-resolution zoom, and official PDF links.
- Add 480/640/960/1417 px WebP variants at quality 86. First-page original: 369,624 bytes; 640 px: 67,090 bytes (81.8% smaller); 480 px: 44,348 bytes. Originals are unchanged.
- Self-host the unchanged official Tajawal WOFF2 subsets with `font-display: optional`, the font license, and the main Arabic-font preload. No Google-font connection is required at runtime.
- Load KaTeX only when formulas are used: lesson route 432 kB → 171.38 kB; gzip 124.61 kB → 46.54 kB. Book tab does not request KaTeX CSS.
- Load Home as a route chunk instead of sending home-only components with every lesson. Preserve a homepage preload. Main JS 533.11 kB → 355.91 kB; gzip 167.34 kB → 113.07 kB. Shared dependencies still load where needed.
- Remove decorative motion wrappers from the lesson page, avoiding the 111.43 kB animation dependency (36.65 kB gzip) on first load. Preserve card styling, layout and handlers; homepage animations remain available in its own route.
- Deliver standalone lesson-critical main/font CSS with lesson HTML, removing mobile render-blocking round trips. Other pages keep external cached CSS.
- Label all five rating controls for accessibility; preserve rating handlers.

## Verification

Passed: TypeScript, production build, performance regression, site SEO, four-tab progress, publication packages, protected behavior regression, production lesson integration, book presentation, sidebar, and lesson navigation tests. Local isolated API tests passed publication/revision/withdrawal/authentication and UUID progress 0 → 25 → 100 → reset/re-login. No synthetic student records were created in production.

Browser QA on Chrome at 393 × 852: first book image 295 × 380, responsive 480 px source, no horizontal overflow (viewport 394, document width 378), no console warnings/errors in local QA. Tab changes alone did not grant completion in local QA. Math rendered after deferred loading. Live browser checks displayed persisted progress and the selected tab without using any reset or answer action.

Intermediate live reports, not final claims:

- 20:27:56: mobile 88, desktop 100; accessibility/best practices/SEO 100; mobile CLS 0, TBT 0, LCP 3.4 s. https://pagespeed.web.dev/analysis/https-sharfedu-com-lesson-secondary-math-l-mm6el08l/qo13b1sqsg?form_factor=mobile
- 20:33:20 after CSS deduplication and 640 px images: mobile 88, CLS 0, TBT 0, LCP 3.2 s; image opportunity reduced from 499 KiB baseline to 13 KiB. https://pagespeed.web.dev/analysis/https-sharfedu-com-lesson-secondary-math-l-mm6el08l/5ljcho82o0?form_factor=mobile

## Final live result

PageSpeed report at 20:43:30 Asia/Riyadh, after final activation:
https://pagespeed.web.dev/analysis/https-sharfedu-com-lesson-secondary-math-l-mm6el08l/pwl2538oy4?form_factor=mobile

Mobile performance **91** (baseline 48), desktop **100** (baseline 96). Accessibility, best practices and SEO are **100** on both devices. Mobile FCP 2.4 s, LCP 3.0 s, TBT 0 ms, CLS 0, speed index 2.9 s. Desktop FCP 0.3 s, LCP 0.6 s, TBT 0 ms, CLS 0, speed index 0.9 s. These are a single final laboratory report, not a guarantee of future scores or rankings; real-user CrUX data is unavailable. Screenshots retained locally as `.local/pagespeed-mobile-after.jpg` and `.local/pagespeed-desktop-after.jpg`.

## Safe deployment

Backups are private, with consistent SQLite safety snapshots; no automatic database restore. Only PM2 app ID 0 (sharfedu) is restarted; the unrelated app is untouched. Existing hashed live assets are retained for older open sessions.

- Initial backup: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/tmp/performance-backup-20261005`.
- Responsive/CSS-dedup backup: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/tmp/performance-final-backup-20261005`.
- Route-loading/critical-CSS backup: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/tmp/performance-routing-backup-20261005`.
- Motion-free lesson backup: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/tmp/performance-lightweight-backup-20261005`.
- Final candidate backend SHA-256: `4a9712544753567e7938a0fec10003d9a5eb2de889fc3093723d2f301247b2d4`.
- Final deployment bundle SHA-256: `ddb4172531d013c38cfceb35630d504fc6181e85e9a998f85cc7dbf79f5d8005`.

All deployment candidates must pass 18 isolated HTTP/SEO/private-access checks before activation. Live sitemap verification checks 19 unique published URLs.
