# Plan: Search tables on DataTable, shared cells, and retiring the legacy table

Companion to `.claude/plans/table-consolidation.md` (read that first: its
decisions 1–14, §2 expectations and §3 "must preserve" list all apply here).
This file covers Phase 4's remaining work and lays out the path to deleting the
legacy `src/components/table` implementation.

- **Status (2026-11-16):** decisions D1–D5 taken (§4). Steps 1–5 committed
  (`2542fa7e`, `c4b1ea47`, `862c1dd1`, `e1379d18`); step 6 implemented
  (uncommitted) except the perf comparison, which the owner skipped for now.
  Every Search table is on the factory and the legacy Search layer is gone.
  Next: main plan Phases 3 and 5 ("Later" below).
- **Goal:** every table in the app on `DataTable`; one place for cells; the
  legacy `Table`, its parts, and the Search `ResultsTable` layer deleted.
- **Update this file** as steps land, and log intentional changes in the main
  plan's §6.

---

## 1. Where things stand

**Search tables** (`src/views/search/components/results-list/components/`):

| Table               | Lines | Columns (default visible) | Required / fallback | Server-sortable                                                                                    |
| ------------------- | ----- | ------------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| Datasets (migrated) | 347   | 17 (17)                   | — / `name`          | name, source, date, conditionsOfAccess                                                             |
| Computational Tools | 363   | 17 (17)                   | — / `name`          | name, source, date, conditionsOfAccess                                                             |
| Data Collections    | 354   | 12 (12)                   | `name`, `source`    | name, source, conditionsOfAccess, date                                                             |
| Samples             | 533   | 28 (10)                   | `identifier`        | name, date, includedInDataCatalog, conditionsOfAccess, creativeWorkStatus, sampleAvailability, sex |

Plus, per legacy table: a `CustomizeColumnsPopover` wrapper (56–68 lines), and
in `results-list/index.tsx` ~120 lines of hand-rolled localStorage readers and
six `useState`s feeding them.

**Duplication found:**

- Name (resource link + referrer), Source, Date, Conditions of Access,
  Description, Author, Funder, Funding ID and License are defined separately in
  up to four tables, with the same accessor and cell each time.
- Samples' `toRow` hand-rolls catalog, funder (with de-duplication) and funding
  ID shaping that `results-table/utils.ts` already has (`toCatalogEntry`,
  `toFunderEntries`, `toFundingIdEntries`). It also repeats the "stacked link
  list" markup three times inline.
- `results-table/components/Cells.tsx` (`renderValue`, `DefinedTermCell`,
  `QuantitativeValueCell`, `formatTerm`, `formatNumericValue`, `formatUnitText`)
  is duplicated almost line for line in
  `resource-sections/components/samples/components/SampleTable/Cells.tsx` and
  `samples/helpers.ts`. They differ in two ways: Search renders booleans as
  Yes/No, and its lists truncate past 5 where the resource page shows every
  item.
- Each table passes an `apiSortField` per column _and_ an `isSortable` flag that
  must agree. Datasets now has a third copy, `API_SORT_FIELDS`.

**Legacy table consumers outside Search:**

| Consumer                          | Uses from legacy `src/components/table`                                  | Plan phase |
| --------------------------------- | ------------------------------------------------------------------------ | ---------- |
| Saved (`views/saved`)             | `Table` (virtualized), repository-matcher `TableCells`                   | 3          |
| Home `TableWithSearch`            | `Table`                                                                  | 3          |
| Resource page: files              | `Table`, `EmptyCell`, `getFileIcon`                                      | 5          |
| Resource page: samples            | `Table`, `Column`, own copies of the term cells                          | 5          |
| Resource page: cited-by, based-on | `Cell`, `Th`, `Row`, `TableContainer`, `TablePagination`, `useTableSort` | 5          |
| Resource page: funding            | the above plus `RowWithDrawer`                                           | 5          |
| **`DataTable` itself**            | `TablePagination` (lazy-loaded pager)                                    | —          |

`src/components/expandable-cells` is only used by tables (Search, the Repository
Matcher and `data-table/cells`).

## 2. Target structure

**Rule for what goes where:** `data-table/` holds presentation: cells take plain
props (labels, URLs, terms) and know nothing about API response shapes. Views
hold the accessors and row shaping that turn API records into those props, as
`DataTable`'s README already says.

```
src/components/table/data-table/
  cells/
    EmptyValue.tsx         (exists)
    LinkCell.tsx           (exists) absorbs Search's LinkOrTextCell
    LinkListCell.tsx       from Search SharedCells; also replaces Samples' 3 inline lists
    TagsCell.tsx           (exists)
    Expandable.tsx         ExpandableText + ExpandableList, moved from src/components/expandable-cells
    TermsCell.tsx          renderTerm + TermsCell: string | boolean | DefinedTerm | QuantitativeValue
                           (from Search Cells.tsx and resource-page SampleTable/Cells.tsx)
    AccessBadgeCell.tsx    the result cards' Conditions of Access badge
    ResourceLinkCell.tsx   resource-page link with the current page as referrer
    defaults.tsx           DEFAULT_RENDERERS (split out of cells/index.tsx)
    styles.ts              the shared inline styles (visually hidden, muted)
    index.ts
  utils/terms.ts           formatTerm, formatNumericValue, formatUnitText (one copy)
  components/TablePagination.tsx   moved from src/components/table/components;
                                   not exported from data-table/index.ts, so
                                   DataTable's lazy load of it still splits it out

src/views/search/components/results-list/components/results-table/
  create-search-table.tsx  factory: { Table, ColumnCustomizer } from a config
  columns.tsx              column presets over FormattedResource (name, source, date, …)
  shaping.ts               row shaping (from utils.ts, + toCatalogEntries, sample count, software help)
  sort.ts                  toSortState, apiSortFields(columns)
  tables/
    datasets.tsx
    computational-tools.tsx
    data-collections.tsx
    samples.tsx
    index.ts               SEARCH_TABLES registry, keyed by tab id
  __tests__/
    search-tables.test.tsx contract, run against every SEARCH_TABLES entry
    datasets.test.tsx …    each table's own cells
```

The four `*-results-table/` folders, `results-table/components/`, `types.ts`,
`constants.ts` and the legacy `ResultsTable` go away.

**Shared-cell contract:** every shared _cell_ (`EmptyValue`, `LinkCell`,
`LinkListCell`, `TagsCell`, `TermsCell`, `AccessBadgeCell`, `ResourceLinkCell`)
renders `<EmptyValue />` when given nothing to show, as `LinkCell` and
`TagsCell` already do. A column's `cell` can then return the component directly.
That removes the trap found on Datasets, where a cell component rendering `null`
left the cell blank instead of showing "No data". The README documents the rule,
and each cell has a unit test for empty input.

_Building blocks_ (`ExpandableText`, `ExpandableList`, `renderTerm`) render
nothing for empty input instead, because the legacy tables (blank for missing
values) use them too. Until those tables migrate, their own small adapters
(Search's legacy `Cells.tsx`/`SharedCells.tsx`, the resource page's
`SampleTable/Cells.tsx`) wrap the building blocks and keep returning `null`.

**Search table factory** (sketch; names may change in review):

```ts
type SearchColumnDef = ColumnDef<FormattedResource> & {
  /** API sort field. Its presence is what makes the column sortable. */
  apiSortField?: string;
};

const datasets = createSearchTable({
  tableId: 'search-datasets', // nde:table:<id>:v1
  label: 'Dataset search results',
  columns: DATASET_COLUMNS, // SearchColumnDef[]
  legacyKeys: { visible: '…', order: '…' },
  fallbackIds: ['name'],
});
// datasets.Table: { results, loading, currentSort, onSortChange }
// datasets.ColumnCustomizer: no props
```

- `sort` is derived from `apiSortField` once, at module load, so UI sortability
  can't drift from what the API can sort. The `API_SORT_FIELDS` map and the
  `isSortable`/`apiSortField` pairs go away.
- The factory owns what every Search table repeats: preferences
  (`useColumnPreferences` with legacy keys), the server-sort mapping,
  `maxHeight='70vh'`, skeleton rows, the full-width wrapper, `allowReorder` and
  `allowPinning` (D2: the "Pin first column" switch is offered, unpinned by
  default). No top scrollbar: the owner removed it from Datasets before
  committing `9d09781c` (decision 7's re-evaluation).
- Presets take overrides, e.g.
  `presets.source({ id: 'includedInDataCatalog', multiple: true })` for Samples,
  whose column id must stay as-is for the preference migration and which lists
  every catalog.

**`results-list/index.tsx` afterwards:** the view-mode/flag logic that decides
_whether_ a tab shows a table stays as it is. Which table is then a lookup:

```tsx
const searchTable = showsTable ? SEARCH_TABLES[id] : undefined;
// toolbar
extraActions={searchTable && <searchTable.ColumnCustomizer />}
// body
{searchTable ? <searchTable.Table results={…} loading={…} currentSort={sort} onSortChange={handleSortChange} /> : cards}
```

## 3. Steps

Each step is one reviewable commit (Conventional Commits). Steps 1–2 change no
behaviour, so their diffs are pure moves and extraction. Steps 3–5 are the
migrations, each logged in the main plan's §6.

### Step 0: commit the Datasets migration as it is (done)

Committed as `9d09781c`, so step 2's diff shows the extraction on its own
instead of mixing it with the migration.

### Step 1: shared cells into `data-table/` (one intentional change: D3)

1. Move `ExpandableText`/`ExpandableList` (and their shared ResizeObserver) into
   `data-table/cells/Expandable.tsx`. Update the importers listed in §1.
2. Create `utils/terms.ts` (the formatters, one copy; `samples/helpers.ts`
   re-exports them) and `TermsCell.tsx` (`renderTerm` from the Search copy, and
   `TermsCell` over it).
   - The legacy cell font is already `sm` (`size='sm'` default), so `renderTerm`
     inherits the font size instead of setting it, and renders the same in the
     legacy Search tables, on the resource page and in `DataTable`.
   - The Search legacy `Cells.tsx` and the resource page's
     `SampleTable/Cells.tsx` become adapters over `renderTerm` with their
     current wrappers (Search: "Show N More" past 5; resource page: every item)
     and `null` for nothing.
   - **D3, intentional:** the resource page now shows a boolean `false` as "No"
     (it showed nothing; a `true` would have thrown, since `'value' in true` is
     a TypeError). Log it in main plan §6.
   - The resource page's `Cells.test.tsx` asserted on mocked formatter calls.
     Its cases move to behaviour tests of `renderTerm`; the adapter keeps a few
     of its own (no truncation, `null` for nothing).
3. Add `LinkListCell`, `ResourceLinkCell` (resource-page link, referrer from the
   router) and `AccessBadgeCell` to `data-table/cells/`, all following the
   empty-value contract. `LinkCell` covers `LinkOrTextCell` (`external`).
   Search's legacy `SharedCells.tsx` shrinks to adapters over them for the
   legacy tables, and Datasets switches to them.
4. ~~Move `TablePagination`~~ **Deferred to the end state:** it reads the legacy
   `TableSize` context (`hooks/useTableSize`), so moving it now would make
   `data-table/` depend on legacy code for no gain.
5. Split `cells/index.tsx` into one file per cell plus `defaults.tsx` and
   `styles.ts`; export the cells from `data-table/index.ts`; update the README's
   cell list and contract.

Validation:

- The existing Jest suites pass (the resource-page cell tests rewritten as
  above).
- New unit tests for each new cell, empty input included.
- Typecheck and lint.
- A browser check: Search Datasets table, one legacy Search table, and the
  resource page's Samples table look as before.

**Done (2026-11-16, uncommitted):**

- `data-table/cells/`: `AccessBadgeCell`, `EmptyValue`, `Expandable`
  (`ExpandableText`/`ExpandableList`, `git mv`'d from
  `src/components/expandable-cells`, now gone), `LinkCell`, `LinkListCell`,
  `ResourceLinkCell`, `TagsCell`, `TermsCell` (+ `renderTerm`), `defaults`,
  `styles`, and a side-effect-free `index.ts`. `utils/terms.ts` holds the one
  copy of the formatters.
- Adapters: Search's legacy `Cells.tsx` (39 lines, was 125) and
  `SharedCells.tsx` (46, was 85); the resource page's `SampleTable/Cells.tsx`
  (38, was 108); `samples/helpers.ts` re-exports the formatters. Datasets uses
  the shared cells directly, with no emptiness guards of its own.
- Tests: `data-table/__tests__/cells.test.tsx` (every `renderTerm` branch, each
  cell's empty case, referrer, badge); the resource page's `Cells.test.tsx`
  rewritten as adapter behaviour tests. 50 related suites / 535 tests pass;
  typecheck and lint clean.
- Intentional changes (logged in main plan §6): D3 (resource page: boolean
  `false` → "No"; `true` no longer throws); a finite number renders as text in
  term cells (Search showed nothing; the resource page threw); blank terms no
  longer count toward "Show N More".
- Dev-server trap: renaming a barrel (`index.tsx` ↔ `index.ts`) under a running
  `next dev` on this box leaves its resolver pointing at the old file ("Failed
  to read source code from …/index.tsx"); touching importers doesn't clear it.
  Restart the server.
- **Regression found in step 2's browser check, fixed there:** the resource
  page's sample tables set `fg` (near-black) on the table, which the old `Text`
  overrode with `text.body`; plain `renderTerm` spans inherited `fg`. The
  adapter's wrappers now set `text.body` (computed colour verified again). The
  legacy Search tables were unaffected: their cells already inherit `text.body`.

### Step 2: the Search table factory, with Datasets ported onto it

1. Create `create-search-table.tsx`, `columns.tsx` (presets), `sort.ts` and
   `shaping.ts` (moved from `utils.ts`; add `toCatalogEntries`, the sample-count
   and software-help shaping).
2. Rewrite Datasets as `tables/datasets.tsx`: config plus columns, about 100
   lines instead of 347.
3. Add `SEARCH_TABLES` and switch `index.tsx` to the lookup for Datasets.
4. Turn `dataset-results-table/index.test.tsx` into:

   - **a contract test** run with `describe.each` over `SEARCH_TABLES`:
     - default headers equal the columns' default visibility and order;
     - every column with an `apiSortField` reports it on click, in its
       first-click direction, and shows `currentSort` as `aria-sort`;
     - `_score` marks no column;
     - only API-sortable columns have a sort button;
     - an all-missing record shows "No data" in every column without a value;
     - legacy keys migrate, including empty or invalid stored arrays (→
       defaults);
     - required columns can't be hidden.
   - **per-table tests** for the cells only that table has.

   This is the main guard against the next three tables drifting.

Validation: the Datasets tests pass with only their import paths changed (the
proof that step 2 is behaviour-neutral). Repeat the browser checks from the
Datasets migration (sort → URL `sort`/`from=1`, toolbar select in sync,
customizer, legacy migration).

**Done (2026-11-16, uncommitted):**

- `results-table/`: `create-search-table.tsx` (factory), `columns.tsx`
  (`SearchColumnDef`, `searchColumn`, `resourceColumns`: name, source, date,
  author, conditionsOfAccess, description, terms, funder, fundingId, license;
  plus `linkListCell`), `shaping.ts` (moved from `utils.ts`, + `toSampleEntry`,
  `toUsageInfoEntries`), `sort.ts` (`toSortState`, `apiSortFields`),
  `tables/datasets.tsx` (67 lines, was 331) and the registry in
  `tables/index.ts`. `utils.ts` keeps only the legacy helpers and re-exports the
  shaping for the legacy tables.
- The registry lives in `tables/index.ts`, not `results-table/index.ts`: that
  name is the legacy `ResultsTable` until step 6, and renaming it under a
  running dev server is the trap from step 1.
- `results-list/index.tsx`: `searchTable` lookup for the customizer and the
  table; `dataset-results-table/` deleted.
- D2: "Pin first column" in the customizer, unpinned by default; verified in the
  browser (first column sticky at `left: 0` while scrolled, persisted).
- Tests: `__tests__/search-tables.test.tsx` (13 contract cases per table;
  "required columns" is skipped for tables without any, like Datasets) and
  `__tests__/datasets.test.tsx` (its cells, including funder / funding ID /
  usage-info links). 75 related suites / 684 tests pass; typecheck and lint
  clean.
- For Samples (step 5), add `identifier` to the contract test's `FILLED_FROM_ID`
  (a record with only an `_id` still gets one).

### Steps 3–5: one table per step

Order is by closeness to Datasets, so each step adds a little new surface.

**Step 3: Computational Tools** (`tables/computational-tools.tsx`)

- Presets: name, source, date, author, conditionsOfAccess, description, funder,
  license, topicCategory.
- Term lists: applicationCategory, programmingLanguage, operatingSystem,
  softwareVersion (string arrays, first letter capitalized as now), and input,
  output, featureList (with `normalizeTermNames`).
- `softwareHelp`: the card's rules (drop entries without a url, join an array
  name, fall back to the url), shaped in `shaping.ts`, rendered by
  `LinkListCell`.
- Legacy keys `search-visible-computational-tool-columns` /
  `search-computational-tool-column-order`; fallback `name`.

_Done (2026-11-16, uncommitted):_

- `tables/computational-tools.tsx` (63 lines; the legacy folder was 431) and
  `toSoftwareHelpEntries` in `shaping.ts`; registered as `ct`. The registry is
  now typed `Partial<Record<TabType['id'], SearchTable>>`, and
  `results-list/index.tsx` looks the tab up (`showsTable ? SEARCH_TABLES[id]`),
  so the next tables only need registering.
- Deleted: `computational-tool-results-table/`, the CT storage helpers, state
  and branches in `results-list/index.tsx` (with its last use of
  `resolveStored*`), and the CT constants.
- Tests: the contract suite runs for `ct` automatically;
  `__tests__/computational-tools.test.tsx` covers its own cells (capitalized
  string lists, joined term names, software help rules, license). 81 related
  suites / 786 tests pass; typecheck and lint clean.
- Browser, against the legacy table (same query, `git stash` to get the legacy
  build): all 17 headers equal; of 170 cells, 96 identical, 62 blank → "No
  data", 4 access "Open" → the "Open Access" badge, 1 "Show 1 More" gaining its
  hidden column context, 7 descriptions differing only in their toggle ("Show
  More Description", or no toggle where the wider column now fits all four
  lines). Table 3,130 → 3,371 px wide (columns at their type minimum;
  Description 250 → 312); row heights similar. 390 checked.
- Testing trap: the page rewrites `?tab=ct` to its default tab after load and
  keeps the Tools panel mounted but hidden, so a scripted check must click the
  Tools tab, or it reads a `display: none` table (0 px widths, `innerText`
  falling back to text content).

**Step 4: Data Collections** (`tables/data-collections.tsx`)

- Presets: name, source, conditionsOfAccess, date, description, healthCondition,
  infectiousAgent, species, topicCategory.
- `name` and `source` are `hideable: false`, so they always lead (as the legacy
  popover already forced).
- Custom cells, each via the shared components:
  - `contentType`: `getContentTypeTerms`, labels sorted, linked.
  - `isBasedOn`: names of `Action` entries.
  - `collectionSize`: "N+ unit", one per entry.
- Keep the page logic that forces the table when either view-mode flag hides the
  radio.

_Done (2026-11-16, uncommitted):_

- `tables/data-collections.tsx` (89 lines; the legacy folder was 413), with
  `toBasedOnActionNames` and `toCollectionSizes` in `shaping.ts`; registered as
  `dc`. Content type stays in the table file: `shaping.ts` importing
  `utils/content-type.ts` would have made a cycle (that file took `toArray` from
  `results-table/utils.ts`, which re-exports `shaping.ts`). `content-type.ts`
  now imports `toArray` from `shaping.ts`, its real home (it would have broken
  in step 6 otherwise).
- `LinkListCell` gained `gap`; Content Type, Based On and Collection Size keep
  the legacy table's wider spacing (`gap={2}`).
- Deleted: `data-collection-results-table/`, the DC storage helpers, state and
  branches in `results-list/index.tsx`, and the DC constant.
- **Two shared fixes, found by the new tests:**
  - `LinkCell`'s text fallback was a bare text node. In a list (a flex column)
    consecutive unlinked entries merged into one line ("Electron MicrographGene
    Variant"). Since step 1 this affected Datasets' Funder / Funding ID / Usage
    Info lists with several unlinked entries. It's now a `<span>`.
  - `useColumnPreferences` kept required columns in their _stored_ relative
    order, so a stored `[source, name, …]` put Source first; the legacy popover
    always pinned them in their declared order. Required columns can't be moved,
    so they now always lead in declared order. No effect on the Repository
    Matcher (one required column).
  - Both have regression tests (`cells.test.tsx`,
    `useColumnPreferences.test.ts`).
- Tests: the contract suite runs for `dc`, including the required-columns case
  (Name, Source); `__tests__/data-collections.test.tsx` covers content type
  (merged, sorted, linked), Based On (Actions only) and Collection Size. 83
  related suites / 808 tests pass; typecheck and lint clean.
- Browser, against the legacy table (50 rows): headers equal; of 600 cells, 401
  identical, 99 blank → "No data", 50 access badges, 50 descriptions differing
  only in their toggle (context added, or none needed in the wider column; rows
  130 → 105 px). Content Type, Based On and Collection Size match the legacy
  text exactly. Table 2,220 → 2,390 px. 390 checked.

**Step 5: Samples** (`tables/samples.tsx`)

- `identifier` is `hideable: false`. Its value is the record's `identifier`, or
  `_id` without the leading `_`, upper-cased, when that's missing or an array.
  It links externally to `url`.
- Samples is the only table with hidden-by-default columns: 18 of the 28 get
  `defaultVisible: false`, the 10 legacy defaults stay visible.
- Source keeps the column id `includedInDataCatalog` and lists _every_ catalog
  (`toCatalogEntries`); the other tables show the first.
- Name stays plain text (capitalized, as now; no resource link today).
- Funder and Funding ID use the presets, deleting the hand-rolled shaping.
  Funding ID keeps its wider size.
- Drop the hand-rolled storage readers in `index.tsx`.

_Done (2026-11-16, unstaged; step 4 is staged):_

- `tables/samples.tsx` (115 lines; the legacy folder was 589), with
  `toCatalogEntries` (now also behind `toCatalogEntry`, which takes the first)
  and `toSampleIdentifier` in `shaping.ts`; registered as `s`. Default
  visibility comes from the legacy list (`DEFAULT_VISIBLE_IDS`), so 18 of 28
  columns start hidden.
- `results-list/index.tsx` has no per-tab table code left: one `showsTable` flag
  and a `SEARCH_TABLES[id]` lookup drive the customizer and the table. Deleted:
  `sample-results-table/`, `readFromStorage` and the Samples storage helpers,
  the last column `useState`s, and `results-table/constants.ts`.
- Contract test: Samples' `identifier` is in `FILLED_FROM_ID`, and the
  customizer case now hides a _default-visible_ column (Samples' first hideable
  column starts hidden). `__tests__/samples.test.tsx` covers the identifier
  (link, `_id` fallback), plain capitalized name, every catalog, and terms. 84
  related suites / 826 tests pass; typecheck and lint clean.
- Browser, against the legacy table (50 rows; default columns and all 28 via the
  legacy keys): headers equal both ways; text differs only by blank → "No data",
  the access badge, and "Show 3 More Funding ID" context. Found and fixed in
  that check: Funding ID's minimum was narrower than the legacy column, so long
  IDs wrapped and rows grew 172 → 289 px. At the legacy content width
  (`min: 248`, 280 px with padding) rows are 172 → 184 px, the same +12 px as
  every migrated table (the shared cell padding). 390 checked.

Per step:

- **Jest:** the contract test picks the table up automatically, plus its own
  cell tests.
- **Browser:** visual check against the legacy build at 390/768/1280/1440 with
  realistic data (mixed long names, many terms, empty columns), then the sort /
  customizer / migration checks.
- **Docs:** typecheck and lint; log the intentional changes in main plan §6.

### Step 6: delete the Search legacy layer, add e2e coverage, measure

1. Delete `results-table/index.tsx` (`ResultsTable`), `types.ts` (`BaseColumn`),
   `constants.ts`, `components/` (`Cells`, `SharedCells`, the generic
   `CustomizeColumnsPopover` and its test), the `*-results-table/` folders,
   `withWidth`, `deriveControlledSortProps` and `getApiSortFieldForProperty`.
2. Remove `resolveStoredVisibleIds`/`resolveStoredOrderedIds` from
   `select-and-order-popover`. They become unused, but `useSelectableList` and
   `SelectAndSortPopover` stay, because the search filters' customize popover
   uses them.
3. **e2e, following `e2e/README.md` (and the `a11y-test` skill):**
   - Add table-view states to `e2e/accessibility/search.spec.ts`: populated
     table per tab, plus the Customize Columns popover open.
   - Fix its comment at ~L5917, which says the Search popover is covered by the
     Repository Matcher spec.
   - Add `e2e/layout/search-tables.spec.ts`, mocked with `page.route`:
     - a header click updates the URL `sort` and resets to page 1;
     - the toolbar select stays in sync;
     - the table respects the 70vh cap, with a sticky header and the top
       scrollbar;
     - preferences survive a reload.
4. **Perf:** Search's tables have never been measured. Before deleting the
   legacy layer, compare against the pre-Datasets build (`4d5db0bf`) on the
   heaviest cases:

   - Samples, 100 rows, all 28 columns;
   - Datasets, 100 rows × 17;
   - initial render, sort (new page of data), column toggle, expand.

   Use the main plan's §4 criteria and its method (interleaved builds,
   `fonts.ready`), adapting `e2e/perf/` with recorded search responses. Flag any
   miss before deleting.

Result: about 1,000 lines of legacy Search table code deleted.
`results-list/index.tsx` loses its storage helpers and six `useState`s. Each
table becomes a short config file.

_Done (2026-11-16, uncommitted):_

- Deleted the legacy layer: `results-table/index.tsx` (`ResultsTable`),
  `types.ts` (`BaseColumn`), `utils.ts` (`withWidth`,
  `deriveControlledSortProps`, `getApiSortFieldForProperty`, the shaping
  re-export) and `components/` (`Cells`, `SharedCells`, the generic
  `CustomizeColumnsPopover` and its test). (`constants.ts` and the
  `*-results-table/` folders went in steps 3–5.) `results-table/` now holds only
  the factory, presets, shaping, sort and `tables/`.
- `resolveStoredVisibleIds`/`resolveStoredOrderedIds` were not unused, as this
  plan assumed: `useSelectableList` hydrates with them. They're now internal to
  the hook, no longer exported from the `select-and-order-popover` barrel.
- e2e (fixtures in `e2e/fixtures/search-tables.ts`, navigation in
  `e2e/utils/search-tables.ts`, shared by both specs):
  - `e2e/accessibility/search.spec.ts`: each tab's table populated (4 states),
    and the Customize Columns popover open (axe) plus its keyboard open /
    Escape-returns-focus check. The L5917 comment now points at them.
  - `e2e/layout/search-tables.spec.ts` (7 tests): a header click sends the API's
    sort and returns to page 1; the toolbar Sort select and the headers stay in
    sync both ways ("Best match" clears `aria-sort`); the 70vh cap with the
    header stuck while rows scroll; pinning; every tab's table fits the page
    width; at 390 the page never scrolls sideways but the table does; column
    choices survive a reload. No top scrollbar check: Search has none.
  - All 13 pass against the static export (`yarn build:a11y`), and so does the
    rest of `search.spec.ts`, plus `resources.spec.ts`, `saved.spec.ts` and
    `repository-matcher.spec.ts` (a11y): 63 of 66 in that run.
- **Pre-existing, not from this work:** 3 tests in
  `e2e/layout/repository-matcher.spec.ts` fail: "the table fills the window
  below the toolbar" (100 px gap), "a pinned first column stays put" (asserts a
  `box-shadow`, which `4d5db0bf` moved to an `::after` strip), and the
  small-screen "toolbar stays above the bounded table" (168 px gap). They fail
  identically on a `4d5db0bf` build (checked in a temporary worktree), so the
  spec is out of date with the owner's later Repository Matcher layout and
  pinned-shadow commits. Not changed; flagged.
- **Perf: skipped by the owner (2026-11-16).** Still open: compare the heaviest
  cases (Samples 100 × 28, Datasets 100 × 17) against `4d5db0bf` before relying
  on the tables at 100 rows per page.

### Later: the rest of the app (main plan Phases 3 and 5)

Steps 1–6 leave every Search table and every shared cell on the new system. What
remains, and what each needs:

| Consumer               | Approach                                                                                                                                                   | Needs first                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Resource page: files   | `DataTable` with client pagination; `getFileIcon` moves into `files-table/`                                                                                | —                                                                                   |
| Resource page: samples | `DataTable`; its column list is built from the data (`getAvailableSamplePropertyColumns`) → generate `ColumnDef`s                                          | `TermList` from step 1 (already shared)                                             |
| Saved                  | `DataTable` + `useTableSearch` + client pagination; `TagsCell`/`LinkCell` replace repository-matcher `TableCells`                                          | Decision 2: perf comparison before dropping virtualization; ISO dates (decision 12) |
| Home `TableWithSearch` | `DataTable`, keeps its own search/filter popover                                                                                                           | Min/max sizes for its legacy `minW`/`maxW` pairs (D5: no round-5 overrides)         |
| cited-by, based-on     | `DataTable` (shared header/sort); `getTruncatedText` → `ExpandableText`                                                                                    | —                                                                                   |
| funding                | Row drawer stays bespoke (main plan Phase 5): move the legacy `Row`/`RowWithDrawer`/`Cell` pieces it uses into `funding/`, or rebuild the drawer row there | Owner call on which                                                                 |

**End state:**

- Move `TablePagination` into `data-table/components/`, replacing its
  `TableSize` context read with its `styleSize` prop, and keep it out of
  `data-table/index.ts` so `DataTable`'s lazy load still splits it out.
- Delete the legacy `src/components/table/index.tsx` (`Table`, `Column`,
  `TableProps`), `components/{cell,row,sort-toggle,table-container,wrapper}`,
  `helpers.tsx`, `hooks/useTableSort` and their tests.
- Optionally move `data-table/` up to `src/components/table/`, so the import
  becomes `src/components/table` (decision D4).
- Add a lint rule (`no-restricted-imports`) once each legacy path is gone, so it
  can't come back.

## 4. Decisions (owner, 2026-11-16)

- **D1:** consolidate the four per-table folders into `results-table/tables/*`.
- **D2:** offer "Pin first column" in every Search table's customizer, off by
  default (step 2, in the factory).
- **D3:** the shared term renderer may show a boolean `false` as "No" on the
  resource page's Samples table.
- **D4:** once the legacy table is gone, move `data-table/` up to
  `src/components/table/`.
- **D5:** round-5 column overrides not needed for now; they stay in `stash@{0}`.
  Home gets min/max sizes when it migrates; revisit only if that proves
  insufficient.

The options as originally proposed:

- **D1. Folder layout.** Consolidate the four `*-results-table/` folders into
  `results-table/tables/*` with the factory (recommended), or keep one folder
  per table.
- **D2. Pinning on Search tables.** Keep it off, as today (recommended), or
  enable "Pin first column" in the customizer, which would pin Samples'
  Identifier and the others' Name. A one-line change in the factory either way.
- **D3. One term renderer for the resource page too.** Sharing `TermValue` means
  the resource page's Samples table would show a boolean `false` as "No" where
  it shows nothing today. Recommended: accept it (a real value per decision 4).
  Alternative: keep a resource-page-only boolean branch.
- **D4. Final rename** of `data-table/` to `src/components/table/` once the
  legacy table is gone. Recommended, as a pure move commit.
- **D5. Round-5 column overrides** (`stash@{0}`): restore them before Home, or
  give Home min/max sizes instead.

## 5. Risks and how they're covered

- **Preference migration** (four tables, two legacy key formats): the contract
  test covers each table, including empty, invalid and partial stored arrays.
  Samples' column id `includedInDataCatalog` must not be renamed.
- **Server sort** (URL sync, page reset, "Best match", hidden sorted column):
  the contract test plus the layout spec. The page's `handleSortChange` is not
  touched.
- **Behaviour drift in shared cells** (moved code used by the legacy resource
  page): step 1 changes no output, with a pixel comparison to back that up. The
  boolean difference waits for D3.
- **Perf with wide tables** (Samples at 100 × 28): measured in step 6 before the
  legacy layer is deleted.
- **Dev console:** the `dataTable` recipe's `:first-child` Emotion warnings will
  show on every Search table tab. Possibly switch those selectors to
  `:first-of-type` (equivalent here: header rows hold only `th`, body rows only
  `td`), measured against the pinned-column perf notes in main plan §10.
