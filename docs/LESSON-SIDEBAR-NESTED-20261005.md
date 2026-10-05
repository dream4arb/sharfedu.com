# Nested unit / lesson frames — 2026-10-05

User requested all lessons to appear inside their own unit's frame, with clearer visual distinction between units and individual lessons.

- Border moved to the enclosing chapter section (header + collapsible panel together).
- Unit headers now use a tinted background, larger bold title and solid book icon.
- Inset lesson panel has a subtle background and explicit دروس الوحدة label; smaller numbered white lesson cards remain inside the unit frame.
- Same rendering for all chapters, search results, desktop and mobile.
- Search, accordion state, lesson IDs/names, attachment/admin actions, lesson content and 25%-per-tab progress logic unchanged.

Verification:

- test-lesson-sidebar.ts, test-production-lesson-integration.ts and test-four-tab-progress.ts PASS; successful Vite build.
- Production: chapter 5 header and all 8 lesson links share the same bordered section and nested panel.
- Closing chapter 5 and opening chapter 6 showed the 6 similarity lessons inside its own frame.
- Cross-semester المنطق search retained chapter 1 frame and original lesson number 3.
- Mobile 390 x 844: every lesson card stayed strictly inside the unit's horizontal boundaries, no horizontal overflow. Viewport reset after testing.
- Final console error log empty; GET lesson route HTTP 200. No student progress writes performed.

Source commit: 7607bd6 (pushed before activation).
Backup: ../tmp/lesson-ui-backup-20261005-sidebar-nested/
Previous index SHA256: 0292996c56e31205d5a54ae195fd0df9478cc58349352103be1e108701d951d6
Published index SHA256: 6791a41df2e2cebadd4373061b6d1262756139dcd71477a554ddbafad0814f4a
Bundle SHA256: 364fa6faa8344cce43aa236523e848a2e9e084f4175a693e8b8892d59efc27c9
Backend index.cjs unchanged: 7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63
Frontend-only publication retained old remote hash assets; no backend/database change or process restart.

Screenshots:
C:/Users/سعيد/Documents/Codex/2026-08-31/new-chat-4/production-sidebar-nested-20261005.png
C:/Users/سعيد/Documents/Codex/2026-08-31/new-chat-4/production-sidebar-nested-mobile-20261005.png

## Follow-up: unit label only

At the user's request, removed the lesson count from all unit headings, keeping unit number and title. Source commit 7cb4aaf. No other UI/progress/content change.

Sidebar and production integration tests PASS; Vite build successful. Live browser verified units 1–4 and 5–8 display only the unit number and name. Final console error log empty; production GET 200.

Backup: ../tmp/lesson-ui-backup-20261005-unit-label/
Published index SHA256: d2ddaefc4afa13ef7e866fa698185a7dad07a9a87a03d86a20a7abb7b62b86af
Bundle SHA256: 045ef9d1efd32cf4abdd504f4571d7a85faa65e468519c6f3dfae3445ee6d209
Backend unchanged. Old remote assets retained; no restart or student data modification.
Evidence: C:/Users/سعيد/Documents/Codex/2026-08-31/new-chat-4/production-sidebar-unit-label-20261005.png
