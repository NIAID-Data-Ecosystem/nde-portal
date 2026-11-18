# Chakra UI v3 Migration: Changes vs `main`

This compares `main-chakra-v3` with `main` (`5ba58053`): 61 commits, ~730 files.
A change that shows up in several places is listed once, under the theme rule or
shared component that causes it.

1. [Visual](#1-visual): app-wide theme · shared components · pages
2. [Non-visual](#2-non-visual): build & tooling · theme architecture ·
   components · APIs · behaviour & a11y · fixes & data · tests
3. [Needs review](#3-needs-review): likely unintended (confirmed in code)

---

## 1. Visual

### 1.1 App-wide (theme)

**Typography**

- Font sizes now use v3 stock values: `xs` 14px → 12px, `sm` 15px → 14px.
- Most explicit `xs` call sites were moved to `sm` to stay near the v2 size.
  This covers search filters, advanced search, sources, the resource page,
  metadata, tables and info labels.
- Body line height is 1.5 (was 2). The v2 `base` token is gone, and `short`
  changes from 1.5 to 1.375.
- MDX paragraphs inherit size, line height and colour from their container (they
  were forced to `md`/`tall`).

**Colour**

- v3 stock greys (cooler) replace the NIAID greys. Greys from v2 code were
  mapped to the nearest stock step: 700 → 500, 800 → 600, 900 → 700.
- Stock palettes (green, red, blue, …) use v3 hex values.
- The page background is `#FDFDFD` everywhere (in v2 the body was white).
- The placeholder colour also applies to textareas, selects and comboboxes.
- Focus ring is a 2px outline in the palette's focus colour (was a 3px blue
  glow).
- Form labels use `text.heading`.

**Links**

- The underline is a `text-decoration` with a 4px offset (was a 1px
  border-bottom). It still disappears on hover.
- New variants:
  - `plain`: inherits colour, underlines on hover.
  - `unstyled`: inherits colour.
  - `nav`: white, with a 2px underline when active.
- The v2 `ghost` variant is removed.

**Buttons**

- The default size is `md` (40px, 14px text) instead of v2 `base` (~51px, 16px
  text). Weight is medium.
- Other sizes follow v3: sm 36px, lg 44px; `2xs`, `xl` and `2xl` are new.
- Solid hover lightens slightly. Outline hover is a light tint (was a solid fill
  with white text).
- The new `status` variant (info, warning, success, error, neutral) replaces
  `colorScheme='negative'`.

**Inputs**

- The default size is `sm` (36px). `md` goes from 48px to 40px and `lg` from
  56px to 44px.
- The default border is lighter (`#e4e4e7`).

**Tags & badges**

- Tags:
  - Radius goes from 5px to 4px, and sizes are slightly larger.
  - The default palette is `primary`.
  - The close button sits at 80% opacity.
- Badges use the v3 stock look: pill-shaped, not uppercase, medium weight.

**Cards**

- The default is `outline` (1px border, no shadow) instead of elevated.
  `elevated` uses the v3 `sm` shadow.
- Radius goes from 5px to 6px and padding from 20px to 24px. The header is a
  column.

**Tables (recipe)**

- Header cells lose the 4px coloured bottom border and the
  uppercase/letter-spacing; they are now medium weight.
- Stripes are on odd rows.

**Tooltips**

- The arrow shows by default (was opt-in). The white background and grey border
  are set in one place.

**Other built-ins**

- Checkbox defaults to `sm`, blue, with a 14px medium label. Switch labels are
  gray.600.
- Breadcrumbs:
  - niaid.600 semibold, with ellipsis truncation.
  - Hover adds a blue.50 background and an underline.
  - The current crumb is at 80% opacity, and the stock separator is used.
- Lists have no marker by default and a 1.5rem start padding.
- Breakpoints are pinned to v2 values (`lg` stays 992px), and `radii.full` stays
  1rem.

### 1.2 Shared components

**Navigation bar & header**

- Padding is `px 4`, and the bottom border is removed.
- The active link has a 2px underline (replacing the white bar).
- Log in is a niaid outline button. Long account names truncate.
- Dropdowns are portalled, and mobile menus lose the opacity fade.
- Between `md` and `lg` the logo is the vertical one at 40px (was the horizontal
  logo at 28px).
- Header search bar:
  - The input is `sm`, and the history button is `outline`.
  - There is no mobile divider, and the mobile options menu is full width.
- AI toggle: the label is styled by the Switch recipe, and the "Active" tag sits
  outside the label.

**Footer**

- Links use the `plain` variant. The bottom-bar border is near-black (stock
  gray.900).

**Page container & notices**

- `#pagebody` is a column flex.
- Environment and Strapi notices use the shared `Alert`: v3 subtle style with an
  underlined Read More/Less. There is a 2px gap between notices (was grey
  hairlines).
- The environment notice says "staging version" (was "alpha version").

**Alert (new)**

- Replaces the page notices, the search results-limit banner, the filter error
  messages and the saved-page error banner.
- Sizes sm/md/lg, with an optional close button.

**Accordions**

- New `DetailsAccordion` (`ruled` variant):
  - The summary has a "show details"/"hide" control with +/−.
  - White background with top and bottom rules.
  - Used by resource-page sections and authors, search-card metadata and the
    sources mapping tables.
- Search results accordions are `enclosed` and white (were `page.alt` with a
  shadow).

**Collapsible text**

- New `CollapsibleText`: a bottom fade plus a "Show More/Less" trigger, shown
  only when the text overflows.
- Replaces the whole-block toggle on search card descriptions and on table
  expandable cells (labels are now title case).

**Pagination (search results + shared table)**

- Search uses Chakra Pagination (first … neighbours … last).
- The page select is replaced by a typeable `PageCombobox` (on mobile in
  search).
- Shared table: less padding and white arrow buttons.

**Shared table**

- Defaults to `size='sm'`: cell and header text go from `xs` to `sm`.
- The drawer row has more padding.

**Scroll areas**

- `ScrollContainer` is now Chakra `ScrollArea`, with an always-visible custom
  scrollbar and an optional fade mask.

**Info & metadata labels**

- `InfoLabel`:
  - `sm` `text.body` (was `xs` gray.800).
  - The icon turns blue on hover, and the label can be a link.
  - Replaces `HeadingWithTooltip`, `TooltipWithLink` and `MetadataTooltip`.
- `MetadataLabel`: uppercase `xs` medium, with an inline info icon (was an
  outlined circle button).
- Metadata blocks:
  - Disabled blocks show "N/A".
  - Bullets are discs coloured per property.
  - The search/ontology buttons are `2xs`.

**Badges**

- Access, API, download and status badges are `Badge` (subtle, rounded) instead
  of `Tag`.
- The "Paid Access" typo is fixed, and download labels use consistent casing.

**Type banner**

- The label is `sm`, the skewed tab fills the label height, and there is no
  250px minimum width.

**Other shared components**

- `CheckboxMenu` (was the `CheckboxList` popover):
  - A menu with a group label, separator and chevron.
  - Max height 500px; default size `sm`.
- Select-and-order popover / Customize Columns:
  - The close × is in the header, followed by a separator.
  - The body scrolls, and the reorder buttons are `2xs` blue.
- `InternalLinkButton` (new): a button with a sliding chevron. It replaces
  `StyledCardButton` on home, sources, features, diseases, program collections
  and the news carousel.
- Searchable items (keyword tags): tags are spaced with `gap`, and the toggle is
  an underlined text button.
- `TagWithUrl`: the default palette is `primary`, and without an href it renders
  plain text.
- `SourceLogo`: 20px tall on mobile, 40px on desktop.
- The bookmark icon button is `xs` in the niaid palette.
- Table of contents: the sidebar min width goes from 380px to 330px.
- MDX content:
  - `<br>` now renders (it was invisible).
  - Lists show disc/decimal markers.
  - A ⚠️ blockquote renders as a warning callout.
  - Videos sit in a 16:9 frame; ratio and fit can be set from the markdown
    title.
  - `<details open>` starts open.
- Charts: SVG label font sizes are restored on the brush handles and bar ticks
  (the v3 preflight was overriding them).
- Error CTA: "Back to Home" is outline and no longer full width.

### 1.3 Pages

**Home**

- Getting Started and the topic cards use the new `ImageCard`. Topic cards are 2
  columns from `md` (were side by side only from `xl`).
- Section headings go from 2xl to xl, with an even 32px between sections.
- News carousel:
  - Badges sit above the title, and the Event badge is teal.
  - The image is no longer in a fixed 16:9 frame.

**Search**

- Filters:
  - "Clear All" is on its own row, and the header border is gone.
  - Zero-count terms are no longer dimmed.
- The mobile filters button is a 2.75rem button in the secondary palette (was
  round, accent, 3.5rem).
- Tabs: no grey bar background; count tags are `surface`, baseline-aligned with
  the label.
- Result card:
  - The date and OS rows are merged into one strip.
  - Logos always sit in the footer.
  - The pill rows are merged, with separators between them.
  - A separator sits above the footer.
- Carousel cards are Card `outline` `xs`.
- Toolbar: Sort and Rows-per-page are Chakra Selects (options show
  descriptions), with the view-mode radio on the same row.
- Visual summary: the empty box is no longer rendered, and the header icon
  buttons are larger.
- The results-limit notice is an `Alert` titled "Results Limit Reached".

**Advanced search**

- The field select is a Chakra Combobox: 12px type icons and a "No options" row;
  the clear button appears only for a non-default field.
- The disclaimer slides up (it slid in from the right). Edit/Cancel are
  `subtle`.

**Resource page**

- Header:
  - Order is title + bookmark → authors → identifiers (was title → IDs →
    authors).
  - Identifiers read "Resource ID :" and use a `2xs` copy button.
  - The alternate-names line reads "Alternate names:", comma-joined.
- Authors:
  - A plain line when there are no details and ≤10 authors.
  - Contact links are icon buttons with tooltips.
  - "and" before the last name.
- Banner: dates are `sm`, right-aligned from md up, and OS icons are grouped in
  one chip.
- Provenance: a responsive grid (was a horizontally scrolling row);
  "Name/Identifier" becomes "Name".
- Collection size table: outline style with column borders, a sticky header and
  right-aligned numbers.
- Based On / Cited By: section title + description header; tables are `sm`.
- Sidebar:
  - Cards are elevated.
  - Website and code repository sit inside "Usage and Licensing".
  - Logos go up to 150px.
- JSON viewer: the heading and the Copy button sit side by side.

**Sources**

- The API version is an inline external link (was a pill).
- The release-date dividers are removed, and the CTAs sit in a button group.

**Knowledge center & integration**

- Category links use the default link style, and sidebar rows have no underline.
- The integration loading state is a bare default spinner (was centred, large,
  primary).

**Features, news & updates**

- Category tags are `surface`, and the "Join the community" cards have more
  padding.

**Diseases**

- The conditions-of-access legend is a wrapping grid from `md` (the single row
  overflowed into the Sources chart).
- Bar fills move to the v3 400 step, and section separators are darker
  (gray.600).

**Ontology browser**

- Mobile:
  - The header and Configure View stack.
  - Each row puts the term above its counts.
  - The indent is halved and capped at 25%, and count columns are a fixed 88px.
- The tree border is darker. The selected term is shown by semibold weight only
  (no primary colour).
- Settings popover: the close × sits inline with the title, followed by a
  separator.

**Repository matcher**

- Filter chips go from `lg` to `md`, and checkboxes use the secondary palette.
- Tag lists truncate after 12 tags (was 10), and link cells are clamped to 2
  lines.

**Saved**

- The error banner is the shared `Alert`, and the section description width is
  fluid.

**Account (login, welcome, settings)**

- Login: an opaque elevated card (was translucent with a border); niaid `lg`
  buttons.
- Welcome: tighter header spacing, and the list has no indent.

**404**

- "Back to Home" is a solid button.

---

## 2. Non-visual

### 2.1 Dependencies, build & tooling

- `@chakra-ui/react` goes from ^2.10.7 to ^3. `@chakra-ui/cli` is added for
  typegen.
- `react-select` is removed (replaced by Chakra Combobox).
- `theme:typegen` runs on `postinstall`, `typecheck` and `build:core`.
- `yarn lint` is now `eslint .`, with an ESLint 9 flat config
  (`eslint.config.mjs`) and a new `lint:fix`.
- `simple-import-sort` is enforced, which reorders imports across the codebase.
- `.eslintrc.json` and `.eslintignore` are removed. `.lintstagedrc` becomes
  `.lintstagedrc.js`, with its ESLint step commented out.
- `.vscode/` settings and recommended extensions are added (Prettier, ESLint).
- Chakra agent skills are added (`chakra-ui-builder`, `-migrate`, `-refactor`,
  plus `skills-lock.json`), and the `a11y-test` skill is updated for v3.

### 2.2 Theme architecture

- `extendTheme` is replaced by `createSystem(defaultConfig, defineConfig(...))`,
  and `ChakraProvider` takes `value={system}`.
- `foundations/` and `components/*.theme.ts` are split into `tokens/`,
  `semantic-tokens/`, `recipes/`, `slot-recipes/` and `global-css.ts`.
- New recipes with no v2 equivalent: accordion, alert, breadcrumb, checkbox,
  switch, menu, popover, list, input labels and `tableShell`.
- Raw values are read with `system.token()` / `palette()` instead of importing
  `theme`, so there are no circular theme imports.
- Token renames:
  - `page.bg` → `bg`
  - `page.alt` → `bg.alt`
  - `page.placeholder` → `text.placeholder`
  - `link.color` → `link`
  - `status.*` → `success` / `error` / `warning` / `info`, and `*_lt` →
    `*.subtle`
- Custom palettes define the v3 semantic roles (`solid`, `fg`, `subtle`,
  `focusRing`, …) plus custom ones such as `outlineFg`.
- `html { colorPalette: none }` is set, and light mode is pinned via
  `<Html className='light'>`.
- The `shake` keyframe is registered in the theme. The hand-written theme types
  are replaced by typegen output.

### 2.3 Components

**Added**

- `Alert`, `toaster`, `CollapsibleText`, `DetailsAccordion`,
  `InternalLinkButton`, `PageCombobox`, `ResourceIdentifiers`, `ContentHeader`,
  `ImageCard`, `MDXMedia`, `EmptyGlyph`, `useTableSize`, `useBookmarkDataset`.
- Badges are consolidated into config-driven `metadata-badges` +
  `BadgeWithTooltip` presets.
- Advanced search `SearchTypePicker` replaces `SearchOptions` (`RadioSelect`,
  `RadioItem`).

**Removed**

- The local `Skeleton` fork, replaced by v3's native Skeleton. The LCP check on
  a results page is still outstanding.
- `LoadingSpinner`, `Icon`/`MetadataIcon`/`Glyph`, `TooltipWithLink`, both
  `Banner`s, `HeadingWithTooltip`, `LandingPageCards`, `StyledCardButton`.
- Dead code unused on `main`:
  - `AdvancedSearchWithModal` and the advanced-search modal/open button
  - `AltmetricBadge`, `software-information`, funding row/cell,
    `DownloadProgress`
  - `results-count`, `metadata-score-toggle`
  - `useRepoData`, `useHasMounted`, style files and the `generate-schema-csv`
    script
- The resource-page "AI Generated" summary (non-production only).

**Replaced / moved**

- `CheckboxList` → `CheckboxMenu` (Menu instead of Popover).
- `TypeBanner` → `src/components/type-banner`; `ExpandableCells` →
  `src/components/expandable-cells`.
- `useToast` → the app `toaster` store; `Tooltip` is now a flat wrapper over the
  v3 compound Tooltip.
- Download metadata: the hand-rolled dropdown is now a Chakra Menu.

### 2.4 APIs & naming

- Chakra v2 APIs are replaced by their v3 equivalents throughout:
  - compound components: Dialog, Drawer, Tabs, Menu, Popover, Accordion,
    RadioGroup, Checkbox, Switch, Tag (always with `Tag.Label`), Table, List,
    Field
  - prop renames: `isDisabled` → `disabled`, `colorScheme` → `colorPalette`,
    `spacing` → `gap`, `noOfLines` → `lineClamp`
  - `as` → `asChild`, and `Divider` → `Separator`
- Tabs and accordions are keyed by value/id instead of index.
- App props: `isLoading` → `loading` (auth context, tables, hooks, resource
  sections).
- `InfoLabel`: `title`/`tooltipText` → `children`/`label` + `tooltipProps`, plus
  `href`.
- `SearchableItems`: a `query` object replaces `searchParams`, `name` →
  `heading`, and `itemLabel` and `size` are new.
- `SORT_OPTIONS`/`PAGE_SIZE_OPTIONS`: `name` → `label`, `tooltip` →
  `description`.
- Helper renames:
  - `getColorScheme` → `getColorPalette`
  - `getMetadataTheme` → `getMetadataColorPalette`
  - `getTypeColor` → `getTypeColors`
  - `KnownProvider.icon.as` → `icon.component`
- react-icons are passed via `<Icon as>`, so there are no ref warnings.
- `src/utils/api/types.ts` gains raw API types (`APIResource`, `OneOrMany`, …),
  and `alternateName` is widened to `string | string[]`.

### 2.5 Behaviour & accessibility

**Interaction**

- Advanced search field/enum select (Combobox):
  - Opening clears the input and shows the selection as the placeholder;
    abandoning restores it.
  - Fuzzy matches are ranked.
  - Descriptions expand on keyboard highlight.
- Editable query:
  - Only Submit commits, and invalid input stays in edit mode.
  - The buttons no longer remount or lose focus.
- Page comboboxes accept a typed page number and revert out-of-range input.
- `CheckboxMenu` supports arrow keys and stays open while toggling.
- `CollapsibleText` keeps links in the text clickable; tabbing to a clipped link
  expands it.
- Resource sections, details accordions and table drawer rows lazy-mount and
  unmount on close.
- Nav links and MDX internal links use `next/link` (client-side navigation).
  Absolute production URLs in MDX are reduced to paths.
- The metadata Search button is a real link (focusable, middle-click works).
- Provenance "View collection" filters on `sourceOrganization.name.raw`.
- Rows-per-page is disabled when the total fits the smallest option.
- Docs:
  - The selected category re-expands once loaded.
  - The mobile menu is disabled while loading.

**Flicker & performance**

- The filter list and virtualized tables keep rows mounted on re-render, so
  skeletons no longer blink.
- Filter-list row heights are cached per term, so rows no longer overlap.
- Saved tables use a stable `getRowId`.

**Accessibility**

- Dialog, drawer and popover close buttons are visible and labelled.
- Nested interactive elements and invalid nesting are removed across nav,
  resource page, sources, diseases and home (button inside link, `p` inside
  link/span).
- Nav links set `aria-current="page"`. Pagination has a labelled nav,
  `aria-current` and per-page labels.
- New labels:
  - the filters drawer and mobile filters button
  - the visualization modal and popovers
  - author contact links and the OS icons chip
  - the tree item edit button
  - the search-type select, which also gets a unique id
- `HeadingWithLink`'s "#" is hidden from screen readers. Switch ARIA attributes
  are kept on the hidden input.
- Accordion and details triggers expose `aria-expanded`/`aria-controls`. In MDX
  `<details>`, the heading wraps the trigger.
- Scroll areas are keyboard-focusable when they overflow on either axis.
- Search tab labels are a `span` (were `h2`); the tab name is the label plus its
  count.

### 2.6 Bug fixes & data

- `formatAPIResource` keeps meaningful `false`/`0` values (e.g.
  `isAccessibleForFree: false`, `contentSize: 0`).
- The funded-by-NIAID list uses full source names.
- `formatLicense`: a non-URL licence shows its text instead of a broken link.
- Authors:
  - Each name is formatted individually, so names containing commas are no
    longer split.
  - ORCID is shown once, over `https`.
- Banner date dedupe compares only with the published, created and modified
  dates.
- The Code Repository tooltip read the wrong key (`coreRepository`).
- Advanced search history is no longer reversed in place on each render, and a
  stray `console.log` is removed.
- Ontology browser:
  - The search input uses the live value, so keystrokes aren't lost.
  - Removing a term matches on taxon id.
  - The popup runs with only a querystring and uses bare NCBI ids.
- Sources cards are keyed by slug, so accordion state follows its card.
- The docs MDX image override is hoisted, so playing videos no longer remount.
- The Visual summary open state is stored as `['item-0']`; an old stored `[0]`
  reads as collapsed.

### 2.7 Tests

- Jest test files: 23 added, 3 removed (duplicate nav tests and nav styles),
  about 100 updated.
- New coverage:
  - Advanced search: FieldSelect, EnumInput, EditableQueryText.
  - Search & tables: PageCombobox, pagination, metadata accordion,
    `useTableSize`.
  - Shared components: CollapsibleText, DetailsAccordion, Alert, MDX and media.
  - Resource page: authors, resource banner, TypeBanner.
  - Ontology browser: count tag, header, search list, popup, helpers.
  - Other: API helpers, brushable list chart.
- `src/__tests__/utils/render.tsx` wraps RTL's `render` in `ChakraProvider`,
  which v3 requires.
- `jest.setup.js`: the `next/link` mock forwards refs, and a `PointerEvent`
  polyfill is added.
- `jest.config.js`: `maxWorkers: '50%'` and `workerIdleMemoryLimit: '512MB'`;
  `d3-array` and `internmap` are added to the ESM allowlist.
- e2e:
  - `e2e/utils/skeleton.ts` helpers replace the `.custom-skeleton-loading`
    selector.
  - Accordion specs use real clicks and the new "show details"/"hide" names.

---

## 3. Needs review

- The shared table's empty-state cell lost `colSpan`, so the message fills only
  the first column. (`src/components/table/index.tsx`) [NOTE: Will be fixed in
  table consolidation feature]

- Search "Other Resources":
  - The tab count excludes Program Info cards.
  - The accordion no longer opens by default when only Program Info matches.
  - `programInfoCount` falls through onto `Tabs.Root`.
  - Files: `layout/tabs.tsx`, `search-results-tabs-controller/index.tsx`
- Selectors broken by the codemod (`'& & …'`) mean two styles no longer apply:
  the carousel's max-width/padding and the filter-list scrollbar hover.
  (`layout/carousel-wrapper.tsx`, `filters/components/list.tsx`) [NOTE: Carousel
  component to be replaced eventually with Chakra ui implementation]
