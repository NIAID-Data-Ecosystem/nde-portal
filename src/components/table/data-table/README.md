# DataTable

The shared table for interactive, data-driven tables (search results, repository
matcher, saved items, …). It renders native table markup with Chakra's table
conventions, and keeps data fetching out of the table: you pass rows in, and it
tells you when the user asks for a different sort.

The legacy `src/components/table` (`Table`, `Cell`, `Th`, …) is still used by
the tables that haven't migrated yet.

```ts
import {
  ColumnCustomizer,
  DataTable,
  useColumnPreferences,
  useDataTable,
} from 'src/components/table/data-table';
```

## Pieces

|                        | Responsibility                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DataTable`            | Presentation: native `<table>`, sticky header, sort buttons, pinned first column, status rows, scroll viewport, pager.       |
| `useDataTable`         | Headless state: resolves columns, applies preferences, sorts (client) or reports sort requests (server), paginates (client). |
| `useColumnPreferences` | A table's visible columns, order and pinning, persisted in localStorage per table.                                           |
| `ColumnCustomizer`     | The "Customize Columns" popover for those preferences.                                                                       |
| `useTableSearch`       | Debounced free-text filtering of prebuilt rows.                                                                              |

What stays in your view: fetching (React Query), URL state, API sort-field
mapping, row shaping, filters, page-level pagination.

## Columns

```ts
const COLUMNS: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', sort: true, hideable: false },
  { id: 'size', header: 'Size', type: 'number', sort: true },
  { id: 'modified', header: 'Modified', type: 'date', sort: true },
  { id: 'description', header: 'Description', type: 'longText' },
  { id: 'species', header: 'Species', type: 'tags' },
];
```

Keep column arrays stable (module constants): cells memoize on them.

`type` drives the defaults, so most columns need nothing else:

| type             | renders                                            | align | first sort | size (px, min / max) |
| ---------------- | -------------------------------------------------- | ----- | ---------- | -------------------- |
| `text` (default) | text; arrays comma-joined                          | start | asc        | 140 / 320            |
| `longText`       | 4 lines + "Show More"                              | start | asc        | 280 / 560            |
| `number`         | `1,234` (fixed locale)                             | end   | desc       | 80 / –               |
| `date`           | `YYYY-MM-DD` (`formatDate`)                        | start | desc       | 100 / –              |
| `identifier`     | text, breaks anywhere, never number-formatted      | start | asc        | 120 / 260            |
| `link`           | URL or `{ href, label }`; external opens a new tab | start | asc        | 160 / 320            |
| `list`           | one per line, "Show N More" past 5                 | start | asc        | 160 / 320            |
| `tags`           | tags, "Show N More" past 12                        | start | asc        | 180 / 360            |

Sizes are soft bounds for native auto layout: `min` is where the table starts
scrolling sideways, `max` is where content starts wrapping. With few columns the
table fills its container.

Overrides, per column: `accessor` (default `row[id]`), `cell` (custom React
content; return `null` for the "No data" placeholder), `sort` (`true`, or
`{ value, descFirst }`), `size`, `align`, `hideable`, `defaultVisible`,
`description` (header tooltip and accessible description).

A missing value (`null`, `''`, `[]`) shows a muted `—` read as "No data". Real
values such as `0` or "Unknown" are shown as they are.

`cell` is called as a function during render: render components inside it, but
don't call hooks in it directly.

## Examples

Static table, everything internal:

```tsx
<DataTable
  label='Downloadable files'
  data={files}
  columns={FILE_COLUMNS}
  getRowId={file => file.contentUrl}
  pagination
  status={{ loading }}
/>
```

Server-sorted (the caller fetches; the table only reports the request):

```tsx
const table = useDataTable({
  data: rows,
  columns: DATASET_COLUMNS,
  getRowId: row => row._id,
  sort: {
    mode: 'server',
    state: fromApiSort(sort),
    onChange: next => updateRoute({ sort: toApiSort(next), from: 1 }),
  },
});
<DataTable table={table} label='Dataset search results' />;
```

Customizable columns with pinning (see
`src/views/repository-matcher/components/RepositoryMatcherTable.tsx`):

```tsx
const preferences = useColumnPreferences({
  tableId: 'repository-matcher',
  columns: COLUMNS,
});
const table = useDataTable({ data, columns: COLUMNS, getRowId, preferences });

<ColumnCustomizer columns={COLUMNS} preferences={preferences} allowReorder allowPinning />
<DataTable table={table} label='…' interactive />
```

## Layout options

The table owns how it behaves; the parent owns how much space it takes.

- **Default: bounded.** The table is at most one screen tall (`100dvh`). Its
  rows scroll inside it with the header stuck at the top, and a table with fewer
  rows only takes the space it needs (it's a cap, not a height).
- **`maxHeight`** sets the cap with any CSS max-height: fixed (`'400px'`),
  responsive (`{ base: '60vh', md: '80vh' }`), or parent-relative (`'100%'`
  inside a parent with a definite height). A responsive value replaces the
  default at every breakpoint, so give it a `base`: `{ md: '600px' }` alone
  leaves the table uncapped below `md`.
- **Layout-driven sizing:** the table shrinks into a flex-column parent's
  leftover space. To make a table fill the window below its toolbar, wrap the
  toolbar and the table in `<Flex direction='column' maxH='100dvh'>`: the
  toolbar keeps its height and the table takes the rest, however the toolbar
  wraps. No offsets to maintain. See `src/pages/repository-matcher.tsx`.
- **`maxHeight='none'`:** natural height. The table grows with its rows and the
  page scrolls. Its header then scrolls away with the page: a table that scrolls
  sideways is its own scroll container, and `position: sticky` can only stick
  inside that. It's just a CSS value: the same DOM and code as the bounded
  default.
- **Rule: natural height must cost bounded tables nothing.** No JS, DOM,
  listeners, observers or render work may exist only for `maxHeight='none'`,
  whether it's behind a condition or runs in both modes. Handle the difference
  in CSS or layout. A test checks that both modes render and wire up the same
  way, but it can't catch work that runs unconditionally, so check in review.
- A floating horizontal scrollbar is pinned to the bottom of the window whenever
  the table is on-screen but its own scrollbar is below the fold.
- `topScrollbar`: an extra horizontal scrollbar above the table (off by
  default).
- `interactive`: row hover highlight.
- Pinning (`allowPinning` on the customizer) applies from `md` up.

## Pagination

`pagination` (on `DataTable` or `useDataTable`) pages the rows in the browser.
The table shows the current page with the shared pager below it, inside its
border: rows per page, first/previous/next/last, a page picker and the totals
(`src/components/table/components/pagination.tsx`). This works the same whether
you pass `pagination` to `DataTable` directly or pass a `table` from
`useDataTable`.

- `pagination: { pageSizes: [10, 50] }` sets the rows-per-page choices; the
  first is the starting size. The default is 5, 10, 50, 100.
- The pager shows only while there are rows to page through, not over the
  loading skeleton, an error or an empty table.
- Changing page scrolls a bounded table's rows back to the top.
- The pager is loaded on demand, so tables without pagination don't ship it.
- Server-paginated tables (Search) page their own `data` and keep their
  page-level pagination: don't pass `pagination` for them.

## Preferences

Stored under `nde:table:<tableId>:v1` as `{ visible, order, pinned }`.
`legacyKeys` migrates old keys on first read. Columns added after a user saved
take their default visibility and slot in after their nearest predecessor.
Non-hideable columns are always visible and first. "Clear All" leaves the
`fallbackIds` (default: the non-hideable columns).

## Accessibility

- Native table semantics; the `label` is the caption and the table's name.
- One sort button per sortable header, covering the whole cell; state on the
  `<th>` as `aria-sort`, and announced in a live region after each change.
- Header layout: title and info icon at the start, sort arrows at the end.
  Titles wrap to two lines; headers are vertically centred.
- Header descriptions: an info icon beside the title (the `InfoLabel` icon)
  shows the description on hover and keyboard focus. On touch a tap toggles it.
  It is also the icon button's accessible description, and it's independent of
  sorting.
- The scroll viewport is a focusable, named region whenever it scrolls.
- Scroll padding keeps keyboard focus clear of the sticky header and pinned
  column.

## Tests

Unit and component tests live in `__tests__/`. Real-browser layout checks
(sticky header, pinning, widths, scrollbar reachability, touch) are in
`e2e/layout/`, and the performance harness in `e2e/perf/`.
