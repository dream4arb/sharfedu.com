# Semester-scoped lesson navigation

Previous/next page navigation now uses only the current lesson's semester, respecting chapter and lesson order in the current CMS/fallback structure. Never link from the end of semester one into semester two or back from the start of semester two into semester one. The first entry has no previous button, the last has no next-lesson button. Unit preparations stay in their existing chronological position inside each semester. Existing return-to-dashboard action at the end is retained.

No names, identifiers, curriculum records, lesson content, progress, assessment state, sidebar styling or backend changes.

Regression checks cover both semester edges, interior neighbors, preparations, multiple chapters including empty chapters, invalid IDs and absent IDs. Existing sidebar, preparation and production-boundary tests retained.
