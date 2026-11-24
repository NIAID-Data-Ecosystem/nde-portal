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
- **2026-11-16:** Phase 4 started at the owner's request with the **Datasets**
  table (`9d09781c`); see §6 "Search: Datasets". Samples, Computational Tools
  and Data Collections are still on the legacy `ResultsTable`. Their migration,
  the move of shared cells into `data-table/`, and the path to deleting the
  legacy table are planned in `.claude/plans/search-tables-datatable.md`.
- **2026-11-19:** Phase 3 started with **Home** (owner request); see §6 "Home".
  **Saved** followed the same day (owner request; §6 "Saved"). Its decision-2
  perf comparison hasn't been run.
- **2026-11-19:** **Phase 5** done (owner request): every resource-page table is
  on `DataTable`, and the legacy `src/components/table` is deleted; see §6
  "Resource page". Uncommitted at time of writing.
- **2026-11-24:** **D4** done: `data-table/` moved up to `src/components/table/`
  (the owner moved the files; imports, doc comments and README updated). The
  `DataTable` component, the `dataTable` slot recipe
  (`data-table.slot-recipe.ts`) and the `.nde-data-table` class keep their
  names, since they name the component, not the folder.
- **2026-11-24:** while squash-merging this branch into `dev`, `dev`'s XLSX
  "Custom Result View" download (#616, built on the legacy per-tab tables) was
  ported onto `SEARCH_TABLES`: each table has `useCustomViewExport()` (same
  column preferences as the table), and each column with a custom `cell` gives
  `exportEntries` (`results-table/export.ts`; a contract test asserts none is
  missing). The export now matches the DataTable cells, not the legacy ones:
  Conditions of Access is the badge label ("Open Access", was "Open"), Date is
  ISO, and the Computational Tools / Data Collections Topic Category (tags
  linking to portal searches) exports names without the term URLs. `dev`'s
  edits to the deleted legacy table files are superseded by this port.
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
  - New: a floating horizontal scrollbar. (A right-edge fade while columns were
    off-screen was tried and removed, 2026-11-12.)
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

**Search: Datasets (Phase 4, 2026-11-16).** `dataset-results-table/index.tsx` is
on `DataTable` in server mode; the page's sort handler, URL sync, page reset and
toolbar select are unchanged (verified in a browser: a header click writes
`sort=-date&from=1` and the toolbar select follows; "Best match" marks no
column). Rows are the raw API results; each column's `accessor` shapes its
value, and the legacy cell renderers are reused as per-column `cell`s.
Preferences: `nde:table:search-datasets:v1`, migrating
`search-visible-dataset-columns` / `search-dataset-column-order`; fallback
`name`. The dataset `CustomizeColumnsPopover` wrapper, its storage helpers in
`results-list/index.tsx` and the dataset constants are deleted. Intentional
changes, beyond the shared header/sort/stripe look:

- **Sorting:** two states; Date's first click is newest first.
- **Cells:** missing values show "—" / "No data" (were blank). Dates go through
  `formatDate`. Conditions of Access is the card's badge with its tooltip
  (decision 10; was plain text). "Show More" / "Show N More" toggles carry the
  column name for screen readers. An array `alternateName` fallback is
  comma-joined.
- **Widths:** per-type min/max instead of fixed widths (Name 200–320, Author
  180–280, Description the `longText` 280–560, was 250).
- **Height and scrolling:** the page keeps the old `70vh` cap (now the
  `maxHeight` prop), header sticky, plus the floating scrollbar. No top
  scrollbar: the owner removed it before committing `9d09781c`. Loading shows
  skeleton rows under the real header instead of one skeleton block.
- **Column controls:** the shared `ColumnCustomizer`, so "Reset to defaults" is
  new here. Since step 2 of `.claude/plans/search-tables-datatable.md` (owner's
  D2), every Search table offers "Pin first column", unpinned by default.
- **Shared hook fix (`useColumnPreferences.setVisible`):** hiding the last
  visible column now leaves the fallback columns, like "Clear All". Before, the
  stored empty selection read back as the defaults and re-showed every column.
  (The legacy Search table showed only Name but left the popover all unchecked,
  then showed every column after a reload.) No effect on the Repository Matcher,
  whose Name can't be hidden.
- Known, not changed: in dev, Emotion logs ~10 `:first-child` "potentially
  unsafe when doing server-side rendering" errors on Search table view, from the
  `dataTable` recipe's pinned-column selectors. Likely only because Search
  renders its results client-side (the Repository Matcher's table is in the
  server HTML and logs none). Dev-only.

**Search: Samples (2026-11-16; step 5 of
`.claude/plans/search-tables-datatable.md`).** On the factory, with the same
intentional changes as Datasets; Identifier stays required and leads, ten
columns show by default as before, Name stays plain text and Source lists every
catalog. Otherwise its cells match the legacy table's text cell for cell
(verified against the legacy build, with default and all columns). Rows are 12
px taller, as on every migrated table (the shared cell padding).

**Search: Data Collections (2026-11-16; step 4 of
`.claude/plans/search-tables-datatable.md`).** On the factory, with the same
intentional changes as Datasets; Name and Source stay required and lead.
Otherwise its cells match the legacy table's text cell for cell (verified
against the legacy build). Shared fixes made here: unlinked entries of a link
list each get their own line again (a step-1 regression), and required columns
always lead in their declared order.

**Search: Computational Tools (2026-11-16; step 3 of
`.claude/plans/search-tables-datatable.md`).** On the Search table factory, with
the same intentional changes as Datasets above (shared header/sort, two-state
sort with Date newest first, "No data", ISO dates, the access badge, type-based
widths, Reset to defaults, the pin option, no top scrollbar, toggle context for
screen readers). Nothing table-specific changed: its cells match the legacy
table's text cell for cell otherwise (verified against the legacy build).

**Shared cells moved into `data-table/cells/` (2026-11-16; step 1 of
`.claude/plans/search-tables-datatable.md`).** Term renderer, link list,
resource link and access badge are shared; the legacy Search tables and the
resource page's sample tables use them through small adapters that keep
returning `null` (blank) for nothing to show. Intentional changes:

- Resource page sample tables (owner's D3): a boolean `false` shows "No" (it
  showed nothing); a `true` no longer throws (`'value' in true`).
- Term cells (Search and resource page): a finite number shows as text (Search
  showed nothing; the resource page threw). Blank terms no longer count toward
  "Show N More".

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

**Loading indicator over rows (2026-11-17, owner request: "a small loading
indicator" for the Search tables).**

- `DataTable`: `status.loading` while rows are showing now draws a small
  "Loading…" pill (Chakra `Spinner` + text, `role="status"`), centred just under
  the header in the root, so it stays put while the rows scroll. It fades in
  after 0.3 s, so a quick refetch doesn't flash it. Not shown over an error or
  the skeleton (which is still the indicator when there are no rows). Before,
  that state only set `aria-busy`.
- It stays until the new rows are on screen (owner, same day). New rows render
  in the deferred background pass, which finished ~500 ms after the response in
  dev (page 2 of Datasets: response at 305 ms, pill gone at 453, rows at 945).
  The pill now leaves in that same commit (pill and rows both at 803 ms). It's
  latched in state on `loading`, so rows changing without loading (the
  Repository Matcher's filters) never show it; checked in the browser too.
- Timing-dependent, unchanged: a new page or sort has no data until it arrives,
  and the deferred pass is rendering an empty set meanwhile. A fast response
  keeps the old rows (with the pill) up throughout. A slow one (1.5 s in dev)
  swaps them for the skeleton partway, at ~0.9 s.
- Search passes `isFetching` (was `isLoading`), so a refetch of cached results
  (back to a visited page or sort, returning to a tab, a prefetched tab) keeps
  the rows up with the pill. A new query key still has no data, so it still
  shows skeleton rows. The cards and the page pagination are unchanged.
- No effect on the Repository Matcher: it passes `isLoading` and has no rows
  while loading.

**Columns fill spare width (2026-11-18, owner request: "if the space allows I'd
like the cells to expand to take up the available space").**

- Before: each column's min/max was on a `<div>` inside every cell. With width
  to spare, the browser widened the `<td>`s but the `<div>` stayed at its max,
  so text wrapped early and left a blank strip. Measured in a mock at 1800px: a
  Name cell was 516px wide, but its content stopped at 320px.
- Now: the bounds (`ResolvedColumn.cellStyle`, replacing `contentStyle` and
  `headerStyle`) are inline styles on the `<th>` and `<td>`s, and the wrapper
  `<div>` is gone (one element fewer per cell). Cells are `content-box`, so the
  numbers still mean content width.
- Measured in Chromium and Firefox at 1800, 1000 and 600px: every column width
  is identical to before. Long unbreakable codes are still capped. The only
  difference is that content fills a cell that is wider than its max.
- Headers now get the max too. With content filling the cell, the arrows reach
  the cell's end, as round 2 decided.
- **Safari not verified:** WebKit doesn't launch on this WSL box (missing system
  libraries). Check on a Mac. If WebKit ignored `max-width` on cells, its
  columns would be uncapped.
- Specs: `DataTable.test.tsx` (bounds on the cells, no wrapper); the Repository
  Matcher layout spec reads the minimum from the `<th>`, and a new test checks
  the description and header fill a column wider than its max.

**Home (Phase 3, 2026-11-19).** `views/home/components/TableWithSearch` renders
`DataTable` (client sort, uncontrolled) instead of the legacy `Table` and
`RepositoryCells`. Columns are a module constant, `TableWithSearch/columns.tsx`
(`RESOURCES_TABLE_COLUMNS`), passed by the page. Its search, filter menus,
filter tags, results count and the "No results found." early return are
unchanged. Props: `ariaLabel` + `caption` (always the same text) are now one
`label`; the unused `getCells` and `searchInputProps` are gone.

- **Widths (D5):** min/max sizes, no round-5 overrides. The legacy cells were
  border-box (`minW`/`maxW` included the 32px padding), so each size is the
  legacy number minus 32: Name, Type, Research Domain and Access fixed at
  248/148/193/118, Description `min: 248` (the `longText` max stays). Measured
  against the legacy table at 390, 768, 1280 and 1440: every column width is
  identical (280/280–427/180/225/150), as are the table width and sideways
  scroll.
- **Kept:** name ascending first, Name links to the source's `/search` URL (Next
  link), Type and Research Domain alphabetical and comma-joined,
  Type/Domain/Access semibold text (no Search badge: decision 10 is Search
  only), the 500px cap with a sticky header (`maxHeight='500px'`), 10 loading
  rows, no pagination.
- **Changed, as on the other migrated tables:** the shared header (full-cell
  sort button, arrows at the end, `aria-sort` + announcement); empty values sort
  last; missing values show "—" / "No data" (was "-"); rows ~4px taller (shared
  padding); skeleton rows under the real header; the floating scrollbar.
- **Description:** still clamped at 3 lines, now with "Show More" (the shared
  `ExpandableText`, column name for screen readers). Before, text past the clamp
  couldn't be read.
- **Header buttons are named after their columns** ("Type", "Research Domain",
  "Access"), the same names as the filter menu triggers above the table. The
  legacy carets were each "sort table column ascending/descending". The triggers
  are menu buttons (`aria-haspopup`, `aria-expanded`), so they're still told
  apart; tests pick them with `expanded: false`.
- **Empty state:** the page's message lost its `py={10}`: the status cell
  already pads it by that much (the legacy table put it in a bare `<td>`).
- **Tests:** `TableWithSearch.test.tsx` covers the initial sort, cell
  formatting, "No data" and the filtered-empty state.
  `e2e/accessibility/home.spec.ts` detects loading with `expectSkeletonsLoading`
  (the legacy `data-testid="loading"` marker is gone) and picks the filter
  triggers by `expanded: false` / `aria-haspopup`. Against the dev server, its
  error-state and keyboard tests lose a race with the mock-auth Welcome redirect
  (dev only). Replayed with the redirect suppressed, both pass. Not yet run
  against a static export.

**Saved (Phase 3, 2026-11-19).** `views/saved` renders `DataTable` (client sort
and client pagination) instead of the legacy virtualized `Table`. Columns are
`SavedColumnDef`s in `table-config.tsx`: a `ColumnDef` over `SavedRow`
(`{ _id, _search, item }`, the saved item kept whole) plus an optional `search`.
`formatTableData` still dedupes rows and prebuilds `_search`. Unchanged: the
search box (names only on resources, not IDs, as before), the item count, the
two empty messages, the snapshot that keeps an un-bookmarked row until refresh,
the error banner and toast. `repository-matcher/components/TableCells.tsx` and
its test are deleted (Saved was their last user).

- **Virtualization removed without the decision-2 perf comparison**: it needs a
  static export build, which can take the owner's dev server down on this box.
  Pages are 5 rows by default, at most 100.
- **Height:** the legacy caps (queries 300px, resources 350px) were on the rows,
  with the pager below, outside them. DataTable's `maxHeight` includes its
  pager, so the page passes the cap plus the pager's height (82px from `sm`,
  171px below it, where the pager stacks). Measured: same rows room at 1440, 768
  and 390. A table with fewer rows now shrinks to them; the virtualized one kept
  its full height, blank below the rows.
- **Widths:** the legacy border-box min/max minus 32px, as on Home. The legacy
  virtualized rows split spare width evenly; native layout follows the content
  within the bounds. At 1440: resources Name 418 (was 318), Source and Updated
  On 160 (were 220/200), Type 180 and Saved On 200 (unchanged; Type is fixed at
  its old desktop width so "Computational Tool" stays on one line); queries
  Total 124 (100), Name 346 (409), Applied Filters 401 (409), Saved On 247
  (200). At 768 and 390 the queries columns are identical; the resources table
  is 980px wide (was 1005).
- **Kept:** the starting sorts: resources by Name; queries by Total ascending,
  which still has no sort button (its header gets `aria-sort` and the sorted
  grey, as the legacy header was highlighted). Names ignore leading quotes when
  sorting. The 2-line clamps on names, Type and Source; Type semibold; Total
  semibold and left-aligned. A non-sortable `end` header keeps its title at the
  start, over right-aligned numbers, so Total overrides `align`; no table had a
  `number` column before. Filter tags stay Chakra `Tag`s (subtle, secondary, one
  line, tooltip when clipped): `TagsCell` would turn them grey, and the few tags
  here don't need its perf trade-off. The pager's 5/10/50/100.
- **Changed, as on the other migrated tables:** the shared header (full-cell
  sort button, `aria-sort` and announcement); two-state sort with dates newest
  first; empty values sort last; missing values show "—" / "No data" (were "not
  available"; a missing Total showed "0"); rows ~4px taller; the floating
  scrollbar. Dates are ISO via `formatDate` (decision 12; were
  `toLocaleDateString`, so a timestamp now shows its own calendar date, not the
  viewer's local one), sort by timestamp, and the search box matches the ISO
  text. Total shows in full (was cut off at "12,085,5…").
- **Accessible names:** `tableAriaLabel` and `caption` became one `label`:
  "Saved queries" / "Saved resources" (were "Saved queries table" / "Saved
  resources table", with the caption sentences as descriptions).
- **Bookmarks:** re-saving posts the saved item itself; the legacy one added the
  `url` its row transform had built. A toggle leaves other rows' cells mounted
  (checked in the browser).
- **Empty state:** `SavedEmptyState` lost its `py={10}`, as on Home.
- **Verified:** `views/saved/components/saved-table-section.test.tsx` (sorts,
  formatting, "No data", search across columns, paging, bookmarks, dedupe). In
  the browser on the dev server with mock data, at 1440, 768 and 390: sort,
  search, paging, rows per page, bookmark toggles; axe (WCAG A/AA) clean,
  populated and with no matches, at 1440 and 390.
  `e2e/accessibility/saved.spec.ts` not run (needs a static export). Dev logs
  the known Emotion `:first-child` errors, as on Search (the table renders
  client-side).

**`showColumnBorder` and `colorPalette` props (2026-11-19, owner request: "like
the native Chakra table").** Both are on `DataTable` and off/default unless
passed; no current table passes them.

- `showColumnBorder`: a 1px line after every column but the last, in its row
  line's colour (`gray.100` body, `gray.200` header). Opt-in, so no change to
  existing tables.
- `colorPalette` (default `primary`, set on the recipe root; the prop is an
  unlayered style prop on the same element and wins): drives row/header hover
  (`.50`), the pressed header (`.100`), the table's focus rings (`focusRing`)
  and the loading spinner (`solid`). Stripes, borders, the sorted header and
  header text stay neutral; search-link tags keep `primary` (TagWithUrl parity);
  the pager keeps its own `gray`. The `table.hover` token is gone.
- **Intentional change:** the root now carries a palette, so focus rings that
  inherited one now get `primary.500/50`: the viewport's own ring and the
  description cells' "Show More" trigger. They were the text colour (`html`'s
  `colorPalette: 'none'`) or an ancestor's palette (a purple on Search).
- **Verified** in Chromium on the dev server (Repository Matcher, Home, Saved,
  Search table view): all 7,829 elements' idle colours identical before/after;
  row hover, header hover/press and sort/info focus rings identical; cell links,
  Saved's tooltip buttons and the pager unaffected. Jest test reads the root's
  palette rule (prop and default, both entry points).
- **Pre-existing bug, not fixed:** the pressed-header colour never shows with a
  mouse. Chakra emits the `@media (hover: hover)` hover rule after the `:active`
  one, at equal specificity, so hover wins while pressed.

**Resource page (Phase 5, 2026-11-19).** Files, Samples (one Sample's
properties; a collection's own item list; its fetched samples), Cited By, Based
On and Funding render `DataTable`: client sort, and client pagination except the
one-row Sample table. Owner decisions (2026-11-19): Funding's "More Information"
drawer moves into the Funder cell (no detail rows in `DataTable`); Based On's
description, a full-width line under each row, becomes a Description column.

- **Widths:** each column is the legacy border-box width minus 32px, fixed (min
  = max): the legacy tables overflowed the resource page's content (816px at
  1440), so their flex columns always sat at their minimums. Measured at 1440
  and 390: every column width is identical for Files (1,620px wide), Funding
  (960), Cited By (1,040) and the Samples tables (840, 1,120, or one column
  filling the width). Based On is new: Name ≥ 248, Type 140, Date Published the
  `date` default (≥ 100), Description ≥ 200, so its four columns fit 816px
  without sideways scrolling, as the legacy three (416/200/200) did.
- **Height:** Files, Cited By, Based On and Funding were uncapped; they now take
  the bounded default (`100dvh`), so with 50 or 100 rows per page the header
  sticks. At the default 5 rows nothing changes. Samples keep their 400px cap:
  it was on the legacy rows with the pager below, so a paginated sample table
  passes 482px (the pager's 82px from `sm`; below `sm` the stacked pager takes
  more and the rows get less room). Measured rows area: 402px at 1440.
- **Kept:** the starting sorts (Files by Name; the collection tables by Sample
  ID; Cited By, Based On and Funding in source order). The legacy clamps (file
  name 3 lines, download URL 2, Cited By title and journal 3). `TagWithUrl` for
  ID/PMID/DOI and the orange Funding/Funder ID tags. "No name provided" and "[No
  title provided]" when a row has IDs but no name. File-format icons and size.
  At most 5 funders, then "and N more...". Each table's empty message ("No
  results found.", "No data available.", "No funding data available."; Based On
  renders nothing). The collection table's loading skeletons.
  `BasedOnActionProcess` is untouched.
- **Changed, as on the other migrated tables:** the shared header (full-cell
  sort button, `aria-sort` + announcement; headers lost Funding's orange
  underline); two-state sort with dates newest first; empty values sort last;
  missing values show "—" / "No data" (were italic "No data", or blank in the
  Samples tables); a name cell shows it only when it has nothing at all (no
  name, URL or ID). Rows ~12px taller; skeleton rows while loading; the floating
  scrollbar. Dates are ISO via `formatDate` (decision 12): Files showed the raw
  strings; Cited By, Based On and Funding showed `toLocaleDateString`, which
  moved a calendar date back a day west of UTC (`2007-05-01` showed as "Apr 30,
  2007"). Files' Description keeps its 3-line clamp and gains "Show More" (as on
  Home).
- **Samples:** lists show "Show N More" past 5 (the legacy adapter showed every
  value). The collection's own item list now really sorts by Sample ID: the
  legacy sort compared its `{ identifier, url }` objects as `"[object Object]"`,
  so it kept source order under a "sorted" header (rows now start at
  SAMN55848691, were SAMN55848714). The one-row Sample table no longer marks its
  first column as sorted. Sample ID's sort-on-`_identifierSort`,
  show-`identifier` remap is now explicit in the column descriptor
  (`SampleColumn.valueProperty`) instead of a `getCells` special case. The
  legacy `SampleTable/Cells.tsx` adapter is gone.
- **Funding:** the details sit under the funders, behind the shared
  `CollapsibleTextTrigger` ("More Information" / "Less Information" with a
  chevron, was a full-width accordion row with +/−), mounted only once opened as
  before. Shown only when a funder has something the panel shows (alternate
  name, class, role, parent organization, employee); the legacy row offered it
  for any other key (e.g. a `url`), and then showed only the name. Label and
  value run on as one line in the narrow cell. Valid `dl` markup (was `dd`s and
  `div`s straight inside `dl`); several employees are comma-joined (they ran
  together).
- **Based On:** Description column (4 lines + "Show More", was 144 characters +
  "read more"). A type's "Show ontology information." tooltip only exists when
  it links somewhere (an empty one used to open). Pager grey like the rest (was
  `primary`). The unused `id`, `caption` and `columns` props are gone.
- **Files:** a known size of 0 now shows ("size: 0"; the legacy check hid it).
- **Accessible names** (one `label` each, was `aria-label` + caption): "List of
  downloadable files", "Sample properties", "Sample Collection List", "N samples
  in this collection", "Cited by information", Based On's section title, "Grant
  and funding information".
- **Shared code:** `TablePagination` moved to `data-table/components/` (its size
  is the `styleSize` prop, default `sm`, instead of the legacy `TableSize`
  context; the same output). The `tableShell` recipe lost its `wrapper` slot.
  `getFileIcon` moved to `files-table/helpers.ts`. Deleted: `Table`, `Column`,
  `Cell`, `Th`, `Row`, `RowWithDrawer`, `TableContainer`, `TableWrapper`, the
  sort toggle, `useTableSort`, `useTableSize`, `getTruncatedText` and their
  tests.
- **Verified:** Jest (new behaviour tests for every table, replacing mock-based
  ones). On the dev server with recorded staging records (a composite with 96
  files, 16 grants, 7 based-on, 13 cited-by and 30 fetched samples; a collection
  with 95 listed items; a single Sample), at 1440 and 390: widths as above,
  sorting, paging (focus stays on the pager), the funder toggle, axe (WCAG A/AA)
  clean on every table section with funder details open. Not run:
  `e2e/accessibility/resources.spec.ts` (needs a static export) and a perf
  comparison (paginated, 5 rows by default).

## 7. Architecture (as built)

`src/components/table/` (see its `README.md`):

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

The legacy `src/components/table` (`Table`, `Cell`, `Th`, `Row`, `useTableSort`,
…) was deleted in Phase 5; `TablePagination` moved into
`data-table/components/`. D4 (2026-11-24) then moved `data-table/` up to
`src/components/table/`, so the barrel is now `src/components/table/index.ts`
(the running `next dev` resolved it without a restart).

## 8. Phases

| Phase | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                      | Status                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Performance criteria and baseline; native-layout spike                                                                                                                                                                                                                                                                                                                                                                                     | ✅ done                                                                                                                                                   |
| 1     | Headless foundations (utils, `useColumnPreferences`, `useDataTable`, `useTableSearch`, controlled popover view)                                                                                                                                                                                                                                                                                                                            | ✅ done                                                                                                                                                   |
| 2     | `DataTable` and the Repository Matcher pilot; layout spec; a11y error state                                                                                                                                                                                                                                                                                                                                                                | ✅ done, **awaiting owner evaluation**                                                                                                                    |
| 3     | Saved and Home onto `DataTable`. Saved drops virtualization (decision 2) and switches dates to ISO (decision 12); Home keeps its local search and filters                                                                                                                                                                                                                                                                                  | Home and Saved done (2026-11-19, §6); Saved's perf comparison (decision 2) not run                                                                        |
| 4     | Search: four tables on `DataTable` server mode. One column file per type with per-column `cell`; Samples reuses the shared row shaping. One `ColumnCustomizer` per tab; delete the 5 search popover files and the storage helpers; migrate legacy keys. Top scrollbar on (decision 7); Conditions of Access badge (decision 10). Add an axe scan of table view and fix the misleading comment at `e2e/accessibility/search.spec.ts` ~L5917 | ✅ done (2026-11-16), except the perf comparison (skipped by the owner for now); axe + layout specs added. See `.claude/plans/search-tables-datatable.md` |
| 5     | Category 2: Files and Samples onto `DataTable`; cited-by and based-on take the shared header/sort; the funding row drawer stays bespoke. Delete the legacy `Table` (its `virtualized` path has no users since Saved), `useTableSort` and `getTruncatedText`                                                                                                                                                                                | ✅ done (2026-11-19, §6 "Resource page"); funding details in the Funder cell, Based On's description a column (owner); D4 rename done 2026-11-24          |

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
  the arrows reach the cell's end. (Superseded 2026-11-18: the bounds moved onto
  the cells, see "Columns fill spare width" in §6; arrows still reach the end.)

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
- Column bounds go on the cells, not on a wrapper inside them. A cell's
  `max-width` caps what its column asks for in auto layout, but not the width
  it's given, so content fills spare width; a wrapper's `max-width` caps the
  content too. Cells must be `content-box` (Chakra's preflight is `border-box`,
  which would take the 32px padding out of each bound). A wrapper with
  `min-width: max(<min>px, 100%)` looks like an alternative, but Firefox drops
  the px minimum during intrinsic sizing and columns shrink below their mins
  (2026-11-18).
- A component declared inside another's render (`const X = () => …` used as
  `<X />`) is a new type each render: React remounts it, and focus inside it is
  lost. Found in `TablePagination`'s arrow buttons.
- The sort button's full-cell `::after` (positioned) paints over its own in-flow
  children, so they get no hover of their own: `elementFromPoint` over the title
  returns the button. Lift a child that needs one with `position: relative` +
  `z-index`. jsdom doesn't hit-test, so only a layout spec catches it
  (`hovering the title shows the same description…`).
- The pinned column's shadow is an `::after` strip past each first cell (a
  per-cell `box-shadow` notched at every row). Anything positioned inside the
  viewport counts toward its scroll size: a strip reaching 1px below the last
  row (no bottom border) added vertical scroll, and one on the full-width status
  cell would widen the horizontal scroll. So body strips reach _up_ over the row
  border, and the status cell has none (2026-11-12).
- The shadow shows whenever the pinned table overflows, not only once scrolled
  off the start. Any attribute on the root that a cell selector depends on
  restyles every cell when it flips (invalidation goes by tag, `td`): a
  `data-at-start` flag cost ~16 ms style per scroll leaving or reaching the
  start at 4x CPU (840 cells), plus ~11 ms layout while the strip was created by
  toggling `content`. Removed 2026-11-12; keep scroll-position state out of the
  root's attributes.
