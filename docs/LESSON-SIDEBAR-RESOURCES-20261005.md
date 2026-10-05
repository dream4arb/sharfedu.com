# Direct material resources below units

User requested removal of the collapsible attachments section; its four cards should appear directly below the units with only a divider.

- Removed the attachments heading/toggle and open state. Cards are always shown below the unit navigation when not searching, without a nested frame or a second click.
- Preserved card labels, icons, descriptions, selected-semester URL resolution, existing attachment viewer, and mobile drawer closing behavior.
- Retained lesson search behavior: resources are hidden during lesson search and return when search is cleared.
- No lesson content, curriculum IDs/names/order, preparation content, student progress, backend, database, or other page changes.
- Regression tests passed: lesson sidebar, production integration boundary, unit preparation, and four-tab progress; whitespace check passed.

Production deployment and live verification are recorded below after activation.

## Production verification

- Source commit `de541b8` pushed before publication. Vite build succeeded with only existing Browserslist/chunk-size warnings.
- Private rollback backup `../tmp/lesson-ui-backup-20261005-direct-resources/`, permissions 700. Previous live index: `3ccd6d68d43d9bd9505d4fbb4893c710549921c50b7542a7e235fd07e61e40cc`.
- Frontend bundle: `3fe71fad46ac0da34d0834eaa40aaa21dbe47cae095a59cc1300f47717955ca8`. Prepared 115 files and atomically activated index `1aea478deb513b33fe3129cdbc477365bda20461e46441d806c371b44cb8154f`.
- Backend hash unchanged: `7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63`. Production GET returned 200. Historical remote assets retained; no restart or database changes.
- Live browser: both semester outlines followed by a separator and four directly visible resource buttons; no attachments menu button. All four buttons opened the correctly named viewer. Second-semester book viewer retained `/attachments/book-math-high1-s2.pdf`.
- Search hides resource cards and clearing search restores all four. Mobile 390 x 844: drawer displayed direct cards, resource selection closed the drawer and opened its viewer; document client/scroll widths both 390. Viewport reset after checking.
- Existing isolated guest progress remained 2%, 1 of 65 instructional lessons completed. Browser console error log empty.
- Screenshot: workspace `production-sidebar-direct-resources-20261005.png`. Only ordinary sidebar scrolling was used for the screenshot; no page content/style modifications.
