import fs from 'fs/promises';
import path from 'path';
import {
  ALL,
  AS,
  BaseEntry,
  CAP,
  DS,
  HARD,
  HOME,
  KC,
  NONE,
  RES,
  Resolved,
  SAVED,
  SB,
  SBKC,
  SEARCH,
  TABLE,
  TODAY,
  TOC,
  basename,
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
 * Generates the alt-text and accessible-name audit spreadsheets.
 *
 * Run with `yarn generate-a11y-audit`, which loads .env.production so the fetch
 * step below hits the production Strapi and NDE API.
 *
 * The inventory is hand-maintained, not parsed: the file/line/copy of every
 * `alt=`, `aria-label`, `aria-labelledby` and inline-SVG `<title>` in `src/` is
 * recorded below, along with the routes that render it. The script then does two
 * things with it:
 *
 *  1. Resolves expressions to real strings. An entry whose copy is `{ariaLabel}`
 *     or `{icon.alternativeText}` is not reviewable as copy, so its real values
 *     are registered against it — from the repo for conditionals and prop
 *     pass-throughs, and from Strapi / the NDE API for everything data-driven.
 *     Values that are genuinely per-record (a resource name, an ontology term)
 *     get one marked example instead. Sites with many values are capped at CAP
 *     and followed by a summary row, so nothing is silently truncated.
 *  2. Cross-joins each entry against its routes, so shared and global chrome
 *     appears once per route without hand-copying rows.
 *
 * When you add or move one of those attributes, update the matching entry here.
 * The safety net is the count this prints on every run: the number of distinct
 * (file, line) pairs must equal a grep of `src/` — 24 for alt, 144 for aria at
 * the time of writing. Resolving values adds rows, never sites.
 */

const OUT_DIR = 'docs/accessibility';

// ------------------------------------------------- audit-specific route sets
// The shared sets (ALL, HOME, KC, SB, TABLE, ...) come from ./lib/audit-csv.
const OB = ['/ontology-browser', '/search']; // also mounted in the /search popup
const SEARCH_INPUT = uniq([
  ...TOC,
  '/',
  '/repository-matcher',
  '/saved',
  '/search',
  ...KC,
]);
const ICON = ['/diseases/[slug]', '/resources', '/search'];
const EMPTY = uniq([
  '/faq',
  '/features',
  '/resources',
  '/search',
  '/updates',
  ...KC,
]);
const CAROUSEL = ['/', '/search'];
const IWD = uniq([...SBKC, '/advanced-search', '/ontology-browser']);
const SELECT = ['/advanced-search', '/repository-matcher', '/search'];
const SAOP = ['/repository-matcher', '/search'];
// /resources uses BookmarkButton (bookmark-buttons/button), a different
// component, so the icon variant is only on these two routes.
const BOOKMARK = ['/saved', '/search'];

const NODES_ALT =
  'A complex network of interconnected lines and nodes, resembling a molecular ' +
  'or neural network structure. The image features various shades of blue and ' +
  'white, with nodes of different sizes connected by thin lines, creating a ' +
  'web-like pattern.';
const HEX_ALT =
  'An abstract graphic featuring three hexagons. The top-right hexagon shows a ' +
  'person typing on a keyboard with a microscope in the background, symbolizing ' +
  'a blend of technology and science.';
const DOCTOR_ALT =
  'The image shows a healthcare professional, likely a doctor, wearing a white ' +
  'coat and stethoscope, interacting with a digital interface. The interface ' +
  'displays various health-related icons, such as a heart, a DNA helix, a ' +
  'medical cross, a microscope, a pill, an apple, and a syringe, representing ' +
  'different aspects of healthcare and medical research. The doctor is pointing ' +
  'at the heart icon, indicating a focus on heart health or medical diagnostics.';

// ------------------------------------------------------------- alt inventory
interface AltEntry {
  routes: string[];
  file: string;
  line: number;
  /** Literal path, or the expression plus the shape it resolves to. */
  image: string;
  /** The exact string, or the expression when the value is supplied elsewhere. */
  copy: string;
  /** Where the copy is authored — often NOT `file`. */
  source: string;
  scope: string;
  altType: string;
  /**
   * Overrides the `file:line` key used to look up resolved values, so one
   * source site can carry different value sets for different route families
   * (the MDX handler renders both Knowledge Center and Features markdown).
   */
  valueKey?: string;
}

const LOGO = 'src/components/logos/nde-logo.tsx';
const GLOBAL_LOGO = 'global (nav bar + footer)';
const LIC_FILE =
  'src/components/resource-sections/components/sidebar/components/external/' +
  'components/license.tsx';

const altRows: AltEntry[] = [
  // The three responsive logo variants are all in the DOM at once, toggled by
  // CSS breakpoints, and `Logo` is rendered by both the nav bar and the footer.
  {
    routes: ALL,
    file: LOGO,
    line: 12,
    image: '/assets/logos/niaid-nde-desktop.svg',
    copy: 'NDE Desktop Logo',
    source: HARD,
    scope: GLOBAL_LOGO,
    altType: 'literal',
  },
  {
    routes: ALL,
    file: LOGO,
    line: 21,
    image: '/assets/logos/niaid-nde-mobile-preferred.svg',
    copy: 'NDE Mobile Logo',
    source: HARD,
    scope: GLOBAL_LOGO,
    altType: 'literal',
  },
  {
    routes: ALL,
    file: LOGO,
    line: 30,
    image: '/assets/logos/niaid-nde-mobile-vertical.svg',
    copy: 'NDE Mobile Vertical Logo',
    source: HARD,
    scope: GLOBAL_LOGO,
    altType: 'literal',
  },
  // The MDX img handler renders markdown from several content types. Split by
  // route family so each set of real values lands on the routes that show it.
  {
    routes: KC,
    file: 'src/components/mdx/components/index.tsx',
    line: 376,
    image:
      '{src} - Strapi /uploads path prefixed with NEXT_PUBLIC_STRAPI_API_URL',
    copy: "{props.alt || ''} - author-supplied markdown alt, empty-string fallback",
    source: 'Strapi CMS - docs markdown image alt (author-supplied)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
    valueKey: 'mdx-img-docs',
  },
  {
    routes: ['/features/[slug]'],
    file: 'src/components/mdx/components/index.tsx',
    line: 376,
    image:
      '{src} - Strapi /uploads path prefixed with NEXT_PUBLIC_STRAPI_API_URL',
    copy: "{props.alt || ''} - author-supplied markdown alt, empty-string fallback",
    source: 'Strapi CMS - features markdown image alt (author-supplied)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
    valueKey: 'mdx-img-features',
  },
  {
    routes: ALL,
    file: 'src/components/mdx/components/index.tsx',
    line: 376,
    image:
      '{src} - Strapi /uploads path prefixed with NEXT_PUBLIC_STRAPI_API_URL',
    copy: "{props.alt || ''} - author-supplied markdown alt, empty-string fallback",
    source:
      'Strapi CMS - any other markdown rendered through this handler, including ' +
      'the page-container banner, which is why this row is global',
    scope: 'global (any Strapi markdown, incl. page-container banner)',
    altType: 'dynamic-cms',
    valueKey: 'mdx-img-other',
  },

  {
    routes: HOME,
    file: 'src/views/home/components/HeroBanner.tsx',
    line: 36,
    image: '/assets/homepage/ecosystem-hero-nodes.png',
    copy: NODES_ALT,
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },
  {
    routes: HOME,
    file: 'src/views/home/components/HeroBanner.tsx',
    line: 60,
    image: '/assets/homepage/ecosystem-hero-hexagons-02.png',
    copy: HEX_ALT,
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },
  {
    routes: HOME,
    file: 'src/pages/index.tsx',
    line: 200,
    image: '/assets/homepage/getting-started.png',
    copy: DOCTOR_ALT,
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },
  {
    routes: KC,
    file: 'src/views/docs/components/HeroBanner.tsx',
    line: 27,
    image: '/assets/homepage/ecosystem-hero-nodes.png',
    copy: NODES_ALT,
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },
  {
    routes: ['/login'],
    file: 'src/pages/login.tsx',
    line: 115,
    image: '/assets/homepage/ecosystem-hero-nodes.png',
    copy: '',
    source: HARD + " (alt='' paired with aria-hidden='true')",
    scope: 'route-specific',
    altType: 'empty-decorative',
  },
  {
    routes: ['/login'],
    file: 'src/pages/login.tsx',
    line: 215,
    image: '/assets/logos/niaid-nde-desktop-color.svg',
    copy: 'NIAID Data Ecosystem',
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },
  {
    routes: ['/404'],
    file: 'src/pages/404.tsx',
    line: 24,
    image: '/assets/404.webp',
    copy: '404: Page Not Found',
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },

  {
    routes: HOME,
    file: 'src/views/home/components/LandingPageCards/Card.tsx',
    line: 33,
    image: '/assets/homepage/influenza-a-virus-h1n1.png',
    copy:
      'Microscopic view of the influenza A virus, a key focus in infectious ' +
      'disease research and vaccine development.',
    source:
      'src/views/home/components/LandingPageCards/data.tsx:8-9 (imageAlt)',
    scope: 'route-specific',
    altType: 'dynamic-config',
  },
  {
    routes: HOME,
    file: 'src/views/home/components/LandingPageCards/Card.tsx',
    line: 33,
    image: '/assets/homepage/student-scrubs-green.png',
    copy: 'Group of biomedical researchers collaborating in a laboratory setting.',
    source:
      'src/views/home/components/LandingPageCards/data.tsx:32-33 (imageAlt)',
    scope: 'route-specific',
    altType: 'dynamic-config',
  },

  {
    routes: HOME,
    file: 'src/views/home/components/NewsCarousel.tsx',
    line: 173,
    image:
      '{image} - Strapi image url, falls back to /assets/news-thumbnail.png',
    copy: '{image_alt_text}',
    source:
      'Strapi CMS - news image.alternativeText; fallback ' +
      "'News Thumbnail Image' at NewsCarousel.tsx:138-142 (applies only when " +
      'image is absent)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },

  {
    routes: ['/search', '/resources'],
    file: 'src/components/source-logo/index.tsx',
    line: 84,
    image:
      '{logo} - /assets/resources/<slug>.png via source-logo/helpers.ts:5-18',
    copy: 'Click to open the source (${source.name}) in a new tab.',
    source:
      'src/components/source-logo/index.tsx:84 (template) + source.name from ' +
      'NDE API',
    scope: 'shared',
    altType: 'dynamic-config',
  },
  {
    routes: ['/search', '/resources'],
    file: 'src/components/source-logo/index.tsx',
    line: 96,
    image:
      '{logo} - /assets/resources/<slug>.png via source-logo/helpers.ts:5-18',
    copy: 'Logo for ${source.name}',
    source:
      'src/components/source-logo/index.tsx:96 (template) + source.name from ' +
      'NDE API',
    scope: 'shared',
    altType: 'dynamic-config',
  },

  {
    routes: RES,
    file: 'src/components/resource-sections/components/authors/index.tsx',
    line: 73,
    image: 'https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png',
    copy: 'ORCID logo',
    source: HARD,
    scope: 'route-specific',
    altType: 'literal',
  },

  {
    routes: ['/features'],
    file: 'src/components/table-of-contents/components/card.tsx',
    line: 89,
    image:
      '{thumbnail.url} - Strapi url prefixed with NEXT_PUBLIC_STRAPI_API_URL',
    copy: '{thumbnail.alternativeText}',
    source:
      'Strapi CMS - features.thumbnail.alternativeText; guarded with ' +
      "|| '' at src/views/features/components/TableOfContents.tsx:99-100",
    scope: 'shared',
    altType: 'dynamic-cms',
  },
  {
    routes: KC,
    file: 'src/views/integration/components/Card.tsx',
    line: 106,
    image: '${NEXT_PUBLIC_STRAPI_API_URL}${icon.url}',
    copy: '{icon.alternativeText}',
    source: 'Strapi CMS - integration card icon.alternativeText (no fallback)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },
  {
    routes: KC,
    file: 'src/views/integration/components/Blocks.tsx',
    line: 83,
    image: '${NEXT_PUBLIC_STRAPI_API_URL}${image.url}',
    copy: '{image.alternativeText}',
    source:
      'Strapi CMS - integration block image.alternativeText (no fallback)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/components/external-links.tsx',
    line: 28,
    image: '${NEXT_PUBLIC_STRAPI_API_URL}${image.url}',
    copy: '{image.alternativeText}',
    source:
      'Strapi CMS - disease externalLinks[].image.alternativeText (no fallback)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },
  {
    routes: DS,
    file: 'src/views/diseases/disease/layouts/intro.tsx',
    line: 99,
    image: '${NEXT_PUBLIC_STRAPI_API_URL}${image.url}',
    copy: '{image.alternativeText}',
    source: 'Strapi CMS - disease hero image.alternativeText (no fallback)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },
  {
    routes: ['/diseases'],
    file: 'src/views/diseases/toc/index.tsx',
    line: 170,
    image: '${NEXT_PUBLIC_STRAPI_API_URL}${page.image.url}',
    copy: '{page.image.alternativeText}',
    source: 'Strapi CMS - disease page image.alternativeText (no fallback)',
    scope: 'route-specific',
    altType: 'dynamic-cms',
  },
];

// The news carousel's real alt strings come from Strapi and are attached at run
// time by registerFetchedValues() below, keyed on NewsCarousel.tsx:173. The one
// string that lives in code is the fallback, which really does ship: it was
// serving 2 of the 10 live carousel cards when this was written.
altRows.push({
  routes: HOME,
  file: 'src/views/home/components/NewsCarousel.tsx',
  line: 173,
  image: '/assets/news-thumbnail.png',
  copy: 'News Thumbnail Image',
  source:
    'hardcoded fallback at NewsCarousel.tsx:138-142, used when a news record ' +
    'has no image at all',
  scope: 'route-specific',
  altType: 'literal (fallback)',
  // Distinct key so this row keeps its own literal instead of inheriting the
  // CMS values registered against NewsCarousel.tsx:173.
  valueKey: 'news-carousel-fallback',
});

// License variants: the alt text is a by-product of the license `type` string,
// so editing it also changes the displayed license label.
const LICENSES: [string, string][] = [
  ['Attribution', '/assets/copyright/by.png'],
  ['Attribution-ShareAlike', '/assets/copyright/by-sa.png'],
  ['Attribution-NoDerivs', '/assets/copyright/by-nd.png'],
  ['Attribution-NonCommercial', '/assets/copyright/by-nc.png'],
  ['Attribution-NonCommercial-ShareAlike', '/assets/copyright/by-nc-sa.png'],
  ['Attribution-NonCommercial-NoDerivs', '/assets/copyright/by-nc-nd.png'],
  ['Public Domain', '/assets/copyright/by-p.png'],
  ['Harvard Dataverse', '/assets/resources/dataverse-icon.png'],
  ['(fallback) the raw license URL is used verbatim as alt', ''],
];

for (const [type, img] of LICENSES) {
  altRows.push({
    routes: RES,
    file: LIC_FILE,
    line: 40,
    image: img,
    copy: type,
    source:
      'src/utils/helpers.ts formatLicense() -> type (line 45-88); editing it ' +
      'also changes the displayed license label',
    scope: 'route-specific',
    altType: 'dynamic-config',
  });
  altRows.push({
    routes: ['/resources', '/search'],
    file: 'src/components/metadata/components/content.tsx',
    line: 43,
    image: img,
    copy: type,
    source:
      'src/utils/helpers.ts formatLicense() -> type, passed through ' +
      'src/components/metadata/helpers.ts:514 as {src, alt}',
    scope: 'shared',
    altType: 'dynamic-config',
  });
}

// ------------------------------------------------- accessible-name inventory
interface AriaEntry {
  routes: string[];
  file: string;
  line: number;
  element: string;
  attribute: 'aria-label' | 'aria-labelledby' | 'svg-title';
  copy: string;
  source: string;
  scope: string;
  /** See AltEntry.valueKey. */
  valueKey?: string;
  /**
   * Callers this site's accessible name comes from, as `file:line` pairs that
   * must exist elsewhere in this inventory.
   *
   * A shared component has different real values on different routes — a Table
   * is 'Repository matcher table' on /repository-matcher but one of the four
   * result-table labels on /search. Naming the callers lets the writer resolve
   * the value per route instead of repeating every caller's literal everywhere.
   * Resolution is transitive, so a caller that is itself a pass-through is
   * followed through to the literal.
   */
  derivesFrom?: { file: string; line: number }[];
}

const L = 'aria-label';
const LB = 'aria-labelledby';
const T = 'svg-title';

const NAV = 'src/components/navigation-bar/components';
const ADV = 'src/components/advanced-search/components';
const RS = 'src/components/resource-sections/components';
const DOCS = 'src/views/docs/components';
const SRL = 'src/views/search/components/results-list/components';
const VIZ = 'src/views/diseases/disease/visualizations';
const OBT = 'src/views/ontology-browser/components';

const UNUSED_COMPONENT =
  'this component has no importer anywhere in src/, so the label never renders';

const TREE_ACTIONS = `${ADV}/SortableWithCombine/components/TreeItem/components/TreeItemActions.tsx`;
const CARD_HEADER =
  'src/views/search/components/summary/components/visualization-card/card-header.tsx';
const PAGE_SEARCH_INPUT =
  'src/components/page-container/components/search/components/input.tsx';
const DOCS_SEARCH_BAR = `${DOCS}/search-bar/SearchBar.tsx`;

/** The four result tables that hand `ResultsTable` its ariaLabel. */
const RESULT_TABLE_SITES = from(
  [`${SRL}/dataset-results-table/index.tsx`, 415],
  [`${SRL}/computational-tool-results-table/index.tsx`, 353],
  [`${SRL}/sample-results-table/index.tsx`, 524],
  [`${SRL}/data-collection-results-table/index.tsx`, 342],
);

/**
 * Everywhere a `Table` is handed an ariaLabel. `results-table` is itself a
 * pass-through, so /search resolves through it to the four result-table labels.
 */
const TABLE_CALLER_SITES = from(
  [`${SRL}/results-table/index.tsx`, 86],
  [`${RS}/files-table/index.tsx`, 24],
  [`${RS}/samples/components/SampleTable/index.tsx`, 39],
  ['src/pages/repository-matcher.tsx', 419],
  ['src/pages/index.tsx', 265],
  ['src/views/saved/components/saved-table-section.tsx', 193],
);

const DROPDOWN_CALLER_SITES = from(
  [`${ADV}/Search/components/SearchInput/components/TextInput.tsx`, 59],
  [`${ADV}/Search/components/SearchInput/components/InputSubmitButton.tsx`, 47],
  [
    `${ADV}/SortableWithCombine/components/TreeItem/components/UnionButton.tsx`,
    26,
  ],
);

const SEARCH_BAR_CALLER_SITES = from(
  [PAGE_SEARCH_INPUT, 24],
  [DOCS_SEARCH_BAR, 280],
);

const KC_SLUG_PAGE = 'src/pages/knowledge-center/[[...slug]].tsx';

const PAGINATION = 'src/components/table/components/pagination.tsx';
/** The four page-nav buttons that supply pagination.tsx's shared IconButton. */
const PAGE_NAV_BUTTON_SITES = from(
  [PAGINATION, 158],
  [PAGINATION, 164],
  [PAGINATION, 189],
  [PAGINATION, 195],
);

const FEATURES_TOC = 'src/views/features/components/TableOfContents.tsx';
const DISEASES_TOC = 'src/views/diseases/toc/index.tsx';
/** One caller per table-of-contents route, so each route resolves to one name. */
const TOC_SIDEBAR_SITES = from(
  [FEATURES_TOC, 44],
  [DISEASES_TOC, 80],
  ['src/pages/sources.tsx', 152],
  ['src/pages/program-collections.tsx', 108],
);
const TOC_SEARCH_SITES = from(
  [FEATURES_TOC, 74],
  [DISEASES_TOC, 110],
  ['src/views/sources/components/main.tsx', 113],
  ['src/pages/program-collections.tsx', 149],
);

const BOOKMARK_CALLER_SITES = from(
  ['src/views/saved/table-config.tsx', 93],
  ['src/views/search/components/search-results-header/index.tsx', 108],
);

const RESULTS_LIST = 'src/views/search/components/results-list/index.tsx';
const SEARCH_PAGINATION_SITES = from([RESULTS_LIST, 473], [RESULTS_LIST, 566]);

const SB_KC_CALLERS =
  "caller-supplied: 'Search for resources' (page-container input.tsx:18 " +
  "default) / 'Search Knowledge Center' " +
  '(src/pages/knowledge-center/[[...slug]].tsx:140)';
const KC_CALLER =
  "caller-supplied: 'Search Knowledge Center' " +
  '(src/pages/knowledge-center/[[...slug]].tsx:140)';
const DROPDOWN_CALLERS =
  "caller-supplied: 'Add' / 'Submit button' / 'union between query elements'";
const TABLE_CALLERS =
  'caller-supplied - see the concrete literals at the call sites listed ' +
  'below in this file';
const BRUSH_HELP =
  'Use the arrow keys to move the brush selection. Press Tab to toggle the ' +
  'brush handles.';
const PIE_UNUSED =
  'caller-supplied label - NOTE: this component has no importer anywhere in ' +
  'src/, so this string never renders';

const ariaRows: AriaEntry[] = [
  // ---- global chrome
  {
    routes: ALL,
    file: `${NAV}/nav-layout.tsx`,
    line: 28,
    element: "Flex as='nav'",
    attribute: L,
    copy: 'Main navigation',
    source: HARD,
    scope: 'global (nav bar)',
  },
  {
    routes: ALL,
    file: `${NAV}/nav-layout.tsx`,
    line: 63,
    element: 'IconButton (menu toggle)',
    attribute: L,
    copy: "{isOpen ? 'Close navigation menu' : 'Open navigation menu'}",
    source: HARD,
    scope: 'global (nav bar)',
  },
  {
    routes: ALL,
    file: `${NAV}/nav-dropdown-item.tsx`,
    line: 63,
    element: 'Icon (external link)',
    attribute: L,
    copy: 'Opens in new tab',
    source: HARD,
    scope: 'global (nav bar)',
  },
  {
    routes: ALL,
    file: `${NAV}/nav-dropdown-item.tsx`,
    line: 129,
    element: 'dropdown toggle Button',
    attribute: L,
    copy: "{`${isOpen ? 'Close' : 'Open'} ${label} dropdown`}",
    source:
      'template hardcoded in JSX + label from configs/site.config.json navigation',
    scope: 'global (nav bar)',
  },
  {
    routes: ALL,
    file: 'src/components/page-container/components/login-error-banner.tsx',
    line: 60,
    element: 'CloseButton',
    attribute: L,
    copy: 'Dismiss login error',
    source: HARD,
    scope: 'global (page container)',
  },
  // Same split as the MDX img handler: markdown whose "image" is a .webm/.mp4
  // renders a <video> and the markdown alt is re-routed onto its aria-label.
  {
    routes: KC,
    file: 'src/components/mdx/components/index.tsx',
    line: 363,
    element: "Box as='video'",
    attribute: L,
    copy: '{alt || undefined}',
    source:
      'Strapi CMS - docs markdown alt re-routed onto the video element (mdx/components/index.tsx:354)',
    scope: 'route-specific',
    valueKey: 'mdx-video-docs',
  },
  {
    routes: ['/features/[slug]'],
    file: 'src/components/mdx/components/index.tsx',
    line: 363,
    element: "Box as='video'",
    attribute: L,
    copy: '{alt || undefined}',
    source:
      'Strapi CMS - features markdown alt re-routed onto the video element (mdx/components/index.tsx:354)',
    scope: 'route-specific',
    valueKey: 'mdx-video-features',
  },

  // ---- page-container search bar
  {
    routes: SB,
    file: 'src/components/page-container/components/search/components/ai-toggle.tsx',
    line: 129,
    element: 'IconButton',
    attribute: L,
    copy: 'More information about AI-assisted search',
    source: HARD,
    scope: 'shared (page-container search bar)',
  },
  {
    routes: SB,
    file: 'src/components/page-container/components/search/components/input.tsx',
    line: 24,
    element: 'SearchWithDropdown.Input (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "default value 'Search for resources' set at input.tsx:18; flows to src/components/search-bar/index.tsx:63,77",
    scope: 'shared (page-container search bar)',
  },

  // ---- search bar
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 63,
    element: 'Input',
    attribute: L,
    copy: '{inputProps.ariaLabel}',
    source: SB_KC_CALLERS,
    scope: 'shared',
    derivesFrom: SEARCH_BAR_CALLER_SITES,
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 77,
    element: 'Input (secondary)',
    attribute: L,
    copy: '{inputProps.ariaLabel}',
    source: SB_KC_CALLERS,
    scope: 'shared',
    derivesFrom: SEARCH_BAR_CALLER_SITES,
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 231,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source: SB_KC_CALLERS,
    scope: 'shared',
    derivesFrom: SEARCH_BAR_CALLER_SITES,
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 95,
    element: 'IconButton',
    attribute: L,
    copy: 'View search history.',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 281,
    element: 'IconButton',
    attribute: L,
    copy: 'View search history.',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: SBKC,
    file: 'src/components/search-bar/index.tsx',
    line: 316,
    element: 'IconButton',
    attribute: L,
    copy: 'Close search history.',
    source: HARD,
    scope: 'shared',
  },

  // ---- advanced search
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/TreeItemActions.tsx`,
    line: 45,
    element: 'Action (drag handle)',
    attribute: L,
    copy: 'drag item',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/TreeItemActions.tsx`,
    line: 54,
    element: 'Action (collapse)',
    attribute: L,
    copy: 'collapse items',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/TreeItemActions.tsx`,
    line: 69,
    element: 'Action (collapse)',
    attribute: L,
    copy: 'collapse items',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/TreeItemActions.tsx`,
    line: 84,
    element: 'Remove',
    attribute: L,
    copy: 'remove item',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/Actions/Remove.tsx`,
    line: 14,
    element: 'Action',
    attribute: L,
    copy: "{props['aria-label']}",
    source: "caller-supplied: 'remove item' (TreeItemActions.tsx:84)",
    scope: 'route-specific',
    derivesFrom: from([TREE_ACTIONS, 84]),
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/Actions/Action.tsx`,
    line: 12,
    element: 'Button',
    attribute: L,
    copy: "{props['aria-label']}",
    source:
      "caller-supplied: 'drag item' / 'collapse items' (TreeItemActions.tsx:45,54,69)",
    scope: 'route-specific',
    derivesFrom: from(
      [TREE_ACTIONS, 45],
      [TREE_ACTIONS, 54],
      [TREE_ACTIONS, 69],
    ),
  },
  {
    routes: AS,
    file: `${ADV}/EditableQueryText/index.tsx`,
    line: 204,
    element: 'IconButton',
    attribute: L,
    copy: 'Cancel',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/EditableQueryText/index.tsx`,
    line: 212,
    element: 'IconButton',
    attribute: L,
    copy: 'Accept Edit.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/EditableQueryText/index.tsx`,
    line: 223,
    element: 'IconButton',
    attribute: L,
    copy: 'Edit',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/EditableQueryText/index.tsx`,
    line: 281,
    element: 'Input',
    attribute: LB,
    copy: "'editable-label'",
    source:
      "references the element with id='editable-label' in the same component",
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/Search/components/FieldSelect/index.tsx`,
    line: 255,
    element: 'Select',
    attribute: LB,
    copy: "'field-select-label'",
    source: "references the element with id='field-select-label'",
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/EditableContent/SearchLabel.tsx`,
    line: 46,
    element: 'Select',
    attribute: LB,
    copy: "'field-select-label'",
    source: "references the element with id='field-select-label'",
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/Search/components/SearchInput/components/TextInput.tsx`,
    line: 59,
    element: 'DropdownButton (ariaLabel prop)',
    attribute: L,
    copy: 'Add',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/Search/components/SearchInput/components/InputSubmitButton.tsx`,
    line: 47,
    element: 'DropdownButton (ariaLabel prop)',
    attribute: L,
    copy: 'Submit button',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: `${ADV}/SortableWithCombine/components/TreeItem/components/UnionButton.tsx`,
    line: 26,
    element: 'DropdownButton (ariaLabel prop)',
    attribute: L,
    copy: 'union between query elements',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: AS,
    file: 'src/components/search-with-predictive-text/components/PredictiveSearch.tsx',
    line: 117,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'caller-supplied from TextInput.tsx:59',
    scope: 'route-specific',
    derivesFrom: from([
      `${ADV}/Search/components/SearchInput/components/TextInput.tsx`,
      59,
    ]),
  },
  {
    routes: AS,
    file: 'src/components/dropdown-button/index.tsx',
    line: 60,
    element: 'Button',
    attribute: L,
    copy: '{ariaLabel}',
    source: DROPDOWN_CALLERS,
    scope: 'shared',
    derivesFrom: DROPDOWN_CALLER_SITES,
  },
  {
    routes: AS,
    file: 'src/components/dropdown-button/index.tsx',
    line: 70,
    element: 'IconButton',
    attribute: L,
    copy: '{ariaLabel}',
    source: DROPDOWN_CALLERS,
    scope: 'shared',
    derivesFrom: DROPDOWN_CALLER_SITES,
  },

  // ---- resource-sections (/resources)
  {
    routes: RES,
    file: `${RS}/sidebar/components/external/components/altmetric.tsx`,
    line: 24,
    element: 'Link/Box',
    attribute: L,
    copy: '{`altmetric badge for doi ${doi}`}',
    source: 'template hardcoded in JSX + doi from NDE API',
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/based-on/index.tsx`,
    line: 173,
    element: 'Table (ariaLabel)',
    attribute: L,
    copy: '{title}',
    source: 'section title from NDE API resource data',
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/section/index.tsx`,
    line: 59,
    element: 'Button',
    attribute: L,
    copy: '{`show more details about ${name}`}',
    source: 'template hardcoded in JSX + name from NDE API',
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/authors/index.tsx`,
    line: 171,
    element: 'Link',
    attribute: L,
    copy: 'Personal website.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/cited-by-table/index.tsx`,
    line: 104,
    element: 'Table',
    attribute: L,
    copy: 'Cited by information',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/funding/index.tsx`,
    line: 137,
    element: 'Table',
    attribute: L,
    copy: 'Grant and funding information',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/files-table/index.tsx`,
    line: 24,
    element: 'Table (ariaLabel prop)',
    attribute: L,
    copy: 'List of downloadable files.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: `${RS}/samples/components/SampleTable/index.tsx`,
    line: 39,
    element: 'Table (ariaLabel prop)',
    attribute: L,
    copy: '{label}',
    source: 'label derived from the sample section config in the same view',
    scope: 'route-specific',
  },
  {
    routes: RES,
    file: 'src/components/copy-button/index.tsx',
    line: 51,
    element: 'Button',
    attribute: L,
    copy: '{hasCopied ? copiedText : buttonText}',
    source:
      'caller-supplied copiedText/buttonText props (resource-sections/components/header, json-viewer)',
    scope: 'shared',
  },

  // ---- bookmark buttons
  {
    routes: BOOKMARK,
    file: 'src/components/bookmark-buttons/icon-button.tsx',
    line: 24,
    element: 'IconButton',
    attribute: L,
    copy: '{label}',
    source:
      "caller-supplied: saved/table-config.tsx:93 ('Remove saved query' / 'Save query'), search-results-header/index.tsx:108 ('Remove search from saved searches' / 'Save this search')",
    scope: 'shared',
    derivesFrom: BOOKMARK_CALLER_SITES,
  },

  // ---- table
  {
    routes: TABLE,
    file: 'src/components/table/index.tsx',
    line: 641,
    element: 'Table',
    attribute: L,
    copy: '{ariaLabel}',
    source: TABLE_CALLERS,
    scope: 'shared',
    derivesFrom: TABLE_CALLER_SITES,
  },
  {
    routes: TABLE,
    file: 'src/components/table/index.tsx',
    line: 697,
    element: 'Table (mobile)',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'caller-supplied - see concrete call-site literals',
    scope: 'shared',
    derivesFrom: TABLE_CALLER_SITES,
  },
  {
    routes: TABLE,
    file: 'src/components/table/index.tsx',
    line: 718,
    element: 'Table (fallback)',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'caller-supplied - see concrete call-site literals',
    scope: 'shared',
    derivesFrom: TABLE_CALLER_SITES,
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/sort-toggle.tsx',
    line: 22,
    element: 'IconButton',
    attribute: L,
    copy: 'sort table column ascending',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/sort-toggle.tsx',
    line: 32,
    element: 'IconButton',
    attribute: L,
    copy: 'sort table column descending',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 107,
    // Not a caller-supplied <nav>: this is the local PaginationButton
    // sub-component, and its ariaLabel is supplied at 158/164/189/195 below.
    element: 'IconButton (PaginationButton)',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'supplied by the four page-nav buttons in this same file',
    scope: 'shared',
    derivesFrom: PAGE_NAV_BUTTON_SITES,
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 142,
    element: 'Select',
    attribute: L,
    copy: 'Select number of rows per page',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 177,
    element: 'Select',
    attribute: L,
    copy: 'Select page',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 158,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Go to first page.',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 164,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Go to previous page.',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 189,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Go to next page.',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: TABLE,
    file: 'src/components/table/components/pagination.tsx',
    line: 195,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Go to last page.',
    source: HARD,
    scope: 'shared',
  },

  // ---- carousel
  {
    routes: CAROUSEL,
    file: 'src/components/carousel/components/CarouselControls.tsx',
    line: 38,
    element: 'IconButton',
    attribute: L,
    copy: 'previous carousel item',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: CAROUSEL,
    file: 'src/components/carousel/components/CarouselControls.tsx',
    line: 60,
    element: 'Box (progressbar)',
    attribute: L,
    copy: '{`Carousel progress: ${Math.round(progressPercentage)}% complete`}',
    source: 'template hardcoded in JSX',
    scope: 'shared',
  },
  {
    routes: CAROUSEL,
    file: 'src/components/carousel/components/CarouselControls.tsx',
    line: 83,
    element: 'Box (indicator dot)',
    attribute: L,
    copy: "{`carousel indicator ${i + 1} of ${totalDots}${shouldHighlight ? ' (current)' : ''}`}",
    source: 'template hardcoded in JSX',
    scope: 'shared',
  },
  {
    routes: CAROUSEL,
    file: 'src/components/carousel/components/CarouselControls.tsx',
    line: 122,
    element: 'IconButton',
    attribute: L,
    copy: 'next carousel item',
    source: HARD,
    scope: 'shared',
  },

  // ---- table-of-contents layouts
  {
    routes: TOC,
    file: 'src/components/table-of-contents/layouts/sidebar.tsx',
    line: 22,
    element: "Box as='nav'",
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied: 'Navigation for list of featured pages.' / 'Navigation for list of disease pages.' / 'Navigation for program collections list.' / 'Navigation for data sources.'",
    scope: 'shared',
    derivesFrom: TOC_SIDEBAR_SITES,
  },
  {
    routes: TOC,
    file: 'src/components/table-of-contents/layouts/section-search.tsx',
    line: 21,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied: 'Search for a featured page' / 'Search for a disease' / 'Search for a program collection' / 'Search for a source'",
    scope: 'shared',
    derivesFrom: TOC_SEARCH_SITES,
  },

  // ---- search input
  {
    routes: SEARCH_INPUT,
    file: 'src/components/search-input/index.tsx',
    line: 134,
    element: 'IconButton',
    attribute: L,
    copy: 'search',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: SEARCH_INPUT,
    file: 'src/components/search-input/index.tsx',
    line: 155,
    element: 'IconButton',
    attribute: L,
    copy: 'Open search input',
    source: HARD,
    scope: 'shared',
  },

  // ---- input with dropdown
  {
    routes: IWD,
    file: 'src/components/input-with-dropdown/components/DropdownInput.tsx',
    line: 242,
    element: 'IconButton',
    attribute: L,
    copy: 'Clear search input',
    source: HARD,
    scope: 'shared',
  },

  // ---- select / popovers
  {
    routes: NONE,
    file: 'src/components/select/components/Select.tsx',
    line: 116,
    element: 'SelectIcon (inside SelectWithInput)',
    attribute: L,
    copy: '{ariaLabel}',
    // SelectWithInput, which contains this line, has no importer in src/ - only
    // its sibling SelectWithButton is used (by advanced-search RadioSelect).
    source: UNUSED_COMPONENT,
    scope: 'unused component',
  },
  {
    routes: SAOP,
    file: 'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    line: 126,
    element: 'IconButton',
    attribute: L,
    copy: '{`Move ${item.title} up`}',
    source:
      'template hardcoded in JSX + item.title from the column/filter config',
    scope: 'shared',
  },
  {
    routes: SAOP,
    file: 'src/components/select-and-order-popover/components/PopoverListItem.tsx',
    line: 135,
    element: 'IconButton',
    attribute: L,
    copy: '{`Move ${item.title} down`}',
    source:
      'template hardcoded in JSX + item.title from the column/filter config',
    scope: 'shared',
  },

  // ---- icon
  {
    routes: ICON,
    file: 'src/components/icon/index.tsx',
    line: 72,
    element: 'Icon (info)',
    attribute: L,
    copy: 'information',
    source: HARD,
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/index.tsx',
    line: 92,
    element: 'Icon',
    attribute: L,
    copy: '{title}',
    source: 'caller-supplied title prop',
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/index.tsx',
    line: 104,
    element: 'svg',
    attribute: L,
    copy: '{title}',
    source: 'caller-supplied title prop',
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/index.tsx',
    line: 101,
    element: 'svg',
    attribute: LB,
    copy: '{id}',
    source:
      'references the inline <title id={id}> rendered by src/components/icon/components/glyph.tsx',
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/components/glyph.tsx',
    line: 26,
    element: 'svg <title>',
    attribute: T,
    copy: "{title || 'Icon for BAM type files.'}",
    source: 'fallback hardcoded in JSX; overridable via the title prop',
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/components/glyph.tsx',
    line: 39,
    element: 'svg <title>',
    attribute: T,
    copy: "{title || 'Empty, no data available.'}",
    source: 'fallback hardcoded in JSX; overridable via the title prop',
    scope: 'shared',
  },
  {
    routes: ICON,
    file: 'src/components/icon/components/glyph.tsx',
    line: 51,
    element: 'svg <title>',
    attribute: T,
    copy: "{title || 'Icon for FASTA type files.'}",
    source: 'fallback hardcoded in JSX; overridable via the title prop',
    scope: 'shared',
  },

  // ---- empty state
  {
    routes: EMPTY,
    file: 'src/components/empty/index.tsx',
    line: 42,
    element: 'Box/Flex',
    attribute: LB,
    copy: "'empty'",
    source: "references the element with id='empty' in the same component",
    scope: 'shared',
  },

  // ---- toggle container
  {
    routes: SEARCH,
    file: 'src/components/toggle-container/index.tsx',
    line: 77,
    element: 'Button',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied from src/views/search/components/results-list/components/card/index.tsx:214,360 (both pass ariaLabel='')",
    scope: 'shared',
    derivesFrom: from(
      [`${SRL}/card/index.tsx`, 214],
      [`${SRL}/card/index.tsx`, 360],
    ),
  },

  // ---- visualizations
  {
    routes: DS,
    file: 'src/components/visualizations/bar/index.tsx',
    line: 227,
    element: 'svg',
    attribute: L,
    copy: "{title ?? (label ? `${label} bar chart` : 'Bar chart')}",
    source: 'caller-supplied title/label, with hardcoded fallbacks in JSX',
    scope: 'shared',
  },
  {
    routes: NONE,
    file: 'src/components/visualizations/pie/index.tsx',
    line: 543,
    element: 'svg <title>',
    attribute: T,
    copy: '{label}',
    source: PIE_UNUSED,
    scope: 'unused component',
  },
  {
    routes: NONE,
    file: 'src/components/visualizations/pie/index.tsx',
    line: 546,
    element: 'svg',
    attribute: L,
    copy: '{label}',
    source: PIE_UNUSED,
    scope: 'unused component',
  },

  // ---- /saved
  {
    routes: SAVED,
    file: 'src/views/saved/components/saved-data-error-banner.tsx',
    line: 35,
    element: 'CloseButton',
    attribute: L,
    copy: 'Dismiss error',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SAVED,
    file: 'src/views/saved/table-config.tsx',
    line: 93,
    element: 'BookmarkIconButton (label prop)',
    attribute: L,
    copy: "{isFavorited ? 'Remove saved query' : 'Save query'}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SAVED,
    file: 'src/views/saved/components/saved-table-section.tsx',
    line: 181,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: '{searchAriaLabel}',
    source: 'caller-supplied searchAriaLabel prop (saved-table-section.tsx:32)',
    scope: 'route-specific',
  },
  {
    routes: SAVED,
    file: 'src/views/saved/components/saved-table-section.tsx',
    line: 193,
    element: 'Table (ariaLabel prop)',
    attribute: L,
    copy: '{tableAriaLabel}',
    source: 'caller-supplied tableAriaLabel prop (saved-table-section.tsx:33)',
    scope: 'route-specific',
  },

  // ---- ontology browser (also mounted in the /search popup)
  {
    routes: OB,
    file: `${OBT}/tree/components/tree-node.tsx`,
    line: 257,
    element: 'Button',
    attribute: L,
    copy: '{`Show all children of ${node.label}`}',
    source: 'template hardcoded in JSX + node.label from the ontology API',
    scope: 'route-specific',
  },
  {
    routes: OB,
    file: `${OBT}/tree/components/tree-node.tsx`,
    line: 333,
    element: 'IconButton',
    attribute: L,
    copy: '{isIncludedInSearch(node.taxonId) ? `Remove ${node.label} from search list` : `Search portal for resources related to ${node.label}`}',
    source: 'templates hardcoded in JSX + node.label from the ontology API',
    scope: 'route-specific',
  },
  {
    routes: OB,
    file: `${OBT}/tree/components/breadcrumbs.tsx`,
    line: 93,
    element: 'IconButton',
    attribute: L,
    copy: 'show parent node',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: OB,
    file: `${OBT}/ontology-search-list/toggle.tsx`,
    line: 22,
    element: 'Button',
    attribute: L,
    copy: '{label}',
    source: 'caller-supplied label prop',
    scope: 'route-specific',
  },
  {
    routes: OB,
    file: `${OBT}/ontology-search-list/index.tsx`,
    line: 83,
    element: 'IconButton',
    attribute: L,
    copy: 'Collapse selected search terms list',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: OB,
    file: `${OBT}/ontology-search-list/index.tsx`,
    line: 186,
    element: 'IconButton',
    attribute: L,
    copy: '{`remove ${label} from search`}',
    source: 'template hardcoded in JSX + label from the selected search term',
    scope: 'route-specific',
  },
  {
    routes: ['/ontology-browser'],
    file: `${OBT}/search/index.tsx`,
    line: 206,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: 'Search taxonomy browser',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /features
  {
    routes: ['/features'],
    file: 'src/views/features/components/TableOfContents.tsx',
    line: 44,
    element: 'Sidebar (aria-label)',
    attribute: L,
    copy: 'Navigation for list of featured pages.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: ['/features'],
    file: 'src/views/features/components/TableOfContents.tsx',
    line: 74,
    element: 'SectionSearch (ariaLabel prop)',
    attribute: L,
    copy: 'Search for a featured page',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /knowledge-center
  {
    routes: KC,
    file: `${DOCS}/sidebar/DocumentItem.tsx`,
    line: 66,
    element: 'Box/Skeleton',
    attribute: L,
    copy: "{isLoading ? 'Loading' : undefined}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/sidebar/DocumentItem.tsx`,
    line: 90,
    element: 'IconButton',
    attribute: L,
    copy: "{isExpanded ? 'Collapse sections' : 'Expand sections'}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/sidebar/SidebarDesktop.tsx`,
    line: 96,
    element: 'Box/Skeleton',
    attribute: L,
    copy: "{isLoading ? 'Loading' : undefined}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/sidebar/SidebarContainer.tsx`,
    line: 28,
    element: 'IconButton',
    attribute: L,
    copy: 'Expand documentation navigation menu',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/sidebar/SidebarContainer.tsx`,
    line: 63,
    element: 'IconButton',
    attribute: L,
    copy: 'Collapse documentation navigation menu',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/sidebar/TocItem.tsx`,
    line: 92,
    element: 'IconButton',
    attribute: L,
    copy: "{isExpanded ? 'Collapse subsections' : 'Expand subsections'}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: `${DOCS}/search-bar/SearchBar.tsx`,
    line: 264,
    element: 'DropdownInput (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source: KC_CALLER,
    scope: 'route-specific',
    derivesFrom: from([KC_SLUG_PAGE, 140]),
  },
  {
    routes: KC,
    file: `${DOCS}/search-bar/SearchBar.tsx`,
    line: 280,
    element: 'SearchBar (ariaLabel)',
    attribute: L,
    copy: '{ariaLabel}',
    source: KC_CALLER,
    scope: 'route-specific',
    derivesFrom: from([KC_SLUG_PAGE, 140]),
  },
  {
    routes: KC,
    file: `${DOCS}/search-bar/SearchBar.tsx`,
    line: 292,
    element: 'IconButton',
    attribute: L,
    copy: 'View search history.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: KC,
    file: 'src/pages/knowledge-center/[[...slug]].tsx',
    line: 140,
    element: 'DocsSearchBar (ariaLabel prop)',
    attribute: L,
    copy: 'Search Knowledge Center',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /search
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/filters-chart-toggle.tsx',
    line: 26,
    element: 'IconButton',
    attribute: L,
    copy: '{isActive ? `Remove ${name} visualisation chart` : `Add ${name} visualisation chart`}',
    source: 'templates hardcoded in JSX + name from the filter config',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/date-filter/components/date-brush.tsx',
    line: 509,
    element: 'Brush group',
    attribute: L,
    copy: BRUSH_HELP,
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/layout/tabs.tsx',
    line: 53,
    element: 'Tab',
    attribute: L,
    copy: "{tab.types.map(t => t.label).join(', ')}",
    source: 'labels from src/views/search/config/tabs.ts',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/pagination/index.tsx`,
    line: 92,
    element: 'nav',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied: 'Paginate through resources.' (results-list/index.tsx:473,566)",
    scope: 'route-specific',
    derivesFrom: SEARCH_PAGINATION_SITES,
  },
  {
    routes: SEARCH,
    file: `${SRL}/pagination/index.tsx`,
    line: 120,
    element: 'Select',
    attribute: L,
    copy: "{ariaLabel || 'Select page'}",
    source: "caller-supplied with a hardcoded 'Select page' fallback",
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/index.tsx',
    line: 473,
    element: 'Pagination (ariaLabel prop)',
    attribute: L,
    copy: 'Paginate through resources.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/results-list/index.tsx',
    line: 566,
    element: 'Pagination (ariaLabel prop)',
    attribute: L,
    copy: 'Paginate through resources.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/card/index.tsx`,
    line: 619,
    element: 'Link',
    attribute: L,
    copy: '{`Go to details about resource ${name}`}',
    source: 'template hardcoded in JSX + name from NDE API',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/card/index.tsx`,
    line: 214,
    element: 'ToggleContainer (ariaLabel prop)',
    attribute: L,
    copy: '',
    source: "passes ariaLabel='' - hardcoded in JSX",
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/card/index.tsx`,
    line: 360,
    element: 'ToggleContainer (ariaLabel prop)',
    attribute: L,
    copy: '',
    source: "passes ariaLabel='' - hardcoded in JSX",
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/toolbar/components/select-input.tsx`,
    line: 32,
    element: 'Select',
    attribute: L,
    copy: '{label}',
    source: 'caller-supplied label prop',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/search-results-header/index.tsx',
    line: 108,
    element: 'BookmarkIconButton',
    attribute: L,
    copy: "{isFavorited ? 'Remove search from saved searches' : 'Save this search'}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/index.tsx',
    line: 123,
    element: 'IconButton',
    attribute: L,
    copy: "{isExpanded ? 'Collapse' : 'Expand'}",
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 49,
    element: 'IconButton',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied: 'Expand chart to modal view' / 'Remove chart from display.' (card-header.tsx:76,84)",
    scope: 'route-specific',
    derivesFrom: from([CARD_HEADER, 76], [CARD_HEADER, 84]),
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 76,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Expand chart to modal view',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    line: 84,
    element: 'IconButton (ariaLabel prop)',
    attribute: L,
    copy: 'Remove chart from display.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/summary/components/visualization-card/chart-picker.tsx',
    line: 15,
    element: 'Select',
    attribute: L,
    copy: "{props.label ? `Chart type for ${props.label}` : 'Chart type'}",
    source: 'template + fallback hardcoded in JSX',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: 'src/views/search/components/filters/components/list.tsx',
    line: 290,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: '{searchPlaceholder}',
    source: 'caller-supplied searchPlaceholder from the filter config',
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/results-table/index.tsx`,
    line: 86,
    element: 'Table (ariaLabel prop)',
    attribute: L,
    copy: '{ariaLabel}',
    source:
      "caller-supplied: 'Dataset search results' / 'Computational tool search results' / 'Sample search results' / 'Data collection search results'",
    scope: 'route-specific',
    derivesFrom: RESULT_TABLE_SITES,
  },
  {
    routes: SEARCH,
    file: `${SRL}/dataset-results-table/index.tsx`,
    line: 415,
    element: 'ResultsTable (ariaLabel prop)',
    attribute: L,
    copy: 'Dataset search results',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/computational-tool-results-table/index.tsx`,
    line: 353,
    element: 'ResultsTable (ariaLabel prop)',
    attribute: L,
    copy: 'Computational tool search results',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/sample-results-table/index.tsx`,
    line: 524,
    element: 'ResultsTable (ariaLabel prop)',
    attribute: L,
    copy: 'Sample search results',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/data-collection-results-table/index.tsx`,
    line: 342,
    element: 'ResultsTable (ariaLabel prop)',
    attribute: L,
    copy: 'Data collection search results',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: SEARCH,
    file: `${SRL}/toolbar/components/view-mode-radio.tsx`,
    line: 34,
    element: 'RadioGroup',
    attribute: LB,
    copy: '{labelId}',
    source: 'references the toolbar view-mode label element',
    scope: 'route-specific',
  },

  // ---- /diseases/[slug]
  {
    routes: DS,
    file: `${VIZ}/stacked-bar-chart.tsx`,
    line: 275,
    element: 'Link wrapping svg <rect>',
    attribute: L,
    copy: "{`${bar.data.label}: ${bar.data.count.toLocaleString()} result${bar.data.count === 1 ? '' : 's'}`}",
    source: 'template hardcoded in JSX + label/count from NDE API',
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/brushable-list-chart/brushable-bar-chart.tsx`,
    line: 95,
    element: 'Brush group',
    attribute: L,
    copy: BRUSH_HELP,
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/treemap-chart.tsx`,
    line: 234,
    element: 'Treemap node',
    attribute: L,
    copy: '{`${node.data.data.term}, ${node.data.data.count} items`}',
    source: 'template hardcoded in JSX + term/count from NDE API',
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/treemap-chart.tsx`,
    line: 176,
    element: 'svg',
    attribute: LB,
    copy: '{aria_title}',
    source:
      'generated unique id referencing the chart title element (treemap-chart.tsx:112)',
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/bar-chart.tsx`,
    line: 219,
    element: 'svg',
    attribute: LB,
    copy: "'coa-stacked-title'",
    source: "references the element with id='coa-stacked-title'",
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/stacked-bar-chart.tsx`,
    line: 159,
    element: 'svg',
    attribute: LB,
    copy: "'coa-stacked-title'",
    source: "references the element with id='coa-stacked-title'",
    scope: 'route-specific',
  },
  {
    routes: DS,
    file: `${VIZ}/donut-chart.tsx`,
    line: 223,
    element: 'svg',
    attribute: LB,
    copy: "'donut-chart-title'",
    source: "references the element with id='donut-chart-title'",
    scope: 'route-specific',
  },

  // ---- /diseases
  {
    routes: ['/diseases'],
    file: 'src/views/diseases/toc/index.tsx',
    line: 80,
    element: 'Sidebar (aria-label)',
    attribute: L,
    copy: 'Navigation for list of disease pages.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: ['/diseases'],
    file: 'src/views/diseases/toc/index.tsx',
    line: 110,
    element: 'SectionSearch (ariaLabel prop)',
    attribute: L,
    copy: 'Search for a disease',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /sources
  {
    routes: ['/sources'],
    file: 'src/pages/sources.tsx',
    line: 152,
    element: 'Sidebar (aria-label)',
    attribute: L,
    copy: 'Navigation for data sources.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: ['/sources'],
    file: 'src/views/sources/components/main.tsx',
    line: 113,
    element: 'SectionSearch (ariaLabel prop)',
    attribute: L,
    copy: 'Search for a source',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /program-collections
  {
    routes: ['/program-collections'],
    file: 'src/pages/program-collections.tsx',
    line: 108,
    element: 'Sidebar (aria-label)',
    attribute: L,
    copy: 'Navigation for program collections list.',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: ['/program-collections'],
    file: 'src/pages/program-collections.tsx',
    line: 149,
    element: 'SectionSearch (ariaLabel prop)',
    attribute: L,
    copy: 'Search for a program collection',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /repository-matcher
  {
    routes: ['/repository-matcher'],
    file: 'src/pages/repository-matcher.tsx',
    line: 326,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: 'Search repositories and resource catalogs',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: ['/repository-matcher'],
    file: 'src/pages/repository-matcher.tsx',
    line: 419,
    element: 'Table (ariaLabel prop)',
    attribute: L,
    copy: 'Repository matcher table',
    source: HARD,
    scope: 'route-specific',
  },

  // ---- /settings
  {
    routes: ['/settings'],
    file: 'src/pages/settings.tsx',
    line: 185,
    element: 'IconButton/Button',
    attribute: L,
    copy: '{label}',
    source: 'caller-supplied label from the settings section config',
    scope: 'route-specific',
  },

  // ---- /
  {
    routes: HOME,
    file: 'src/pages/index.tsx',
    line: 265,
    element: 'TableWithSearch (ariaLabel prop)',
    attribute: L,
    copy: 'List of repositories and resource catalogs',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: HOME,
    file: 'src/views/home/components/TableWithSearch/index.tsx',
    line: 109,
    element: 'SearchInput (ariaLabel prop)',
    attribute: L,
    copy: 'Search table',
    source: HARD,
    scope: 'route-specific',
  },
  {
    routes: HOME,
    file: 'src/views/home/components/LandingPageCards/Card.tsx',
    line: 22,
    element: 'Card container',
    attribute: LB,
    copy: '{`card-heading-${index}`}',
    source:
      'references the card heading element rendered in the same component',
    scope: 'route-specific',
  },
];

// --------------------------------------------------------- resolved values
// The resolver, the Resolved type and CAP all live in ./lib/audit-csv.
const resolver = createResolver<AltEntry | AriaEntry>();
const { register, registerKey, rowsFor, valuesFor } = resolver;

// ------------------------------------------------------------------ fetching
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const NDE_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StrapiImage {
  path: string;
  alt: string | null;
  url: string;
}

/** Walk a Strapi payload collecting every media object, with its field path. */
const walkImages = (
  node: any,
  at = '',
  out: StrapiImage[] = [],
): StrapiImage[] => {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkImages(v, `${at}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    if ('alternativeText' in node && 'url' in node) {
      out.push({ path: at, alt: node.alternativeText ?? null, url: node.url });
    }
    for (const [k, v] of Object.entries(node)) {
      walkImages(v, at ? `${at}.${k}` : k, out);
    }
  }
  return out;
};

/** Pull `![alt](src)` out of a markdown body field. */
const walkMarkdownImages = (records: any[], field: string) => {
  const out: { alt: string; src: string }[] = [];
  for (const rec of records) {
    const body = rec?.[field];
    if (typeof body !== 'string') continue;
    for (const m of body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)) {
      out.push({ alt: m[1], src: m[2] });
    }
  }
  return out;
};

const isVideo = (src: string) => /\.(webm|mp4)(\?|$)/i.test(src);

const cms = (field: string, extra = '') =>
  `Strapi CMS - ${field}${
    extra ? ` (${extra})` : ''
  }; edit in the CMS, not in code`;

const NO_ALT = '(EMPTY - Strapi alternativeText is null for this image)';

/**
 * Fetch every real alt string from Strapi and the NDE API, and register it
 * against the inventory entry that renders it.
 */
const registerFetchedValues = async () => {
  if (!STRAPI_URL || !NDE_API_URL) {
    throw new Error(
      'NEXT_PUBLIC_STRAPI_API_URL and NEXT_PUBLIC_API_URL must be set - run ' +
        'this via `yarn generate-a11y-audit`, which loads .env.production',
    );
  }
  const page = 'pagination[pageSize]=100';
  const toValue = (img: StrapiImage, field: string, extra = ''): Resolved => ({
    copy: img.alt ?? NO_ALT,
    image: `${STRAPI_URL}${img.url}`,
    source: cms(field, extra),
    retrieved: TODAY,
  });

  // --- news carousel -> NewsCarousel.tsx:173
  const news = await getJson(
    `${STRAPI_URL}/api/news-reports?populate=*&${page}`,
  );
  register(
    'src/views/home/components/NewsCarousel.tsx',
    173,
    walkImages(news.data)
      .filter(i => /\.image\[/.test(i.path))
      .map(i => toValue(i, 'news-reports image.alternativeText')),
  );

  // --- diseases: the same hero `image` field renders on two different sites
  const diseases = await getJson(
    `${STRAPI_URL}/api/diseases?populate=*&${page}`,
  );
  const diseaseImages = walkImages(diseases.data);
  const hero = diseaseImages
    .filter(i => /^\[\d+\]\.image$/.test(i.path))
    .map(i => toValue(i, 'diseases image.alternativeText'));
  register('src/views/diseases/disease/layouts/intro.tsx', 99, hero);
  register('src/views/diseases/toc/index.tsx', 170, hero);
  register(
    'src/views/diseases/disease/components/external-links.tsx',
    28,
    diseaseImages
      .filter(i => /externalLinks\[\d+\]\.image$/.test(i.path))
      .map(i => toValue(i, 'diseases externalLinks[].image.alternativeText')),
  );

  // --- features thumbnail -> the shared table-of-contents card
  const features = await getJson(
    `${STRAPI_URL}/api/features?populate=*&${page}`,
  );
  register(
    'src/components/table-of-contents/components/card.tsx',
    89,
    walkImages(features.data)
      .filter(i => /\.thumbnail$/.test(i.path))
      .map(i => toValue(i, 'features thumbnail.alternativeText')),
  );

  // --- integration page. `populate=*` returns no media for this content type,
  // so mirror the nested populate the app itself uses (integration Main.tsx).
  const integrationPopulate = [
    'overview.image',
    'tabs.panels.cards.icon',
    'tabs.panels.cards.tabItems.icon',
    'textBlocks',
  ]
    .map((p, i) => `populate[${i}]=${p}`)
    .join('&');
  const integration = await getJson(
    `${STRAPI_URL}/api/integration-page?${integrationPopulate}`,
  );
  const integrationImages = walkImages(integration.data);
  register(
    'src/views/integration/components/Blocks.tsx',
    83,
    integrationImages
      .filter(i => /^overview\[\d+\]\.image$/.test(i.path))
      .map(i =>
        toValue(i, 'integration-page overview[].image.alternativeText'),
      ),
  );
  register(
    'src/views/integration/components/Card.tsx',
    106,
    integrationImages
      .filter(i => /^tabs\..*icon$/.test(i.path))
      .map(i =>
        toValue(
          i,
          'integration-page tabs.panels[].cards[].icon.alternativeText',
        ),
      ),
  );

  // --- markdown-embedded images and videos, both rendered by the MDX img/video
  // handler. Attribute each to the route family whose body copy contains it.
  const docs = await getJson(`${STRAPI_URL}/api/docs?populate=*&${page}`);
  const docsMd = walkMarkdownImages(docs.data, 'description');
  const featuresMd = walkMarkdownImages(features.data, 'content');
  const mdValue = (
    m: { alt: string; src: string },
    where: string,
  ): Resolved => ({
    copy: m.alt,
    image: m.src,
    source: cms(`${where} markdown image alt`, 'author-supplied'),
    retrieved: TODAY,
  });
  registerKey(
    'mdx-img-docs',
    docsMd.filter(m => !isVideo(m.src)).map(m => mdValue(m, 'docs')),
  );
  registerKey(
    'mdx-img-features',
    featuresMd.filter(m => !isVideo(m.src)).map(m => mdValue(m, 'features')),
  );
  // Markdown whose "image" is a video becomes aria-label on a <video> instead.
  registerKey(
    'mdx-video-docs',
    docsMd.filter(m => isVideo(m.src)).map(m => mdValue(m, 'docs')),
  );
  registerKey(
    'mdx-video-features',
    featuresMd.filter(m => isVideo(m.src)).map(m => mdValue(m, 'features')),
  );

  // --- the MDX catch-all: any markdown other than docs/features goes through
  // the same handler, and in practice that means the page-container banner.
  // Check whether the live notices actually contain any markdown images.
  const notices = await getJson(`${STRAPI_URL}/api/notices?populate=*`);
  const noticeRecords: any[] = Array.isArray(notices.data)
    ? notices.data
    : [notices.data].filter(Boolean);
  const noticeImages = noticeRecords.flatMap(rec =>
    Object.values(rec ?? {}).flatMap(v =>
      typeof v === 'string'
        ? [...v.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)].map(m => ({
            alt: m[1],
            src: m[2],
          }))
        : [],
    ),
  );
  const activeNotices = noticeRecords.filter(r => r?.isActive).length;
  registerKey(
    'mdx-img-other',
    noticeImages.length
      ? noticeImages.map(m => mdValue(m, 'banner notice'))
      : [
          {
            copy:
              `(NO IMAGES - no markdown images are authored in the banner ` +
              `notices; ${noticeRecords.length} notice(s), ${activeNotices} active)`,
            source:
              'Strapi CMS - /api/notices, the only other content routed through ' +
              'this handler; it currently contains no markdown images',
            retrieved: TODAY,
          },
        ],
  );

  // --- source names, for the two source-logo templates
  const facets = await getJson(
    `${NDE_API_URL}/query?q=__all__&size=0&facet_size=200` +
      `&facets=includedInDataCatalog.name`,
  );
  const sourceNames: string[] = (
    facets?.facets?.['includedInDataCatalog.name']?.terms ?? []
  ).map((t: any) => t.term);
  const slug = (name: string) =>
    `/assets/resources/${name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '')}.png`;
  register(
    'src/components/source-logo/index.tsx',
    84,
    sourceNames.map(n => ({
      copy: `Click to open the source (${n}) in a new tab.`,
      image: slug(n),
      source:
        'template at source-logo/index.tsx:84 + source.name from the NDE API',
      retrieved: TODAY,
    })),
  );
  register(
    'src/components/source-logo/index.tsx',
    96,
    sourceNames.map(n => ({
      copy: `Logo for ${n}`,
      image: slug(n),
      source:
        'template at source-logo/index.tsx:96 + source.name from the NDE API',
      retrieved: TODAY,
    })),
  );

  // --- one real resource, to make the per-record templates concrete
  const sample = await getJson(
    `${NDE_API_URL}/query?q=_exists_:doi&size=1&fields=name,doi`,
  );
  const hit = sample?.hits?.[0] ?? {};
  const exampleName: string = hit.name ?? 'NCBI GEO';
  const exampleDoi: string = Array.isArray(hit.doi) ? hit.doi[0] : hit.doi;
  const perRecord = (copy: string, note: string): Resolved => ({
    copy,
    source: `${note} - one real sampled value; this string is per-record`,
    retrieved: TODAY,
    isExample: true,
  });
  register(`${SRL}/card/index.tsx`, 619, [
    perRecord(
      `Go to details about resource ${exampleName}`,
      'template in JSX + resource name from the NDE API',
    ),
  ]);
  register(`${RS}/section/index.tsx`, 59, [
    perRecord(
      `show more details about ${exampleName}`,
      'template in JSX + resource name from the NDE API',
    ),
  ]);
  register(`${RS}/based-on/index.tsx`, 173, [
    perRecord(exampleName, 'section title from NDE API resource data'),
  ]);
  if (exampleDoi) {
    register(`${RS}/sidebar/components/external/components/altmetric.tsx`, 24, [
      perRecord(
        `altmetric badge for doi ${exampleDoi}`,
        'template in JSX + doi from the NDE API',
      ),
    ]);
  }
  console.log(
    `resolved ${resolver.size()} sites from Strapi + the NDE API ` +
      `(${sourceNames.length} source names)`,
  );
};

// --------------------------------------------- statically resolvable values
/**
 * Values that are already in the repo, just behind a conditional or a prop.
 * Conditionals resolve to every branch; prop pass-throughs to their callers.
 */
const registerStaticValues = () => {
  const both = (file: string, line: number, values: string[], src: string) =>
    register(
      file,
      line,
      values.map(copy => ({ copy, source: src })),
    );
  const CONDITIONAL = 'both branches of a conditional hardcoded in JSX';
  const CALLERS = 'literal passed by each caller';
  const REFD = 'text of the referenced element';

  // The filter names in src/views/search/components/filters/config.ts. Several
  // aria-labels interpolate one of these, which makes them fully enumerable.
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

  // Shared components whose aria-label is entirely caller-supplied are NOT
  // resolved here: every caller is already its own row in this inventory, so
  // repeating the literals at the definition site would triple the sheet
  // without adding information. Their `source` column names the callers.

  // --- global chrome
  both(
    `${NAV}/nav-layout.tsx`,
    63,
    ['Open navigation menu', 'Close navigation menu'],
    CONDITIONAL,
  );
  both(
    `${NAV}/nav-dropdown-item.tsx`,
    129,
    ['Search', 'About', 'Resources'].flatMap(l => [
      `Open ${l} dropdown`,
      `Close ${l} dropdown`,
    ]),
    'template in JSX + the dropdown labels in configs/site.config.json navigation.primary',
  );

  // --- inputs whose default lives in code
  both(
    'src/components/page-container/components/search/components/input.tsx',
    24,
    ['Search for resources'],
    'default prop value at input.tsx:18',
  );
  both(
    `${SRL}/pagination/index.tsx`,
    120,
    ['Select page'],
    'hardcoded fallback when the caller passes no ariaLabel',
  );

  // --- pass-throughs whose callers are NOT separate rows, so resolve here
  both(
    'src/components/copy-button/index.tsx',
    51,
    [
      'Copy',
      'Metadata copied!',
      'Copy Resource ID',
      'Resource ID Copied!',
      'Copy NCTID',
      'NCTID Copied!',
      'Copy DOI',
    ],
    `${CALLERS} as buttonText/copiedText`,
  );
  both(
    'src/pages/settings.tsx',
    185,
    [
      'Email Updates',
      'Feedback and Testing',
      'Beta features',
      'AI-assisted search',
    ],
    'the settings section config in the same file',
  );
  both(
    `${OBT}/ontology-search-list/toggle.tsx`,
    22,
    ['Expand list of selected search terms'],
    'default value of the label prop at toggle.tsx:9',
  );
  both(
    'src/views/saved/components/saved-table-section.tsx',
    181,
    ['Search saved queries', 'Search saved resources'],
    `${CALLERS} (src/pages/saved.tsx:116,144)`,
  );
  both(
    'src/views/saved/components/saved-table-section.tsx',
    193,
    ['Saved queries table', 'Saved resources table'],
    `${CALLERS} (src/pages/saved.tsx:117,145)`,
  );
  both(
    `${SRL}/toolbar/components/select-input.tsx`,
    32,
    ['Sort by:', 'Rows per page:'],
    `${CALLERS} (toolbar/index.tsx:85,99)`,
  );
  both(
    `${RS}/samples/components/SampleTable/index.tsx`,
    39,
    ['Samples'],
    'the sample section config in the same view',
  );

  // --- interpolated from the filter config, so fully enumerable
  both(
    'src/views/search/components/filters/components/filters-chart-toggle.tsx',
    26,
    FILTER_NAMES.flatMap(n => [
      `Add ${n} visualisation chart`,
      `Remove ${n} visualisation chart`,
    ]),
    'template in JSX + the filter names in filters/config.ts',
  );
  both(
    'src/views/search/components/filters/components/list.tsx',
    290,
    [
      'Search filters',
      ...FILTER_NAMES.map(n => `Search ${n.toLowerCase()} filters`),
    ],
    'filters.tsx:351 template + customize-filters-popover.tsx:42, over filters/config.ts',
  );
  for (const line of [126, 135]) {
    both(
      'src/components/select-and-order-popover/components/PopoverListItem.tsx',
      line,
      FILTER_NAMES.map(n => `Move ${n} ${line === 126 ? 'up' : 'down'}`),
      'template in JSX + item.title, which is the filter name (customize-filters-popover.tsx:25)',
    );
  }

  // --- conditionals
  both(
    `${DOCS}/sidebar/DocumentItem.tsx`,
    66,
    ['Loading'],
    `${CONDITIONAL} (undefined once loaded)`,
  );
  both(
    `${DOCS}/sidebar/DocumentItem.tsx`,
    90,
    ['Expand sections', 'Collapse sections'],
    CONDITIONAL,
  );
  both(
    `${DOCS}/sidebar/SidebarDesktop.tsx`,
    96,
    ['Loading'],
    `${CONDITIONAL} (undefined once loaded)`,
  );
  both(
    `${DOCS}/sidebar/TocItem.tsx`,
    92,
    ['Expand subsections', 'Collapse subsections'],
    CONDITIONAL,
  );
  both(
    'src/views/saved/table-config.tsx',
    93,
    ['Save query', 'Remove saved query'],
    CONDITIONAL,
  );
  both(
    'src/views/search/components/search-results-header/index.tsx',
    108,
    ['Save this search', 'Remove search from saved searches'],
    CONDITIONAL,
  );
  both(
    'src/views/search/components/summary/index.tsx',
    123,
    ['Expand', 'Collapse'],
    CONDITIONAL,
  );
  both(
    'src/views/search/components/summary/components/visualization-card/card-header.tsx',
    49,
    ['Expand chart to modal view', 'Remove chart from display.'],
    CALLERS,
  );
  both(
    'src/views/search/components/summary/components/visualization-card/chart-picker.tsx',
    15,
    ['Chart type'],
    `${CONDITIONAL}; the other branch is \`Chart type for <label>\``,
  );
  both(
    'src/components/visualizations/bar/index.tsx',
    227,
    ['Bar chart'],
    `${CONDITIONAL}; the other branches use the caller's title/label`,
  );

  // --- search tabs
  both(
    'src/views/search/components/layout/tabs.tsx',
    53,
    [
      'Resource Catalogs',
      'Datasets',
      'Disease Overviews',
      'Tools',
      'Samples',
      'Data Collections',
    ],
    'the tab labels in src/views/search/config/tabs.ts',
  );

  // --- icon glyph titles, surfaced through the icon wrapper
  const glyphTitles = [
    'Icon for BAM type files.',
    'Empty, no data available.',
    'Icon for FASTA type files.',
  ];
  const GLYPH_DEFAULT = 'hardcoded default, overridable via the title prop';
  both(
    'src/components/icon/components/glyph.tsx',
    26,
    [glyphTitles[0]],
    GLYPH_DEFAULT,
  );
  both(
    'src/components/icon/components/glyph.tsx',
    39,
    [glyphTitles[1]],
    GLYPH_DEFAULT,
  );
  both(
    'src/components/icon/components/glyph.tsx',
    51,
    [glyphTitles[2]],
    GLYPH_DEFAULT,
  );
  // The icon wrapper's aria-label is the caller's `title` prop, not the glyph
  // default. These are the titles actually passed anywhere in the app.
  const iconTitles = [
    'bam file type',
    'fasta file type',
    'Empty, no data available.',
  ];
  const ICON_TITLE_CALLERS =
    'title prop passed by src/components/table/helpers.tsx:36,47 and ' +
    'src/components/empty/index.tsx:50';
  both('src/components/icon/index.tsx', 92, iconTitles, ICON_TITLE_CALLERS);
  both('src/components/icon/index.tsx', 104, iconTitles, ICON_TITLE_CALLERS);
  both(
    'src/components/icon/index.tsx',
    101,
    iconTitles,
    `${REFD} - the <span id={id}>{title}</span> at icon/index.tsx:84, i.e. the ` +
      'same title prop',
  );

  // --- aria-labelledby: the real accessible name is the referenced element's text
  both(
    'src/components/empty/index.tsx',
    42,
    ['Empty, no data available.'],
    REFD,
  );
  both(
    `${ADV}/Search/components/FieldSelect/index.tsx`,
    255,
    ['Select field'],
    REFD,
  );
  both(
    `${ADV}/SortableWithCombine/components/TreeItem/components/EditableContent/SearchLabel.tsx`,
    46,
    ['Select field'],
    REFD,
  );
  both(`${ADV}/EditableQueryText/index.tsx`, 281, ['Edit query input'], REFD);
  both(
    `${SRL}/toolbar/components/view-mode-radio.tsx`,
    34,
    ['View mode:'],
    REFD,
  );
  both(
    'src/views/home/components/LandingPageCards/Card.tsx',
    22,
    ['Diseases and Conditions', 'NIAID-Funded Programs'],
    `${REFD} (the card headings in data.tsx)`,
  );

  // --- dead code: no importer, so nothing is ever rendered. State that rather
  // than leaving the expression in the cell.
  const NEVER = '(NEVER RENDERS - component has no importer in src/)';
  both(
    'src/components/visualizations/pie/index.tsx',
    543,
    [NEVER],
    UNUSED_COMPONENT,
  );
  both(
    'src/components/visualizations/pie/index.tsx',
    546,
    [NEVER],
    UNUSED_COMPONENT,
  );
  both(
    'src/components/select/components/Select.tsx',
    116,
    [NEVER],
    UNUSED_COMPONENT,
  );

  // --- genuinely per-record. These show the shape of the sentence with a real
  // term substituted; the number/term itself varies per record, so they are
  // marked as examples rather than presented as the value.
  const example = (copy: string, src: string): Resolved => ({
    copy,
    source: `${src} - illustrative: the interpolated part varies per record`,
    isExample: true,
  });
  register(`${OBT}/tree/components/tree-node.tsx`, 257, [
    example(
      'Show all children of Homininae',
      'template in JSX + node.label from the ontology API',
    ),
  ]);
  register(`${OBT}/tree/components/tree-node.tsx`, 333, [
    example(
      'Remove Homininae from search list',
      'template in JSX + node.label from the ontology API',
    ),
    example(
      'Search portal for resources related to Homininae',
      'template in JSX + node.label from the ontology API',
    ),
  ]);
  register(`${OBT}/ontology-search-list/index.tsx`, 186, [
    example(
      'remove Homininae from search',
      'template in JSX + the selected search term',
    ),
  ]);
  register('src/components/carousel/components/CarouselControls.tsx', 60, [
    example(
      'Carousel progress: 40% complete',
      'template in JSX, value tracks scroll position',
    ),
  ]);
  register('src/components/carousel/components/CarouselControls.tsx', 83, [
    example(
      'carousel indicator 2 of 5 (current)',
      'template in JSX, value tracks scroll position',
    ),
  ]);
  for (const [file, line, id] of [
    [`${VIZ}/bar-chart.tsx`, 219, 'coa-stacked-title'],
    [`${VIZ}/stacked-bar-chart.tsx`, 159, 'coa-stacked-title'],
    [`${VIZ}/donut-chart.tsx`, 223, 'donut-chart-title'],
  ] as [string, number, string][]) {
    register(file, line, [
      example(
        'Pathogen Species',
        `${REFD} (<p id='${id}'>{title}</p>), the title being supplied per chart`,
      ),
    ]);
  }
  register(`${VIZ}/treemap-chart.tsx`, 176, [
    example(
      'Pathogen Species',
      `${REFD}, via the generated id at treemap-chart.tsx:112`,
    ),
  ]);
  register(`${VIZ}/treemap-chart.tsx`, 234, [
    example(
      'Plasmodium falciparum, 1,204 items',
      'template in JSX + term/count from the NDE API',
    ),
  ]);
  register(`${VIZ}/stacked-bar-chart.tsx`, 275, [
    example(
      'Plasmodium falciparum: 1,204 results',
      'template in JSX + label/count from the NDE API',
    ),
  ]);
};

// ------------------------------------------------------------------- writing
const writeAltCsv = async () => {
  const file = path.join(OUT_DIR, 'alt-text-audit.csv');
  let out = csvLine([
    'route',
    'file path',
    'image path',
    'image file name',
    'alt-text copy',
    'alt-text source',
    'scope',
    'line',
    'alt type',
    'retrieved',
  ]);
  let count = 0;
  for (const r of altRows) {
    for (const v of rowsFor(r)) {
      // Only fall back to the entry's `image` for unresolved rows: it is a
      // template, so a resolved value that names no image of its own (a summary
      // row, or a statement about a path that renders nothing) must show blank
      // rather than leak `${NEXT_PUBLIC_STRAPI_API_URL}${image.url}`.
      const image = v ? v.image ?? '' : r.image;
      for (const route of r.routes) {
        out += csvLine([
          route,
          r.file,
          image,
          basename(image),
          v ? v.copy : r.copy,
          v?.source ?? r.source,
          r.scope,
          r.line,
          suffix(v, r.altType),
          v?.retrieved ?? '',
        ]);
        count++;
      }
    }
  }
  await fs.writeFile(file, out);
  console.log(`${file}: ${count} rows`);
};

const writeAriaCsv = async () => {
  const file = path.join(OUT_DIR, 'aria-label-audit.csv');
  let out = csvLine([
    'route',
    'file path',
    'line',
    'element / component',
    'attribute',
    'label copy',
    'label source',
    'scope',
    'value kind',
    'retrieved',
  ]);
  let count = 0;
  // Route-outer, because a pass-through's real value depends on the route.
  for (const r of ariaRows) {
    for (const route of r.routes) {
      for (const v of capped(valuesFor(r, route))) {
        out += csvLine([
          route,
          r.file,
          r.line,
          r.element,
          r.attribute,
          v ? v.copy : r.copy,
          v?.source ?? r.source,
          r.scope,
          // An unresolved row is only an "expression" if its copy actually is
          // one; most are plain hardcoded strings.
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
    console.log('Generating accessibility audit spreadsheets...');
    await fs.mkdir(OUT_DIR, { recursive: true });
    registerStaticValues();
    await registerFetchedValues();
    resolver.index(ariaRows);
    resolver.assertNoSharedKeys([...altRows, ...ariaRows]);
    await writeAltCsv();
    await writeAriaCsv();

    // Distinct source sites, for reconciling against a grep of `src/`.
    console.log(`distinct alt sites: ${countSites(altRows)}`);
    console.log(`distinct aria sites: ${countSites(ariaRows)}`);
  } catch (err: any) {
    console.error('Failed to generate audit spreadsheets:', err.message);
    process.exit(1);
  }
};

main();
