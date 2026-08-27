import fs from 'fs/promises';
import path from 'path';
import SCHEMA_DEFINITIONS from '../configs/schema-definitions.json';
import {
  ALL,
  AS,
  BaseEntry,
  DS,
  HARD,
  HOME,
  KC,
  NONE,
  RES,
  Resolved,
  SBKC,
  SEARCH,
  TODAY,
  capped,
  countSites,
  createResolver,
  csvLine,
  from,
  getJson,
  suffix,
  uniq,
} from './lib/audit-csv';

/**
 * Generates the tooltip / hover-text audit spreadsheet.
 *
 * Run with `yarn generate-tooltip-audit`, which loads .env.production so the
 * sampled chart examples come from the live NDE API.
 *
 * Four unrelated mechanisms put text on screen when something is hovered, and
 * this inventory covers all of them:
 *
 *  1. Chakra `<Tooltip label=…>` — the shared wrapper, tooltip-with-link and
 *     InfoLabel. Opens on hover AND focus, so keyboard users get it too.
 *  2. Native HTML `title=` — hover only. No keyboard, no touch. Rare here, and
 *     easy to confuse with the many component props also called `title`.
 *  3. Hover reveals — `onMouseOver`/`onMouseEnter` opening a popover or
 *     expanding truncated text.
 *  4. Chart tooltips — visx `TooltipWithBounds`/`TooltipInPortal`, whose text is
 *     built from the hovered datum.
 *
 * Inline SVG `<title>` is deliberately NOT here: it is an accessible name and is
 * already covered by aria-label-audit.csv.
 *
 * As with the other audits, the file/line/copy of every site is recorded by hand
 * and expressions are resolved to the real strings. The count printed on each
 * run must reconcile against a grep of `src/`.
 */

const OUT_DIR = 'docs/accessibility';
const OUT_FILE = 'tooltip-audit.csv';

// ------------------------------------------------- audit-specific route sets
const SOURCES = ['/sources'];
const RM = ['/repository-matcher'];
const RES_SEARCH = ['/resources', '/search'];
const OB = ['/ontology-browser', '/search'];
const CHART_ROUTES = uniq(['/search', '/diseases/[slug]']);

// ---------------------------------------------------------------- constants
const HOVER_FOCUS = 'hover + focus (Chakra Tooltip)';
const HOVER_ONLY = 'hover only (native title attribute)';
const HOVER_REVEAL = 'hover reveal (onMouseOver)';
const CHART_HOVER = 'chart hover (visx tooltip)';

const SCHEMA = 'configs/schema-definitions.json (via getMetadataDescription)';
const CALLERS = 'literal passed by each caller';

/** `yes` / `no` for the "also the accessible name?" column. */
const SAME_AS_ARIA = 'yes - identical aria-label on the same element';
const NO_ARIA = 'no - element has no aria-label';
const DIFFERS = (aria: string) => `NO - aria-label differs: "${aria}"`;

// -------------------------------------------------------------- visible text
/**
 * What the user can already read on each hover target, keyed by `file:line`.
 *
 * Every one of these was read from the JSX individually. A bulk pattern match
 * over the source is not good enough here: an early attempt classified
 * `summary/index.tsx:37` as icon-only when its trigger is a `<Link>` reading
 * "SUMMARY".
 *
 * Conventions:
 *  - a plain string is text genuinely rendered on the trigger;
 *  - `… (adjacent label - trigger is a <icon> icon)` where the trigger itself
 *    has no text but annotates a label beside it;
 *  - `(none - <icon> icon)` where there is no text at all, which means the
 *    tooltip is carrying the element's only wording;
 *  - `truncated: true` marks the case where the visible text is clipped and the
 *    tooltip exists to restore it. Only the source shows that (`isTruncated`,
 *    `noOfLines`), so it cannot be derived from the two strings.
 */
interface VisibleText {
  text: string;
  truncated?: boolean;
}

const NO_TEXT = (icon: string) => `(none - ${icon} icon)`;
const BESIDE = (label: string, icon: string) =>
  `${label} (adjacent label - trigger is a ${icon} icon)`;
const CHART_MARK = (mark: string) => `(none - ${mark}, no text on the mark)`;

const VISIBLE_TEXT: Record<string, VisibleText> = {
  // --- advanced search
  'src/components/advanced-search/components/EditableQueryText/index.tsx:221': {
    text: NO_TEXT('pen / edit'),
  },
  'src/components/advanced-search/components/EditableQueryText/index.tsx:264': {
    text: 'the query text the user has typed (EditablePreview)',
  },
  'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx:113':
    { text: 'the field label in the picker row' },
  'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx:99':
    {
      text: 'the field label, with its description clipped to one line',
      truncated: true,
    },
  'src/components/advanced-search/components/Search/components/SearchOptions/components/RadioItem.tsx:11':
    { text: 'the search-type radio label, e.g. "Exact Match"' },

  // --- search bars
  'src/components/search-bar/index.tsx:91': {
    text: NO_TEXT('clock / history'),
  },
  'src/components/search-bar/index.tsx:276': {
    text: NO_TEXT('clock / history'),
  },
  'src/views/docs/components/search-bar/SearchBar.tsx:288': {
    text: NO_TEXT('clock / history'),
  },

  // --- badges
  'src/components/metadata-compatibility-source-badge/index.tsx:16': {
    text: 'Metadata Compatibility',
  },
  'src/components/metadata-compatibility-source-badge/components/badge.tsx:260':
    {
      text: 'Recommended | <n>% (SVG text on the badge)',
    },
  'src/components/metadata-compatibility-source-badge/components/badge.tsx:286':
    {
      text: 'Fundamental | <n>% (SVG text on the badge)',
    },
  'src/components/metadata-completeness-badge/Circular.tsx:290': {
    text: 'Metadata Compatibility',
  },
  'src/components/metadata-completeness-badge/Circular.tsx:168': {
    text: CHART_MARK('completeness ring segment'),
  },
  'src/components/badges/components/BadgeWithTooltip.tsx:20': {
    text: 'the badge value (TagLabel)',
  },

  // --- resource sections
  'src/components/resource-sections/components/authors/index.tsx:161': {
    text: NO_TEXT('external window'),
  },
  'src/components/resource-sections/components/based-on/index.tsx:285': {
    text: 'the ontology term name (TagWithUrl)',
  },
  'src/components/resource-sections/components/provenance/index.tsx:265': {
    text: 'View collection',
  },
  'src/components/resource-sections/components/summary/index.tsx:37': {
    text: 'SUMMARY',
  },
  'src/components/resource-sections/components/type-banner/index.tsx:140': {
    text: 'the resource type, e.g. DATASET',
  },
  'src/components/metadata/components/buttons.tsx:42': {
    text: 'the ontology term label',
  },
  'src/components/metadata/components/buttons.tsx:107': {
    text: NO_TEXT('magnifying glass'),
  },

  // --- ontology browser
  'src/views/ontology-browser/components/tree/components/breadcrumbs.tsx:76': {
    text: NO_TEXT('breadcrumb chevron'),
  },
  'src/views/ontology-browser/components/ontology-browser-count-tag.tsx:46': {
    text: 'the dataset count',
  },
  'src/views/ontology-browser/components/tree/components/tree-node.tsx:283': {
    text: 'the dataset count beside the term',
  },
  'src/views/ontology-browser/components/ontology-search-list/toggle.tsx:20': {
    text: 'Toggle Search List (mobile only - icon-only on desktop)',
  },

  // --- search results
  'src/views/search/components/results-list/components/card/index.tsx:275': {
    text: "the record's date, beside a clock icon",
  },
  'src/views/search/components/results-list/components/carousel-compact-card/resource-catalog-card/index.tsx:127':
    { text: "the record's date, beside a clock icon" },
  'src/views/search/components/results-list/components/card/metadata-accordion/index.tsx:158':
    { text: 'the metadata property name on the accordion tab' },
  'src/views/search/components/results-list/components/card/operating-systems/index.tsx:17':
    { text: NO_TEXT('operating-system') },
  'src/views/search/components/summary/components/visualization-card/card-header.tsx:45':
    { text: NO_TEXT('chart action') },
  'src/views/search/components/summary/components/visualization-card/card-header.tsx:77':
    { text: NO_TEXT('expand') },
  'src/views/search/components/summary/components/visualization-card/card-header.tsx:85':
    { text: NO_TEXT('close') },

  // --- filters
  'src/views/search/components/filters/components/section.tsx:69': {
    text: 'the filter name',
  },
  'src/views/search/components/filters/components/section.tsx:90': {
    text: BESIDE('the filter name', 'pie chart'),
  },
  'src/views/search/components/filters/components/checkbox.tsx:162': {
    text: 'the filter option label',
  },

  // --- shared controls
  'src/components/bookmark-buttons/icon-button.tsx:15': {
    text: NO_TEXT('bookmark'),
  },
  'src/components/copy-button/index.tsx:46': {
    text: '(none - copy icon; the confirmation text appears only after clicking)',
  },
  'src/components/select-and-order-popover/components/PopoverListItem.tsx:87': {
    text: BESIDE('the item name', 'drag handle'),
  },
  'src/components/select-and-order-popover/components/PopoverListItem.tsx:111':
    {
      text: 'the item name, clipped to one line',
      truncated: true,
    },
  'src/components/table/components/cell.tsx:132': {
    text: 'the column header label',
  },
  'src/components/info-label/index.tsx:20': {
    text: 'the label text, followed by an ⓘ icon',
  },
  'src/components/select/components/OptionItem.tsx:29': {
    text: 'the option label',
  },
  'src/components/dropdown-button/index.tsx:74': {
    text: 'the button label',
  },
  // Not an icon: the PopoverTrigger is a Flex (cursor: help) wrapping
  // <AIToggleLabel>, so the visible text is the toggle's own label.
  'src/components/page-container/components/search/components/ai-toggle.tsx:130':
    { text: 'the AI-assisted search toggle label and switch' },
  'src/views/repository-matcher/components/TableCells.tsx:103': {
    text: 'the cell value, clipped to one line',
    truncated: true,
  },

  // --- metadata ⓘ icons: no text on the trigger, but always rendered directly
  // after the property label (overview-section-wrapper/index.tsx:25-26)
  'src/components/metadata/components/block.tsx:79': {
    text: BESIDE('the metadata property name', 'ⓘ info'),
  },
  'src/components/metadata/components/tag.tsx:22': {
    text: 'the property name and value, e.g. "Measurement Technique | RNA-seq"',
  },
  'src/views/diseases/disease/components/property-treemap-lists.tsx:36': {
    text: BESIDE('the treemap section heading', 'ⓘ info'),
  },

  // --- chart marks: the hovered thing is a shape, not text
  'src/views/search/components/filters/components/date-filter/components/histogram.tsx:233':
    { text: CHART_MARK('histogram bar') },
  'src/components/visualizations/bar/index.tsx:395': {
    text: CHART_MARK('bar segment'),
  },
  'src/views/diseases/disease/visualizations/bar-chart.tsx:324': {
    text: CHART_MARK('bar segment'),
  },
  'src/views/diseases/disease/visualizations/stacked-bar-chart.tsx:224': {
    text: CHART_MARK('stacked bar segment'),
  },
  'src/views/diseases/disease/visualizations/donut-chart.tsx:274': {
    text: CHART_MARK('donut slice'),
  },
  'src/views/diseases/disease/visualizations/treemap-chart.tsx:322': {
    text: 'the term name inside the treemap tile, where the tile is big enough',
  },
  'src/components/metadata-compatibility-source-badge/components/badge.tsx:315':
    {
      text: CHART_MARK('badge segment'),
    },
  'src/components/visualizations/pie/index.tsx:228': {
    text: '(never renders - component has no importer in src/)',
  },
};

/** How the tooltip relates to what the user can already read. */
const relationshipOf = (
  visible: string,
  tooltip: string,
  truncated?: boolean,
) => {
  if (truncated) return 'shows the full text of a truncated label';
  if (visible.startsWith('(none') || visible.startsWith('(never'))
    return 'tooltip is the only text';
  if (visible.includes('(adjacent label')) return 'annotates an adjacent label';
  if (visible.trim() && visible.trim() === tooltip.trim())
    return 'repeats the visible text';
  return 'adds detail';
};

// ------------------------------------------------------------------ entries
interface TooltipEntry extends BaseEntry {
  /** The thing a user hovers to see the text. */
  element: string;
  trigger: string;
  source: string;
  /** Resource type whose schema description this row shows, when applicable. */
  resourceType: string;
  alsoAccessibleName: string;
  scope: string;
  kind: string;
}

const rows: TooltipEntry[] = [
  // ---------------------------------------------------------- 1. literals
  {
    routes: AS,
    file: 'src/components/advanced-search/components/EditableQueryText/index.tsx',
    line: 221,
    element: 'IconButton (edit query)',
    trigger: HOVER_FOCUS,
    copy: 'Click to edit',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: DIFFERS('Edit'),
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: AS,
    file: 'src/components/advanced-search/components/EditableQueryText/index.tsx',
    line: 264,
    element: 'Textarea (query text)',
    trigger: HOVER_FOCUS,
    copy: 'Click to edit',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: DIFFERS('Edit query input'),
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 91,
    element: 'IconButton (search history)',
    trigger: HOVER_FOCUS,
    copy: 'View search history.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'literal',
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 276,
    element: 'IconButton (search history, mobile)',
    trigger: HOVER_FOCUS,
    copy: 'View search history.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'literal',
  },
  {
    routes: KC,
    file: 'src/views/docs/components/search-bar/SearchBar.tsx',
    line: 288,
    element: 'IconButton (search history)',
    trigger: HOVER_FOCUS,
    copy: 'View search history.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SOURCES,
    file: 'src/components/metadata-compatibility-source-badge/index.tsx',
    line: 16,
    element: 'metadata compatibility badge',
    trigger: HOVER_FOCUS,
    copy:
      'The metadata compatibility badge is a quantitative measure that ' +
      'represents how well a repository aligns with the metadata standards of ' +
      'the NIAID Data Ecosystem.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SOURCES,
    file: 'src/components/metadata-compatibility-source-badge/components/badge.tsx',
    line: 260,
    element: 'badge segment (recommended)',
    trigger: HOVER_FOCUS,
    copy: 'Recommended fields coverage.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SOURCES,
    file: 'src/components/metadata-compatibility-source-badge/components/badge.tsx',
    line: 286,
    element: 'badge segment (fundamental)',
    trigger: HOVER_FOCUS,
    copy: 'Fundamental fields coverage.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata-completeness-badge/Circular.tsx',
    line: 290,
    element: 'Link (documentation)',
    trigger: HOVER_FOCUS,
    copy: 'See metadata compatibility documentation.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'literal',
  },
  {
    routes: RES,
    file: 'src/components/resource-sections/components/authors/index.tsx',
    line: 161,
    element: "Link (author's website)",
    trigger: HOVER_FOCUS,
    copy: 'Website',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: DIFFERS('Personal website.'),
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: RES,
    file: 'src/components/resource-sections/components/based-on/index.tsx',
    line: 285,
    element: 'ontology link',
    trigger: HOVER_FOCUS,
    copy: 'Show ontology information.',
    source: `${HARD} (empty string when the item has no url)`,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: RES,
    file: 'src/components/resource-sections/components/provenance/index.tsx',
    line: 265,
    element: 'program collection link',
    trigger: HOVER_FOCUS,
    copy: 'Search for results from this program collection.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: RES,
    file: 'src/components/resource-sections/components/summary/index.tsx',
    line: 37,
    element: 'AI summary heading',
    trigger: HOVER_FOCUS,
    copy: 'This summary is based on the description field using ChatGPT4.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: OB,
    file: 'src/views/ontology-browser/components/tree/components/breadcrumbs.tsx',
    line: 76,
    element: 'IconButton (parent node)',
    trigger: HOVER_FOCUS,
    copy: 'Show parent',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: DIFFERS('show parent node'),
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/components/card/index.tsx',
    line: 275,
    element: 'date field on a result card',
    trigger: HOVER_FOCUS,
    copy:
      'Corresponds to the most recent of date modified, date published and ' +
      'date created.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/components/carousel-compact-card/resource-catalog-card/index.tsx',
    line: 127,
    element: 'date field on a compact card',
    trigger: HOVER_FOCUS,
    copy:
      'Corresponds to the most recent of date modified, date published and ' +
      'date created.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata/components/buttons.tsx',
    line: 42,
    element: 'ontology info button',
    trigger: HOVER_FOCUS,
    copy: 'See ontology information.',
    source: `${HARD} as a fallback when no ariaLabel is passed`,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'literal',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata/components/buttons.tsx',
    line: 107,
    element: 'property search button',
    trigger: HOVER_FOCUS,
    copy: 'Search the NDE for this property value',
    source: `${HARD} as a fallback when no ariaLabel is passed`,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'literal',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 77,
    element: 'IconButton (expand chart)',
    trigger: HOVER_FOCUS,
    copy: 'Expand chart to modal view.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: DIFFERS('Expand chart to modal view'),
    scope: 'route-specific',
    kind: 'literal',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 85,
    element: 'IconButton (remove chart)',
    trigger: HOVER_FOCUS,
    copy: 'Remove chart from display.',
    source: HARD,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },

  // -------------------------------------------------- 2. pass-through props
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 45,
    element: 'IconButton (chart action)',
    trigger: HOVER_FOCUS,
    copy: '{tooltipContent}',
    source: CALLERS,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
    derivesFrom: from(
      [
        'src/views/search/components/summary/components/visualization-card/card-header.tsx',
        77,
      ],
      [
        'src/views/search/components/summary/components/visualization-card/card-header.tsx',
        85,
      ],
    ),
  },
  {
    routes: uniq(['/saved', '/search']),
    file: 'src/components/bookmark-buttons/icon-button.tsx',
    line: 15,
    element: 'IconButton (bookmark)',
    trigger: HOVER_FOCUS,
    copy: '{label}',
    source: `${CALLERS}; the same string is also the aria-label at line 24`,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },
  {
    routes: RES,
    file: 'src/components/copy-button/index.tsx',
    line: 46,
    element: 'Button (copy)',
    trigger: HOVER_FOCUS,
    copy: '{hasCopied ? copiedText : buttonText}',
    source: `${CALLERS} as buttonText/copiedText; also the aria-label at line 51`,
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },
  {
    routes: OB,
    file: 'src/views/ontology-browser/components/ontology-search-list/toggle.tsx',
    line: 20,
    element: 'Button (expand search list)',
    trigger: HOVER_FOCUS,
    copy: '{label}',
    source:
      'default value of the label prop at toggle.tsx:9; also the aria-label',
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/section.tsx',
    line: 90,
    element: 'IconButton (chart toggle)',
    trigger: HOVER_FOCUS,
    copy: '{isVizActive ? `Remove ${name} …` : `Add ${name} …`}',
    source: 'template in JSX + the filter names in filters/config.ts',
    resourceType: '',
    alsoAccessibleName: SAME_AS_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: RM,
    file: 'src/views/repository-matcher/components/TableCells.tsx',
    line: 103,
    element: 'truncated table cell',
    trigger: `${HOVER_FOCUS} - only when the text is actually truncated`,
    copy: '{label}',
    source: 'the cell value from the NDE API',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/resource-sections/components/type-banner/index.tsx',
    line: 140,
    element: 'resource type banner',
    trigger: HOVER_FOCUS,
    copy: '{abstractTooltipLabel || descriptionTooltipLabel}',
    source: `${SCHEMA} - the abstract, falling back to the description`,
    resourceType: 'varies with the record',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'per-record',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/components/card/metadata-accordion/index.tsx',
    line: 158,
    element: 'metadata accordion tab',
    trigger: HOVER_FOCUS,
    copy: '{isDisabled ? `No ${label} data.` : description}',
    source: `template in JSX when empty, otherwise ${SCHEMA}`,
    resourceType: 'varies with the record',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/components/card/operating-systems/index.tsx',
    line: 17,
    element: 'operating system icon',
    trigger: HOVER_FOCUS,
    copy: '{`Operating system supported: ${item}`}',
    source: 'template in JSX + operatingSystem values from the NDE API',
    resourceType: 'ComputationalTool',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: AS,
    file: 'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx',
    line: 113,
    element: 'field type icon in the field picker',
    trigger: HOVER_FOCUS,
    copy: '{tooltipLabel}',
    source: "the field's type, mapped to a display word at FieldSelect:55-75",
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: AS,
    file: 'src/components/advanced-search/components/Search/components/SearchOptions/components/RadioItem.tsx',
    line: 11,
    element: 'search-type radio option',
    trigger: HOVER_FOCUS,
    copy: '{<>{description}<br/>{example}</>}',
    source:
      'src/components/advanced-search/components/Search/search-types-config.ts',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: OB,
    file: 'src/views/ontology-browser/components/ontology-browser-count-tag.tsx',
    line: 46,
    element: 'dataset count tag',
    trigger: HOVER_FOCUS,
    copy: '{tooltipLabel}',
    source:
      'getTooltipLabelByCountType() at ontology-browser-count-tag.tsx:11 - rich ' +
      'JSX, flattened to text here',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: OB,
    file: 'src/views/ontology-browser/components/tree/components/tree-node.tsx',
    line: 283,
    element: 'dataset count on a tree node',
    trigger: HOVER_FOCUS,
    copy: "{getTooltipLabelByCountType('termCount')}",
    source: 'getTooltipLabelByCountType() at ontology-browser-count-tag.tsx:11',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/checkbox.tsx',
    line: 162,
    element: 'filter checkbox label',
    trigger: HOVER_FOCUS,
    copy: '{getTooltipLabel(term, filterName)}',
    source: 'getTooltipLabel() at checkbox.tsx:22, over the filter names',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'pass-through',
  },
  {
    routes: uniq(['/repository-matcher', '/search']),
    file: 'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    line: 87,
    element: 'drag handle in the customise popover',
    trigger: HOVER_FOCUS,
    copy: '{dragTooltip}',
    source: CALLERS,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },

  // ------------------------------------------------- 3. schema-driven blocks
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/section.tsx',
    line: 69,
    element: 'filter section heading',
    trigger: HOVER_FOCUS,
    copy: '{description}',
    source: SCHEMA,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'schema',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata/components/block.tsx',
    line: 79,
    element: 'metadata block heading',
    trigger: HOVER_FOCUS,
    copy: '{tooltipLabel}',
    source: SCHEMA,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'schema',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata/components/tag.tsx',
    line: 22,
    element: 'metadata tag',
    trigger: HOVER_FOCUS,
    copy: '{tooltipLabel}',
    source: SCHEMA,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'schema',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/badges/components/BadgeWithTooltip.tsx',
    line: 20,
    element: 'metadata badge',
    trigger: HOVER_FOCUS,
    copy: '{tooltipLabel}',
    source: SCHEMA,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'schema',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/info-label/index.tsx',
    line: 20,
    element: 'InfoLabel text',
    trigger: HOVER_FOCUS,
    copy: '{tooltipText}',
    source: `${CALLERS}, mostly ${SCHEMA}`,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'schema',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/components/property-treemap-lists.tsx',
    line: 36,
    element: 'treemap section heading',
    trigger: HOVER_FOCUS,
    copy: '{tooltip}',
    source: SCHEMA,
    resourceType: 'Dataset',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'schema',
  },
  {
    routes: uniq([
      '/',
      '/repository-matcher',
      '/resources',
      '/saved',
      '/search',
    ]),
    file: 'src/components/table/components/cell.tsx',
    line: 132,
    element: 'truncated table cell',
    trigger: HOVER_FOCUS,
    copy: '{tooltip}',
    source: 'the column config of whichever table is rendering',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },

  // ----------------------------------------------- 4. native title (hover only)
  {
    routes: uniq(['/repository-matcher', '/search']),
    file: 'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    line: 111,
    element: 'Text (truncated item name)',
    trigger: HOVER_ONLY,
    copy: '{item.title}',
    source:
      'the filter name (customize-filters-popover.tsx:25) or column title; a ' +
      'native title attribute, so keyboard and touch users never see it',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },

  // ----------------------------------------------------- 5. hover reveals
  {
    routes: AS,
    file: 'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx',
    line: 99,
    element: 'field option row (expands the description)',
    trigger: HOVER_REVEAL,
    copy: '{description}',
    source: `${SCHEMA} - the abstract, falling back to the description`,
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'schema',
  },
  {
    routes: uniq(['/404', '/about', '/resources', '/search']),
    file: 'src/components/page-container/components/search/components/ai-toggle.tsx',
    line: 130,
    element: 'AI-assisted search info icon',
    trigger: HOVER_REVEAL,
    copy: '(popover body, see the component)',
    source: `${HARD} in the ai-toggle popover`,
    resourceType: '',
    alsoAccessibleName: DIFFERS('More information about AI-assisted search'),
    scope: 'shared (page-container search bar)',
    kind: 'literal',
  },
  {
    routes: AS,
    file: 'src/components/select/components/OptionItem.tsx',
    line: 29,
    element: 'select option (reveals its description)',
    trigger: HOVER_REVEAL,
    copy: '{description}',
    source: 'the option config of the consuming select',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'pass-through',
  },
  {
    routes: AS,
    file: 'src/components/dropdown-button/index.tsx',
    line: 74,
    element: 'dropdown button (opens its menu)',
    trigger: `${HOVER_REVEAL} - a MENU of actions, not informational text`,
    copy: '(no text revealed - opens a list of options)',
    source:
      'judgment call: recorded for completeness because it opens on hover, but ' +
      'it is not tooltip copy',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'literal',
  },

  // ------------------------------------------------------ 6. chart tooltips
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/date-filter/components/histogram.tsx',
    line: 233,
    element: 'histogram bar',
    trigger: CHART_HOVER,
    copy: '(hovered bucket: date range and count)',
    source: 'built from the hovered datum',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: CHART_ROUTES,
    file: 'src/components/visualizations/bar/index.tsx',
    line: 395,
    element: 'bar segment',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source:
      'summary/helpers.ts:60 builds `${label} (${count} resources)` from the ' +
      'hovered datum',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'per-record',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/visualizations/bar-chart.tsx',
    line: 324,
    element: 'bar segment',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source: 'built from the hovered datum (term + count from the NDE API)',
    resourceType: 'Dataset',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/visualizations/stacked-bar-chart.tsx',
    line: 224,
    element: 'stacked bar segment',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source: 'built from the hovered datum (term + count from the NDE API)',
    resourceType: 'Dataset',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/visualizations/donut-chart.tsx',
    line: 274,
    element: 'donut slice',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source: 'built from the hovered datum (term + count from the NDE API)',
    resourceType: 'Dataset',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/visualizations/treemap-chart.tsx',
    line: 322,
    element: 'treemap node',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source: 'built from the hovered datum (term + count from the NDE API)',
    resourceType: 'Dataset',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: SOURCES,
    file: 'src/components/metadata-compatibility-source-badge/components/badge.tsx',
    line: 315,
    element: 'badge segment',
    trigger: CHART_HOVER,
    copy: '{tooltipData}',
    source: 'built from the hovered badge segment',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'route-specific',
    kind: 'per-record',
  },
  {
    routes: RES_SEARCH,
    file: 'src/components/metadata-completeness-badge/Circular.tsx',
    line: 168,
    element: 'completeness ring',
    trigger: HOVER_FOCUS,
    copy: '{<TooltipContent … />}',
    source:
      "rich JSX built in Circular.tsx from the record's field coverage; the " +
      'fixed labels are "Fundamental fields" and "Recommended fields"',
    resourceType: 'varies with the record',
    alsoAccessibleName: NO_ARIA,
    scope: 'shared',
    kind: 'per-record',
  },
  {
    routes: NONE,
    file: 'src/components/visualizations/pie/index.tsx',
    line: 228,
    element: 'pie slice',
    trigger: CHART_HOVER,
    copy: '(NEVER RENDERS - component has no importer in src/)',
    source:
      'this component has no importer anywhere in src/, so the tooltip never ' +
      'renders',
    resourceType: '',
    alsoAccessibleName: NO_ARIA,
    scope: 'unused component',
    kind: 'literal',
  },
];

// ------------------------------------------------------------------ resolver
const resolver = createResolver<TooltipEntry>();
const { register, registerLiterals, rowsFor, valuesFor } = resolver;

// -------------------------------------------------------- schema descriptions
type SchemaMap = Record<
  string,
  { description?: Record<string, string>; abstract?: Record<string, string> }
>;
const schema = SCHEMA_DEFINITIONS as unknown as SchemaMap;

/**
 * Mirror of getMetadataDescription() in src/components/metadata/helpers.ts: with
 * a resource type, use that type's wording if present; otherwise fall back to
 * the first description on the property. Throws on an unknown property so a
 * rename fails loudly rather than emitting a blank cell.
 */
const describe = (property: string, type?: string) => {
  const entry = schema[property];
  if (!entry) {
    throw new Error(
      `property "${property}" is not in configs/schema-definitions.json - ` +
        'has it been renamed?',
    );
  }
  const description = entry.description;
  if (!description || !Object.keys(description).length) return null;
  if (type && description[type]) {
    return { text: description[type], typeKey: type, fallback: false };
  }
  const [firstKey, firstText] = Object.entries(description)[0];
  return { text: firstText, typeKey: firstKey, fallback: Boolean(type) };
};

/** The filter properties whose schema description becomes a filter tooltip. */
const FILTER_PROPERTIES = [
  'includedInDataCatalog',
  'sourceOrganization',
  'healthCondition',
  'infectiousAgent',
  'species',
  'funding',
  'conditionsOfAccess',
  'variableMeasured',
  'measurementTechnique',
  'topicCategory',
  'applicationCategory',
  'operatingSystem',
  'programmingLanguage',
];

/** Properties shown as metadata blocks/tags, per src/components/metadata. */
const SORT_ORDER = [
  'infectiousAgent',
  'species',
  'healthCondition',
  'measurementTechnique',
  'variableMeasured',
  'sample',
  'funding',
  'license',
  'usageInfo',
  'topicCategory',
];
const SORT_ORDER_COMPTOOL = [
  'input',
  'featureList',
  'output',
  'availableOnDevice',
  'softwareRequirements',
  'softwareHelp',
  'funding',
  'license',
  'softwareVersion',
];
const RESOURCE_TYPES = [
  'Dataset',
  'ComputationalTool',
  'ResourceCatalog',
  'Sample',
  'DataCollection',
];

/**
 * The label the app shows for a property, read from the same config the app
 * reads (getMetadataName in src/components/metadata/helpers.ts returns
 * `schema[property].name`). This is what makes the visible text on a
 * schema-driven row line up with its own description rather than a neighbour's.
 */
const displayName = (property: string) =>
  (schema as any)[property]?.name || property;

const schemaValues = (
  properties: string[],
  types: (string | undefined)[],
  /** Prefix for the visible label, e.g. an ⓘ icon annotating it. */
  visibleFor: (label: string) => string = label => label,
): Resolved[] => {
  const out: Resolved[] = [];
  for (const property of properties) {
    for (const type of types) {
      const found = describe(property, type);
      if (!found) continue;
      out.push({
        copy: found.text,
        visible: visibleFor(displayName(property)),
        source:
          `configs/schema-definitions.json -> ${property}.description` +
          `.${found.typeKey}` +
          (found.fallback
            ? ` (no ${type} wording; falls back to ${found.typeKey})`
            : ''),
      });
    }
  }
  return out;
};

const registerSchemaValues = () => {
  // Filter headings call getMetadataDescription with no type, so they always
  // show the first description on the property.
  register(
    'src/views/search/components/filters/components/section.tsx',
    69,
    schemaValues(FILTER_PROPERTIES, [undefined]),
  );
  // Metadata blocks/tags/badges pass the record's resource type through. Each
  // carries its own visible label, so the property name and its description
  // stay on the same row.
  const metaProps = uniq([...SORT_ORDER, ...SORT_ORDER_COMPTOOL]);
  register(
    'src/components/metadata/components/block.tsx',
    79,
    schemaValues(metaProps, RESOURCE_TYPES, n => BESIDE(n, 'ⓘ info')),
  );
  register(
    'src/components/metadata/components/tag.tsx',
    22,
    schemaValues(metaProps, RESOURCE_TYPES, n => `${n} | <value>`),
  );
  register(
    'src/components/badges/components/BadgeWithTooltip.tsx',
    20,
    schemaValues(metaProps, RESOURCE_TYPES, n => `${n} (badge value)`),
  );
  register(
    'src/components/info-label/index.tsx',
    20,
    schemaValues(metaProps, RESOURCE_TYPES, n => `${n}, followed by an ⓘ icon`),
  );
  register(
    'src/views/diseases/disease/components/property-treemap-lists.tsx',
    36,
    schemaValues(
      ['healthCondition', 'measurementTechnique', 'infectiousAgent'],
      ['Dataset'],
      n => BESIDE(n, 'ⓘ info'),
    ),
  );
  // The advanced-search field picker reveals the same descriptions on hover.
  register(
    'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx',
    99,
    schemaValues(FILTER_PROPERTIES, [undefined]),
  );
};

// ------------------------------------------------- other resolvable values
const registerStaticValues = () => {
  const F = 'src/views/search/components/filters/components';
  const FILTER_NAMES = [
    'Date',
    'Sources',
    'Program Collection',
    'Health Condition',
    'Pathogen Species',
    'Host Species',
    'Funding',
    'Conditions of Access',
    'Variable Measured',
    'Measurement Technique',
  ];

  registerLiterals(
    `${F}/section.tsx`,
    90,
    FILTER_NAMES.flatMap(n => [
      `Add ${n} visualisation chart`,
      `Remove ${n} visualisation chart`,
    ]),
    'template in JSX + the filter names in filters/config.ts',
  );
  registerLiterals(
    `${F}/checkbox.tsx`,
    162,
    FILTER_NAMES.flatMap(n => [
      `${n} not specified, missing, or unavailable.`,
      `One or more ${n.toLowerCase()} is specified, found, or available.`,
    ]),
    'getTooltipLabel() at checkbox.tsx:22 + the filter names in filters/config.ts',
  );
  registerLiterals(
    'src/views/ontology-browser/components/ontology-browser-count-tag.tsx',
    46,
    [
      'Number of datasets for this term in the NIAID Discovery Portal',
      'Number of datasets for this term and sub-terms in the NIAID Discovery Portal',
    ],
    'getTooltipLabelByCountType() branches, flattened from rich JSX',
  );
  registerLiterals(
    'src/views/ontology-browser/components/tree/components/tree-node.tsx',
    283,
    ['Number of datasets for this term in the NIAID Discovery Portal'],
    "getTooltipLabelByCountType('termCount'), flattened from rich JSX",
  );
  registerLiterals(
    'src/views/ontology-browser/components/ontology-search-list/toggle.tsx',
    20,
    ['Expand list of selected search terms'],
    'default value of the label prop at toggle.tsx:9',
  );
  registerLiterals(
    'src/components/bookmark-buttons/icon-button.tsx',
    15,
    [
      'Save query',
      'Remove saved query',
      'Save this search',
      'Remove search from saved searches',
    ],
    'literal passed by saved/table-config.tsx:93 and search-results-header:108',
  );
  registerLiterals(
    'src/components/copy-button/index.tsx',
    46,
    [
      'Copy',
      'Metadata copied!',
      'Copy Resource ID',
      'Resource ID Copied!',
      'Copy NCTID',
      'NCTID Copied!',
      'Copy DOI',
    ],
    'literal passed as buttonText/copiedText by the resource header and json-viewer',
  );
  registerLiterals(
    'src/components/advanced-search/components/Search/components/FieldSelect/index.tsx',
    113,
    ['text', 'keyword', 'number', 'boolean', 'date', 'object', 'nested'],
    "the field's type from the API field list, mapped at FieldSelect:55-75",
  );
  registerLiterals(
    'src/components/advanced-search/components/Search/components/SearchOptions/components/RadioItem.tsx',
    11,
    [
      'Matches where selected field has a value.',
      'Matches where selected field has no set value.',
      'Contains this term or phrase',
      'Contains the exact term or phrase.',
      'Field contains value that starts with given term.',
    ],
    'the description/example pairs in advanced-search/Search/search-types-config.ts',
  );
  registerLiterals(
    'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    111,
    FILTER_NAMES,
    'item.title - the filter name (customize-filters-popover.tsx:25)',
  );
  registerLiterals(
    'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    87,
    ['Drag to reorder'],
    'the dragTooltip prop passed by the customise popovers',
  );
  registerLiterals(
    'src/components/table/components/cell.tsx',
    132,
    [
      'Sort by relevancy (field name is boosted).',
      'Sort by least recent activity (created, published or modified).',
      'Sort by most recent activity (created, published or modified).',
      'Sort in alphabetical order (title).',
      'Sort in reverse alphabetical order (title).',
    ],
    'the column/sort configs, e.g. src/views/search/config/defaultQuery.ts:10-38',
  );
  registerLiterals(
    'src/components/metadata-completeness-badge/Circular.tsx',
    168,
    ['Fundamental fields', 'Recommended fields'],
    'the fixed section labels inside the TooltipContent JSX',
  );
  registerLiterals(
    'src/components/page-container/components/search/components/ai-toggle.tsx',
    130,
    ['(popover body - see ai-toggle.tsx)'],
    'hardcoded in the ai-toggle popover',
  );
};

// --------------------------------------------- sampled per-record examples
const registerSampledExamples = async () => {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    throw new Error(
      'NEXT_PUBLIC_API_URL must be set - run this via `yarn generate-tooltip-audit`',
    );
  }
  const example = (copy: string, source: string): Resolved => ({
    copy,
    source: `${source} - illustrative: the interpolated part varies per record`,
    retrieved: TODAY,
    isExample: true,
  });

  // A real term + count pair, so the chart tooltips show the true sentence.
  const facets = await getJson(
    `${api}/query?q=__all__&size=0&facet_size=3` +
      `&facets=healthCondition.name,infectiousAgent.displayName`,
  );
  const pick = (name: string) =>
    facets?.facets?.[name]?.terms?.[0] as { term: string; count: number };
  const condition = pick('healthCondition.name');
  const agent = pick('infectiousAgent.displayName');
  const asText = (t?: { term: string; count: number }) =>
    t ? `${t.term} (${t.count.toLocaleString()} resources)` : null;

  const chartSites: [string, number][] = [
    ['src/components/visualizations/bar/index.tsx', 395],
    ['src/views/diseases/disease/visualizations/bar-chart.tsx', 324],
    ['src/views/diseases/disease/visualizations/stacked-bar-chart.tsx', 224],
    ['src/views/diseases/disease/visualizations/donut-chart.tsx', 274],
    ['src/views/diseases/disease/visualizations/treemap-chart.tsx', 322],
  ];
  const chartText = asText(condition) ?? asText(agent);
  if (chartText) {
    for (const [file, line] of chartSites) {
      register(file, line, [
        example(chartText, 'built from the hovered datum'),
      ]);
    }
  }

  register(
    'src/views/search/components/results-list/components/card/operating-systems/index.tsx',
    17,
    [
      example(
        'Operating system supported: Linux',
        'template in JSX + operatingSystem from the NDE API',
      ),
    ],
  );
  if (condition) {
    register('src/views/repository-matcher/components/TableCells.tsx', 103, [
      example(condition.term, 'the cell value from the NDE API'),
    ]);
  }
  register(
    'src/views/search/components/filters/components/date-filter/components/histogram.tsx',
    233,
    [example('2019 (12,345 resources)', 'built from the hovered date bucket')],
  );
  register(
    'src/components/metadata-compatibility-source-badge/components/badge.tsx',
    315,
    [
      example(
        'Recommended fields: 62% coverage',
        'built from the hovered badge segment',
      ),
    ],
  );
  register(
    'src/components/resource-sections/components/type-banner/index.tsx',
    140,
    [
      example(
        describe('@type', 'Dataset')?.text ?? 'Dataset',
        "the abstract/description for the record's @type",
      ),
    ],
  );
  register(
    'src/views/search/components/results-list/components/card/metadata-accordion/index.tsx',
    158,
    [
      example(
        'No funding data.',
        'template in JSX when the property is empty; otherwise the schema description',
      ),
    ],
  );
  register('src/components/select/components/OptionItem.tsx', 29, [
    example(
      'Contains the exact term or phrase.',
      'the option config of the consuming select',
    ),
  ]);
};

// ------------------------------------------------------------------- writing
const write = async () => {
  const file = path.join(OUT_DIR, OUT_FILE);
  let out = csvLine([
    'route',
    'file path',
    'line',
    'UI element hovered',
    'trigger',
    'visible text',
    'tooltip text',
    'relationship',
    'source of the tooltip text',
    'resource type',
    'also the accessible name?',
    'scope',
    'value kind',
    'retrieved',
  ]);
  let count = 0;
  for (const r of rows) {
    for (const route of r.routes) {
      const site = VISIBLE_TEXT[`${r.file}:${r.line}`];
      for (const v of capped(valuesFor(r, route, 'tooltip'))) {
        // A paired value carries its own visible text (a filter's name beside
        // that filter's description); otherwise fall back to the site default.
        const visible = v?.visible ?? site?.text ?? '(not determined)';
        const tooltip = v ? v.copy : r.copy;
        out += csvLine([
          route,
          r.file,
          r.line,
          r.element,
          r.trigger,
          visible,
          tooltip,
          v?.isSummary
            ? 'n/a - summary row'
            : relationshipOf(visible, tooltip, site?.truncated),
          v?.source ?? r.source,
          v?.source?.includes('.description.')
            ? v.source.split('.description.')[1].split(' ')[0]
            : r.resourceType,
          r.alsoAccessibleName,
          r.scope,
          suffix(v, v ? 'value' : /\{/.test(r.copy) ? 'expression' : 'literal'),
          v?.retrieved ?? '',
        ]);
        count++;
      }
    }
  }
  await fs.writeFile(file, out);
  console.log(`${file}: ${count} rows`);
};

// Main execution
const main = async () => {
  try {
    console.log('Generating tooltip audit spreadsheet...');
    await fs.mkdir(OUT_DIR, { recursive: true });
    registerStaticValues();
    registerSchemaValues();
    await registerSampledExamples();
    resolver.index(rows);
    resolver.assertNoSharedKeys(rows);
    await write();
    console.log(`resolved ${resolver.size()} of ${countSites(rows)} sites`);
    console.log(`distinct tooltip sites: ${countSites(rows)}`);
  } catch (err: any) {
    console.error('Failed to generate the tooltip audit:', err.message);
    process.exit(1);
  }
};

main();
