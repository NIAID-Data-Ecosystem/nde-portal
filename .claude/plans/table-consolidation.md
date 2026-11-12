# Plan: table consolidation (shared DataTable)

Working plan for consolidating the app's tables onto one shared table system. It
records the decisions the project owner approved on 2026-11-06, the limits on
them, and progress so far. It applies only to this effort. Permanent project
rules stay in `.claude/CLAUDE.md`.

- **Branch:** `chakra-v3-migration-table-reconciliation` (off the Chakra v3
  migration).
- **Status (2026-11-09):** Phases 0–2 committed as WIP (`df420ed3`). The pilot
  is **in evaluation**: rounds 1–3 (§9) are done. Round 3 (bounded by default,
  natural height via `maxHeight='none'`) is implemented, uncommitted, and
  benchmarked against r4. Don't start Phase 3 until the owner signs off.
- **Update this file** when a decision changes, a phase finishes, or an
  intentional behaviour change is made.

---

## 1. Approved decisions (all 14, with their qualifications)

1. **TanStack Table vs. our own hook: our own hook, for now.**

   - Build the smallest maintainable implementation; don't rebuild a
     general-purpose table library.
   - If the shared hooks grow disproportionately complex, reassess TanStack.
   - Keep the architecture open to that switch: `ColumnDef` deliberately mirrors
     TanStack's (`id`, `header`, `accessor`, `cell`). Revisit if resizing,
     multi-column pinning, row selection or similar advanced features become
     necessary.

2. **Remove virtualization (Repository Matcher, Saved) only if a measured
   comparison supports it.**

   - Compare the virtualized implementation against the native table with
     representative data under realistic conditions; the Repository Matcher is
     the reference case.
   - Define measurable criteria for initial render, scrolling responsiveness and
     interaction performance _before_ making the change (done; see §4).
   - If performance is insufficient, optimize first (e.g. lazy tooltip
     initialization).
   - **Don't add 50-row pagination** without revisiting the decision with the
     owner; it's a significant behaviour change, particularly for Ctrl+F.

3. **Sort cycle: two states, ascending ↔ descending, no unsorted state.**

   - First click is descending for dates and numbers, ascending otherwise.
   - Search's server-side sorting must stay intact (see §3).

4. **Missing values: a muted `—` with an accessible "No data" label.**

   - Only for genuinely missing values (`null`, `undefined`, blank, empty
     array). Meaningful values such as "Unknown", "Not applicable" or `0` are
     shown as they are.
   - The dash and the label must not double-announce: the dash is `aria-hidden`
     and the label visually hidden.

5. **Pin control lives in Customize Columns**, saved per table, and is disabled
   or ignored below the `md` breakpoint. Pinning stays optional, enabled only
   where appropriate.

6. **Column reordering is on for the Repository Matcher**, but remains an
   _optional_ feature of the shared system (`allowReorder`). Preserve Search's
   existing drag-and-drop reordering and its keyboard alternatives (Move up/down
   buttons, dnd-kit keyboard sensor).

7. **Top scrollbar:** on for Search initially, off by default elsewhere.
   Re-evaluate whether Search still needs it once the new height and scrolling
   behaviour is in place. Avoid redundant controls while keeping horizontal
   navigation convenient.

8. **REVISED in §9 round 2: natural height by default; the parent may pass a
   `maxHeight`.** The original decision follows. **Height:** Category 1 tables
   use a viewport-aware maximum height; resource page sub-tables keep their
   smaller, appropriate limits.

   - The owner rejected assuming `100dvh − gap` makes the bottom scrollbar
     reachable, because it ignores where the table sits on the page.
   - Prefer an approach that considers available viewport space where practical,
     without unnecessary JavaScript, nested scrolling problems or mobile scroll
     traps.
   - **Verify actual behaviour at different viewport sizes and table
     positions**; don't assume.
   - Implemented: `maxHeight='viewport'` from `md` up; below `md` the page
     scrolls instead of the table. A floating scrollbar is fixed to the window
     bottom while the table's own is below the fold. Verified by
     `e2e/layout/repository-matcher.spec.ts`.

9. **Stored settings: migrate, don't reset.**

   - Migrate existing localStorage preferences (keys in §5) instead of resetting
     users' columns.
   - Preserve existing visibility, ordering and required/fallback column
     behaviour across the different Search tables.
   - Newly introduced columns must behave sensibly for users with saved
     preferences: they take their default visibility and slot in after their
     nearest predecessor in the default order.

10. **Conditions of Access in Search tables:** reuse the result cards'
    `ConditionsOfAccess` badge. This applies to Search only; the Repository
    Matcher keeps its existing coloured-dot tag.

11. **REVISED in §9 (rounds 1–2): an InfoLabel-style info icon beside the title;
    hover/focus tooltip on desktop, tap on touch.** The original decision
    follows. **Header descriptions go on the sort button, with no separate info
    icon.**

    - Descriptions must remain accessible for columns that aren't sortable.
    - Tooltips must support keyboard and touch.
    - The description must not interfere with the sort action or change the
      button's accessible name: it's exposed via `aria-describedby`.

12. **Dates:** standardize on ISO `YYYY-MM-DD` via the existing `formatDate`
    (`src/utils/api/helpers.ts`), including on the Saved page.

13. **Strict-port exemption, limited scope.**

    - The Chakra v3 "strict port" rule (visual/behaviour parity) is waived only
      where needed to implement the agreed improvements, and **only for the
      tables and their shared components**, not for unrelated migration work.
    - Document every intentional visual or behaviour change (§6) and validate it
      against the existing implementation.
    - Preserve existing functionality unless a change was explicitly approved as
      part of this consolidation.
    - **Don't make unrelated visual changes simply for the sake of
      standardization.**

14. **Layout specs allowed under `e2e/layout/`**, alongside the a11y specs.
    - Use Playwright to verify real browser layout: sticky headers, pinned
      columns, adaptive widths, scrolling, responsiveness.
    - Test meaningful layout and interaction behaviour, not brittle
      pixel-perfect assertions.

## 2. Implementation expectations (apply to every phase)

1. **Separation of concerns.** The shared table system is independent of data
   fetching, API-specific logic and page-level query state. React Query hooks,
   filtering, URL synchronization and Search pagination stay owned by their
   views.
2. **Sensible defaults over configuration.** Common tables need few props.
   Numeric columns get alignment and formatting automatically (via `type`).
   Pinning, reordering and the top scrollbar are explicitly opt-in.
3. **Validate adaptive widths with realistic content.** Don't assume min/max
   behaves as intended under `table-layout: auto`. Test mixed short and long
   text, identifiers, tags, different visible-column sets and narrow viewports.
4. **Protect existing behaviour**, especially Search's server-side sorting,
   column customization, persistence, pagination and card/table view switching.
   Loading, error, empty and expanded-content states must stay functional and
   accessible.
5. **The Repository Matcher is a genuine pilot.** Implement and validate it,
   then stop for the owner to evaluate the API, layout, usability, accessibility
   and performance before adopting the approach elsewhere. If the pilot exposes
   architectural or UX issues, revisit decisions before expanding.
6. **Incremental.** Follow the phases with tests and validation at each stage.
   No broad changes across all tables before the foundation is proven.

## 3. Existing functionality that must be preserved

**Search (Phase 4)** in `src/views/search/components/results-list/`:

- **Sorting:**
  - Server-side, controlled. The URL `sort` param uses the API format
    (`name.raw`, `-date`).
  - Column `apiSortField` ↔ column id mapping (today `deriveControlledSortProps`
    and `getApiSortFieldForProperty` in `results-table/utils.ts`).
  - A sort change resets to page 1 (`from: 1`) and updates both the pagination
    context and the URL (`updateRoute`).
  - The toolbar "Sort by" select stays in sync with the header controls, and
    "Best match" (`_score`) remains reachable from it.
  - A hidden sorted column keeps sorting server-side (no client fallback).
- **Pagination:** the page-level `Pagination` above and below the results
  (shared with card view), 10/50/100 per page, and the `MAX_RESULTS` banner. It
  stays in the view.
- **View switching:**
  - The card/table radio (`useViewMode`, persisted per tab, gated by
    `SHOW_SEARCH_VIEW_MODES` / `SHOW_DATA_COLLECTIONS_VIEW_MODES`).
  - Field lists are chosen per tab, not per view mode, so switching never
    refetches.
- **Column customization:**
  - Drag-and-drop plus Move up/down, search within the list, Select All / Clear
    All.
  - "(shown by default)" fallback labels, required columns.
  - Per-tab persistence.
- **Content and states:**
  - The top scrollbar (decision 7); `referrerPath` on resource links.
  - Expandable description/author text and expandable lists.
  - Page-level `EmptyState` and `ErrorMessage` (shared with card view; the table
    only shows loading).

**Saved (Phase 3)** in `src/views/saved/`:

- Client-side search and sort.
- Client pagination (default 5 rows; options 5/10/50/100).
- Bookmark toggles inside the name cells.
- The two empty messages ("Nothing saved yet" / "No matches").
- The error banner and toast.

**Home (Phase 3)** in `src/views/home/components/TableWithSearch/`:

- Search and filter popover, filter tags with "Clear all".
- Client sort, results count.

**Repository Matcher (done):** search across all columns including hidden ones,
the facet sidebar and filter tags, the data dictionary, and required `name`.

## 4. Performance requirements

Harness: `e2e/perf/repository-matcher.perf.mjs`; method and full results are in
`e2e/perf/README.md`.

- Runs against a production static export with recorded production API data
  (gitignored `e2e/perf/.cache/`, 70 rows), in Chromium at 1× and 4× CPU
  throttle, taking medians of 5 runs.
- The baseline is the virtualized `Table` at commit `da3e97b2`.

**Acceptance criteria, all at both 1× and 4×:**

1. Initial render: latency and total blocking time no more than 10% above
   baseline.
2. Scrolling: janky frames (>50 ms) and p95 frame time no worse than baseline,
   on both axes.
3. Interactions (sort, pin, hide/show column, search filter/clear, expand):
   latency and INP no more than 10% above baseline, and at 1× every INP ≤ 200
   ms.

**Pilot result:**

- **Met:** load (+2–4%), vertical scrolling (4× janky frames 24 → 6), sort, pin,
  hide/show column, search clear.
- **Missed:**
  - Typing in search: INP +33–35% (216 ms at 1×). Cause: a one-time web-font
    load that re-lays out the whole page.
  - Expand: +27–145%. Cause: native table relayout.
  - Horizontal scroll p95 at 4×: 33 vs 17 ms, no janky frames.
- The owner hasn't yet decided whether to accept these. Re-run the harness
  before and after any change that affects rendering cost.

**Optimizations already applied:**

- Tags and "No data" are plain elements styled by the recipe.
- Tag tooltips mount on the first real pointer movement.
- `RepositoryMatcherTable` is memoized.
- `useDeferredValue` row rendering, with the first 20 rows painted immediately.

CSS containment was tried and had no effect.

## 5. Legacy localStorage keys to migrate (decision 9)

New key format: `nde:table:<tableId>:v1` → `{ v: 1, visible, order, pinned }`.
Pass old keys as `legacyKeys` to `useColumnPreferences`. They're read until the
first change, then removed.

| Table                         | Legacy visible key                          | Legacy order key                                  | Required         | Fallback ("Clear All" keeps) |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------- | ---------------- | ---------------------------- |
| Repository Matcher (migrated) | `repository-matcher-visible-columns`        | `repository-matcher-column-order` (never written) | `name`           | —                            |
| Search: Samples               | `search-visible-sample-columns`             | `search-sample-column-order`                      | `identifier`     | required                     |
| Search: Datasets              | `search-visible-dataset-columns`            | `search-dataset-column-order`                     | —                | `name`                       |
| Search: Computational Tools   | `search-visible-computational-tool-columns` | `search-computational-tool-column-order`          | —                | `name`                       |
| Search: Data Collections      | `search-visible-data-collection-columns`    | `search-data-collection-column-order`             | `name`, `source` | required                     |

- Default visible ids are in each table's
  `components/CustomizeColumnsPopover.tsx` wrapper. Required and fallback ids
  are in `results-table/constants.ts`.
- Samples and Data Collections are read today by hand-rolled helpers in
  `results-list/index.tsx`. Confirm their edge cases (empty or invalid stored
  arrays → defaults) survive the migration.

## 6. Intentional changes log (decision 13)

**Repository Matcher pilot:**

- **Sorting:**
  - One sort button per header (label plus stacked carets), with `aria-sort` and
    a live-region announcement.
  - Empty values always sort last.
  - Temporal coverage now sorts by first start date, newest first; it was a
    no-op before.
- **Widths:** native table layout with per-type min/max. A few visible columns
  fill the width.
- **Column controls:**
  - The pin control moved from the page checkbox into Customize Columns; it's
    persisted and ignored below `md`.
  - Column reordering enabled, plus "Reset to defaults".
- **Height and scrolling:**
  - The height cap changed from `60vh` to `maxHeight='viewport'` (`md` and up);
    below `md` the page scrolls.
  - New: a floating horizontal scrollbar, and a right-edge fade while columns
    are off-screen.
- **Cell display:**
  - Missing values show "—" (screen readers: "No data"), replacing "not
    available" and "-".
  - Temporal coverage dates are ISO.
  - Names are no longer clamped to 2 lines.
  - Cells are top-aligned (they were vertically centred).
  - The truncated-tag tooltip opens immediately on hover.
  - `www.` licence URLs get `https://`.
  - The licence column wraps long URLs anywhere.
- **Headers:** columns with a description get a dotted underline. The
  description shows on hover, keyboard focus and touch long-press, and is always
  the trigger's accessible description.
- **States:** load failures show an error alert; before, the page showed "No
  repositories match".
- **Shared components (also affect Search):**
  - Move up/down buttons are visible on keyboard focus.
  - Drag handles are named "Reorder <column>".
  - `ExpandableText` re-measures truncation on resize.
  - "Show More" toggles can carry hidden context.

**Pilot feedback round 1:**

- **Headers:**
  - An info button (toggletip) holds the column description; the dotted
    underline, long press and the description on the sort button are gone.
  - The sort target is the whole header cell.
  - Titles wrap to at most 2 lines; headers are vertically centred.
- **Tags:** still clamp to one line; implemented as single elements.
- **Shared components (invisible, verified pixel-identical):**
  - `SearchInput`'s clear button is always rendered and `hidden` while empty.
  - `CollapsibleTextTrigger` rotates its chevron from `aria-expanded`.
- **PageContainer** `<main>`: `overflow: hidden` → `overflowX: 'clip'` (sticky
  elements site-wide now stick).

**Pilot feedback round 2:**

- **Height:** natural height (the page scrolls); the header is no longer sticky
  on the Repository Matcher; its filter sidebar is no longer sticky.
- **Header:** the description is an `InfoIcon` tooltip (hover/focus, tap on
  touch) rather than a click popover; sort arrows sit at the end of the cell.
- **Resource page:** the sidebar is no longer sticky (as it was before the clip
  change).

**Header title hover (owner, 2026-11-12):**

- Like `InfoLabel`, hovering a described title also shows its description: one
  tooltip with two triggers (title and icon, zag's multi-trigger `value`s),
  anchored to both (`getAnchorElement`), so it doesn't move between them. The
  rest of the sort hit area still only sorts; clicking the title sorts and
  closes it; the icon turns blue on title hover. Shared `Tooltip` gained an
  opt-in `manualTriggers` + `TooltipTrigger` for this.
- A11y: the icon stays the keyboard, touch and screen-reader control (only it
  carries `aria-describedby`); the title isn't focusable and the sort button
  keeps its plain name, so nothing is announced twice, and a tap on the title
  only sorts.
- A clamped described title now shows its full text bold in that tooltip rather
  than a native `title` (which had doubled up with the icon's tooltip).
- Hybrid devices: a tap that closes the tooltip ends touch mode, so a mouse can
  open it again.

**Client pagination fix (2026-11-09; no effect on the pilot, which doesn't
paginate):**

- Bug: `pagination` showed only the first page, with no controls. The hook's
  page state was unreachable from `<DataTable pagination />`.
- `DataTable` now renders the shared `TablePagination` inside its root, below
  the rows, whenever `table.pagination` is set (either path). It's hidden over
  an error, the loading skeleton or an empty table. A page change resets the
  viewport's `scrollTop`.
- The bar is `next/dynamic`-loaded: it and its page combobox are ~60 kB raw / 18
  kB gzipped that the Repository Matcher doesn't load today.
- Styled by the `tableShell` recipe as-is (top border, `p: 2`), like funding,
  rather than the legacy `Table`'s `css` override.
- **Shared-component fix (also affects Saved, cited-by, based-on, funding):**
  `TablePagination` declared `ArrowButton` inside its render, so all four arrow
  buttons remounted on every page change and keyboard focus fell to `<body>`.
  Hoisted to module level; visually unchanged.

## 7. Architecture (as built)

`src/components/table/data-table/` (see its `README.md`):

- `DataTable`: presentation over native `<table>`, styled by the `dataTable`
  slot recipe in `src/theme/slot-recipes/data-table.slot-recipe.ts`. Takes
  `data`/`columns`/`getRowId`, or a `table` instance (Chakra's Root/RootProvider
  split).
- `useDataTable`: resolves columns once (stable identities); client sort, or
  server mode (`{ mode: 'server', state, onChange }`); optional client
  pagination, whose pager (`TablePagination`, lazy-loaded) `DataTable` renders.
- `useColumnPreferences`: a localStorage store via `useSyncExternalStore` whose
  server snapshot is the defaults; handles legacy migration.
- `ColumnCustomizer`: wraps `SelectAndSortPopoverView`, the controlled view
  extracted from `SelectAndSortPopover`.
- Cells: `EmptyValue`, `LinkCell`, `TagsCell`, plus per-`type` defaults (`text`,
  `longText`, `number`, `date`, `identifier`, `link`, `list`, `tags`).
- `useTableSearch`, moved from the Repository Matcher.

The legacy `src/components/table` (`Table`, `Cell`, `Th`, `Row`,
`TablePagination`, `useTableSort`) remains until Phase 5.

## 8. Phases

| Phase | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                      | Status                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| 0     | Performance criteria and baseline; native-layout spike                                                                                                                                                                                                                                                                                                                                                                                     | ✅ done                                |
| 1     | Headless foundations (utils, `useColumnPreferences`, `useDataTable`, `useTableSearch`, controlled popover view)                                                                                                                                                                                                                                                                                                                            | ✅ done                                |
| 2     | `DataTable` and the Repository Matcher pilot; layout spec; a11y error state                                                                                                                                                                                                                                                                                                                                                                | ✅ done, **awaiting owner evaluation** |
| 3     | Saved and Home onto `DataTable`. Saved drops virtualization (decision 2) and switches dates to ISO (decision 12); Home keeps its local search and filters                                                                                                                                                                                                                                                                                  | not started                            |
| 4     | Search: four tables on `DataTable` server mode. One column file per type with per-column `cell`; Samples reuses the shared row shaping. One `ColumnCustomizer` per tab; delete the 5 search popover files and the storage helpers; migrate legacy keys. Top scrollbar on (decision 7); Conditions of Access badge (decision 10). Add an axe scan of table view and fix the misleading comment at `e2e/accessibility/search.spec.ts` ~L5917 | not started                            |
| 5     | Category 2: Files and Samples onto `DataTable`; cited-by and based-on take the shared header/sort; the funding row drawer stays bespoke. Delete the legacy `Table`, `useTableSort`, `getTruncatedText`, and Saved's use of `repository-matcher/components/TableCells.tsx`                                                                                                                                                                  | not started                            |

Dependencies: 3 and 4 can run in parallel after sign-off; 5 comes last.

**Validation for every phase:**

- Jest: run focused suites with `-w 2`, or check for a running dev server before
  a full run.
- Affected a11y specs, plus layout specs for new layout behaviour.
- A visual check against the current implementation at 390/768/1280/1440.
- A perf re-run where rendering changes.
- Typecheck and lint.

## 9. Pilot feedback round 1 (owner, 2026-11-06) and its status

The owner's answers to the pilot's open decisions, plus new pilot feedback.
**Phase 3 stays on hold until the pilot evaluation is complete.** Preserve the
current implementation and avoid unrelated changes while finalizing the pilot.
Nothing is committed yet.

**Performance**

- **Expand regression: provisionally accepted** (unthrottled INP stays in the
  "good" range).
- **Virtualization stays removed** for now.
- **Typing regression: not accepted yet.** Investigate whether the
  first-keystroke web-font load (whole-document relayout) can be optimized or
  done earlier, instead of treating it as inherent to the native table. Then
  re-run the relevant comparisons under both **cold-load** and **font-ready**
  conditions.
- **Explain the 4× horizontal-scroll result:** p95 frame time rose to 33 ms yet
  "0 janky frames" were reported. Explain how jank is defined and whether the
  regression is noticeable. No extensive optimization if the remaining
  differences are genuinely minor, but establish that the tradeoff is inherent,
  not an avoidable regression.

**PageContainer `overflowX: 'clip'` (separately approved, outside the table
exemption).**

- Investigate and implement replacing `<main>`'s `overflow: hidden` with
  `overflowX: 'clip'`, provided it fixes sticky positioning without regressions.
- Keep it logically isolated from the table work.
- Verify representative pages: horizontal overflow, scrolling, focus visibility,
  existing sticky elements.
- **If it causes significant side effects, stop and report the tradeoffs**
  rather than adding workarounds.

**Decision 11 revised: header descriptions get an information icon.** The
long-press approach is rejected: a dotted underline doesn't communicate the
gesture, and a timed gesture shouldn't be the only way to reach information.

- The icon is its own control, independent of sorting, and keyboard and touch
  accessible.

**Header sort target**

- The sort button should occupy the whole header cell, with padding, so the
  entire cell is a comfortable target.
- Keep native `<th>` semantics; the button handles the interaction.
- Hover, focus and active states must reflect the larger area.
- Other header controls (the info icon) stay accessible and independent of
  sorting.

**Header wrapping**

- Titles wrap naturally, ideally up to two lines.
- All header cells are vertically centred.
- Sort indicators stay visually attached to their titles.
- No fixed column widths or tall minimum heights just for headers.
- The full title stays accessible if truncation is ever needed.
- Consider how these rules interact with adaptive column widths.

**Table height (recommendation before implementation)**

- The owner dislikes `maxHeight='viewport'` as a general default ("feels
  claustrophobic").
- Principle: **the table owns how it behaves; the parent owns how much space it
  occupies.**
  - By default the table grows with its content and the page scrolls.
  - A parent may optionally constrain height or max-height to get internal
    scrolling.
  - The table keeps handling scrolling, sticky headers and pinned columns where
    enabled.
  - No category-based defaults if the parent can express its layout needs.
- Re-evaluate whether the floating horizontal scrollbar is still needed.
- Investigate how page-level scrolling and the table's own horizontal scroll
  container interact with sticky headers; don't assume the PageContainer fix
  solves it.
- Review the existing approach and **recommend the simplest maintainable
  solution before implementing**. Avoid unnecessary configuration or layout
  complexity.

Still accepted: the architectural improvements, accessibility fixes,
localStorage migration and test coverage.

### Round 1: what was found and done (2026-11-06)

**Typing regression: avoidable, fixed.**

- Fonts were already loaded; the harness now awaits `document.fonts.ready`
  before any interaction.
- Root cause: the first keystroke rendered `SearchInput`'s clear button for the
  first time. Emotion then inserted its CSS inside Chakra's `@layer recipes`.
- In Chromium, inserting a cascade-layered rule makes the whole document
  re-match fonts ("Fonts changed") and restyle and re-lay out. Measured on the
  native page: a plain rule costs 2 ms; a layered rule 63–83 ms.
- The cost scales with DOM size, hence the larger hit with all rows mounted. A
  second keystroke costs ~0 ms of layout.
- Fix: `src/components/search-input` always renders the clear button, `hidden`
  while empty. This is a shared component outside the table scope: **needs owner
  OK.**
- **General rule for Chakra v3:** don't toggle a conditional style prop on a
  recipe component (it creates a new class at runtime). Toggle a data attribute
  or `hidden` against static CSS instead.

**Expand.**

- Same trap: the chevron's conditional `transform`. Fixed in
  `CollapsibleTextTrigger` with a static `[aria-expanded="true"] > svg`
  rotation.
- The remaining cost is the native table's relayout when a row grows: inherent,
  and provisionally accepted.

**Horizontal scroll at 4×.**

- "Jank" in the harness means a frame over 50 ms. The harness now also counts
  frames over 17 ms (one missed refresh) and over 34 ms (two or more).
- The p95 of 33 ms meant 16 of 109 frames (15%) missed one refresh.
- The cause was mostly hover hit-testing and layerization over the larger
  painted table, plus React dispatching every scroll-generated `pointermove` for
  the tag tooltip handler.
- Switching that handler to `pointerover` brought it back to 0 dropped frames
  (p95 17 ms, equal to baseline).

**PageContainer `overflowX: 'clip'` (done, isolated, one line in
`container.tsx`).**

- Verified on 20 routes at 1440 and 390 against the previous build: no page
  gained horizontal overflow; document heights are unchanged; pixel-identical
  except where sticky now works.
  - **Resource page:** the sidebar sticks. Side effect: at 1440×900 it's taller
    than the window, so its last "On This Page" links stay below the fold until
    the end of the page.
  - **Updates/news:** the "On This Page" column and section headings stick.
- The Repository Matcher's filter sidebar still doesn't stick: it's the tallest
  item in its row (3,700 px with every filter expanded).
- The `overflow: hidden` dates from #418 (Samples tab, 2026-03-27); every sticky
  element inside `<main>` has been broken since then.

**Header changes (done).**

- Info-icon toggletip replaces long-press (decision 11 revised).
- The sort button's `::after` covers the whole `<th>`; hover, pressed and focus
  are drawn on the cell; the info button is layered above it.
- Titles clamp to 2 lines; all header cells are `vertical-align: middle`.
- A clamped title gets a native `title` on hover; the full text is always in the
  DOM for screen readers.

**Regression caught and fixed.** Making each tag a single `nowrap` element (perf
work) silently widened tag columns from 212 to 392 px, because a long tag's full
width became the column minimum. Tags now use `lineClamp: 1` (they wrap at
spaces, so the minimum is the longest word). A layout spec guards this.

**Height: recommended in round 1, approved in round 2 (below).**

Verified constraint: a table that scrolls sideways needs its own scroll
container, and `position: sticky` binds to the nearest scroll container. So its
header can stick inside the table, never to the page, PageContainer fix or not.
Measured: with the scroller, a "sticky" `th` scrolled to −1199 px; without one
it stuck at 0 px, but a 2,927 px table was cut at 1,038 px with no sideways
scrolling.

Recommendation (smallest change):

- **Default:** natural height; the page scrolls vertically and the table only
  sideways. No sticky header in this mode.
- **Opt-in:** a parent-supplied `maxHeight` (any CSS length or a responsive
  value) gives internal vertical scrolling plus a sticky header.
- Remove the `'viewport'` keyword, its `md` special case and
  `--nde-table-viewport-gap`.
- Keep the floating scrollbar: with natural height it becomes the main
  horizontal control, since the native scrollbar is at the bottom of a tall
  table. Keep it `position: fixed`, so it doesn't depend on ancestor overflow
  (accordions and cards still use `overflow: hidden`).
- The top scrollbar stays opt-in; it's likely redundant for Search (re-evaluate
  in Phase 4).
- Rejected alternatives:
  - a JS-synced clone header (duplicated interactive header, width syncing);
  - a JS/scroll-driven translated header (jitter, browser support);
  - letting the page itself scroll sideways (moves the whole page).

**Consequence for the Repository Matcher:** with a natural-height table, its
3,700 px filter sidebar (now that sticky works) would stick with most filters
below the fold until the end of the table. It needs a page-level decision: make
the sidebar its own bounded scroll area, or drop its sticky.

### Round 2: owner decisions (2026-11-06) and what was done

**Table height: approved and implemented.**

- Natural height is the default.
- An optional `maxHeight` is set by the consuming component. It accepts any
  standard CSS max-height, fixed, responsive or parent-relative, with no
  table-specific viewport math. It's applied to the table root (a flex column
  whose viewport takes the rest), so `'100%'` works inside a parent with a
  definite height.
- The header is sticky only when the table has its own vertical scroll (that is,
  when `maxHeight` is set).
- The floating horizontal scrollbar is kept.
- `'viewport'` is removed.
- Repository Matcher: natural height, non-sticky header, **non-sticky filter
  sidebar** (no nested scroll areas). Reconsider if testing with longer tables
  shows significant usability problems.

**`SearchInput` fix:** approved.

**Resource-page sidebar:** the owner asked to remove its sticky positioning, so
it scrolls with the page; no constrained height or internal scrolling. Done in
`resource-sections/components/sidebar` (pixel-identical to the pre-clip build
again). Updates/news stickiness is unchanged.

**Header info icon (owner):**

- The icon sits beside the label, like `InfoLabel`, and reuses its `InfoIcon`.
- Hoverable on desktop (tooltip on hover and keyboard focus); pressable on
  mobile (a tap toggles it; a tap elsewhere closes it).
- The description is also the icon button's `aria-describedby`.
- Title and icon at the start of the header cell, sort arrows at the end.
- The header's inner wrapper uses only the column minimum (`headerStyle`), so
  the arrows reach the cell's end.

**Truncated-tag tooltips restored (owner).**

- Round 1 broke them: the hover guard checked `movementX/Y`, which `pointerover`
  always reports as 0.
- Now: `pointerover`, plus a "scrolled within the last 150 ms" guard (one
  passive capture scroll listener). A layout spec covers it.

**Perf after round 2** (full table in `e2e/perf/README.md`, "Round 2").

- Natural height costs paint and layerize: the whole table now paints into the
  page.
  - Unthrottled: INP ≤ 160 ms everywhere and no scroll jank.
  - At 4×: pin and warm-search latency miss baseline +10%, though their INP is
    better; horizontal scroll shows 2 janky frames.
  - It's inherent to the chosen layout: the bounded build (r4) didn't have these
    costs, and a parent `maxHeight` brings them back.
- Fixed: row hover now pauses during vertical scrolling (`data-scrolling`, set
  from the document scroll and the viewport's vertical scroll only).
- **Awaiting the owner:** accept these natural-height costs, or choose a bounded
  height for the Repository Matcher.

### Round 3: owner reverses natural height (2026-11-06), awaiting approval

Owner: there's no real use case for natural-height tables in the primary system.
The original complaint was that the constrained table felt claustrophobic, not
internal scrolling itself. Wanted:

- Bounded scroll container by default, keeping sticky headers and the
  bounded-height performance (native build r4 numbers in `e2e/perf/README.md`).
- Height controlled by the page or parent layout through standard CSS values.
- Responsive, layout-driven sizing rather than hard-coded viewport offsets.
- Small tables take only the space they need.
- Keep the floating scrollbar.
- Natural height only as a cheap override.
- Repository Matcher: use the available viewport space as well as possible
  without feeling cramped.
- Recommend the simplest implementation (no unnecessary configuration).

The owner committed the round-2 state as `df420ed3 wip: first iteration`, with
their own `maxHeight='750px'` on the Repository Matcher table.

**Recommendation (prototyped in the browser, not implemented):**

1. **DataTable:**
   - Default `max-height: 100dvh` on the root (a cap, not an offset).
   - `min-height: 0` on the root, so a flex parent can shrink it.
   - Sticky header always (the `data-sticky-header` flag goes; a no-op without
     vertical overflow).
   - `maxHeight` prop unchanged: any CSS value; `'none'` is the natural-height
     override, at zero extra cost.
   - Remove round 2's row-hover scroll pause (only needed for natural height;
     the bounded r4 build had 0 jank without it).
2. **Repository Matcher:**
   - Replace `maxHeight='750px'` with a page-level results region: a
     `Flex direction='column' maxH='100dvh'` around the toolbar (search, filter
     tags, results count and Customize Columns) and the table.
   - The table takes whatever height is left (flex). It fits the toolbar's
     actual height, including wrapped filter tags, with no measuring.
   - The Data Dictionary stays below it.
3. **Prototype results (DOM restructure of the export):**
   - With the region at the top of the window, the table bottom sits exactly at
     the window bottom (0 px gap) at 1440×900, 1280×720, 1024×768 and 390×844,
     with the search box and toolbar still on screen.
   - Filtered to 1 row, the table and region shrink to the content.
   - On mobile the toolbar strip stays visible above the table, a place to swipe
     the page, so there's no scroll trap without breakpoint rules.

### Round 3: approved and implemented (2026-11-06)

**Owner approval, with an explicit requirement:** natural height stays available
via `maxHeight="none"`. The bounded default must perform as if natural height
weren't supported:

- one shared implementation, with the differences in CSS/layout;
- no extra JS, DOM, listeners, observers or render work when bounded;
- no conditional logic or workarounds for natural height.
- Benchmark against r4; flag any compromise before proceeding.

**Done:**

- **Recipe root:** `maxHeight: '100dvh'` (default cap) and `minHeight: 0`
  (shrinks in a flex parent). The `maxHeight` prop is a style prop, so it
  overrides the default with any CSS value; `'none'` = natural.
- **Header:** `<th>` is always sticky; the `data-sticky-header` flag is removed.
- **Removed:** round 2's row-hover scroll pause (effect, listener, timer,
  `data-scrolling`).
- **Nothing natural-height-specific remains in JS:** both modes render the same
  DOM and run the same hooks. (The floating scrollbar's observers and the
  tag-tooltip scroll guard serve both modes.)
- **Repository Matcher:**
  - The `maxHeight='750px'` is gone.
  - The page wraps search, mobile filters, filter tags, count and the table in
    `<Flex direction='column' maxH='100dvh'>`.
  - The tag `Stack`'s `flex={1}` is removed (it would grow in a flex column).
  - The search row's `mb={2}` becomes `mb={{ base: 2, md: 0 }}` and the mobile
    filters' `mb={3}` is removed, so the non-collapsing flex margins give the
    exact gaps the block layout had. Verified identical toolbar positions at
    1440 and 390 against r4.
- **Layout spec:**
  - The table fills the window below the toolbar, with its header stuck.
  - A single result shrinks it.
  - `maxHeight='none'` grows it.
  - On mobile the toolbar stays above the table.

**Benchmark against r4 (2026-11-09; full table in `e2e/perf/README.md`, "Round
3"):**

- **Compromise found and fixed.** As first staged, 4× scrolling missed r4:
  vertical 31 dropped / 2 janky / p95 50 ms (r4 9 / 0 / 33), with 12–24 long
  tasks per scroll; horizontal p95 33 ms (r4 17).
  - Cause: the scroller had no opaque background of its own (the white was on
    the root), so Chrome repainted and re-layerized the visible table on the
    main thread at every scroll step instead of compositing it. Not caused by
    natural-height support, but it broke the requirement.
  - Fix: `bg: 'white'` on the viewport slot (CSS only; both modes). Result:
    vertical 14 / 0 / 33, horizontal 0 / 0 / 17, about 0 long tasks.
  - Load and every interaction equal r4 within noise at 1× and 4×; every 1× INP
    ≤ 120 ms.
- **Requirement verified by construction:** both modes render the same DOM and
  run the same hooks, listeners and observers; the only difference is the root's
  `max-height`. Chakra merges style props after `css`, so the `maxHeight` prop
  overrides the recipe's `100dvh` (checked with `system.css`).
- **Guards added:**
  - A Jest test renders the default and `maxHeight='none'` and asserts identical
    DOM, listeners (including `window`'s), observers and React commit counts.
    Mutation-tested: a natural-only `window` scroll listener fails it.
  - A layout spec asserts the viewport's opaque background.
  - The README's "Layout options" now states the rule: nothing in JS may exist
    only for natural height, even unconditionally (the test can't catch that).
- **Documented trap:** a responsive `maxHeight` replaces the default at every
  breakpoint, so `{ md: '600px' }` alone leaves the table uncapped below `md`.
  Give it a `base`.

## 10. Implementation notes and traps found so far

- `useSlotRecipe` + `css` per element is expensive at table scale. Style
  repeated cell content from the recipe's root with descendant selectors and
  plain elements.
- A scroller needs its **own** opaque background, or Chrome (at 1× pixel
  density) won't composite it and repaints on every scroll step. A white
  ancestor isn't enough. Diagnose with a trace: per-step Paint + Layerize with
  no JavaScript.
- In Jest's jsdom, `window.addEventListener` is an own bound property, so a spy
  on `EventTarget.prototype` never sees `window` listeners.
- Native table layout re-lays out the whole table when any cell changes size;
  DOM size is the only lever, since CSS containment doesn't help.
- In recipe nested selectors, a template like `` `&[x] ${'& table td'}` ``
  doubles the `&` and silently matches nothing.
- Locators filtered by a toggle's name ("Show more") re-resolve after it flips;
  pin rows by index.
- `pkill -f "<pattern>"` inside a Bash command kills its own shell when the
  pattern appears in the command line.
- A component declared inside another's render (`const X = () => …` used as
  `<X />`) is a new type each render: React remounts it, and focus inside it is
  lost. Found in `TablePagination`'s arrow buttons.
- The sort button's full-cell `::after` (positioned) paints over its own in-flow
  children, so they get no hover of their own: `elementFromPoint` over the title
  returns the button. Lift a child that needs one with `position: relative` +
  `z-index`. jsdom doesn't hit-test, so only a layout spec catches it
  (`hovering the title shows the same description…`).
