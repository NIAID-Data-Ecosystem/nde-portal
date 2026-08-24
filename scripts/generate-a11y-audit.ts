import fs from 'fs/promises';
import path from 'path';

/**
 * Generates the alt-text and accessible-name audit spreadsheets.
 *
 * This is a hand-maintained inventory, not a parser: the file/line/copy of every
 * `alt=`, `aria-label`, `aria-labelledby` and inline-SVG `<title>` in `src/` is
 * recorded below, along with the routes that render it. The script's job is to
 * cross-join each entry against those routes so shared and global chrome appear
 * once per route without hand-copying rows.
 *
 * When you add or move one of those attributes, update the matching entry here.
 * The reconciliation check in docs/accessibility/README is the safety net: the
 * number of distinct (file, line) pairs must equal the grep count in `src/`.
 */

const OUT_DIR = 'docs/accessibility';

// ---------------------------------------------------------------- route sets
// Every route that renders PageContainer (i.e. all of them except /news, which
// is a client-side redirect to /updates with no UI of its own).
const ALL = [
  '/',
  '/404',
  '/about',
  '/advanced-search',
  '/changelog',
  '/disclaimer',
  '/faq',
  '/login',
  '/updates',
  '/ontology-browser',
  '/program-collections',
  '/repository-matcher',
  '/resources',
  '/saved',
  '/search',
  '/settings',
  '/sources',
  '/diseases',
  '/diseases/[slug]',
  '/features',
  '/features/[slug]',
  '/knowledge-center',
  '/knowledge-center/[...slug]',
];

const uniq = (routes: string[]) => Array.from(new Set(routes)).sort();

const HOME = ['/'];
const KC = ['/knowledge-center', '/knowledge-center/[...slug]'];
const SB = ['/404', '/about', '/resources', '/search']; // includeSearchBar
const SBKC = uniq([...SB, ...KC]);
const TOC = ['/diseases', '/features', '/program-collections', '/sources'];
const TABLE = ['/', '/repository-matcher', '/resources', '/saved', '/search'];
const DS = ['/diseases/[slug]'];
const AS = ['/advanced-search'];
const RES = ['/resources'];
const SEARCH = ['/search'];
const SAVED = ['/saved'];
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
const BOOKMARK = ['/resources', '/saved', '/search'];
const NONE = ['(none - component has no consumer)'];

const HARD = 'hardcoded in JSX';

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
  {
    routes: ALL,
    file: 'src/components/mdx/components/index.tsx',
    line: 376,
    image:
      '{src} - Strapi /uploads path prefixed with NEXT_PUBLIC_STRAPI_API_URL',
    copy: "{props.alt || ''} - author-supplied markdown alt, empty-string fallback",
    source: 'Strapi CMS - markdown image alt (author-supplied)',
    scope: 'global (any Strapi markdown, incl. page-container banner)',
    altType: 'dynamic-cms',
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

// Live CMS snapshot: the actual alternativeText values the news carousel served
// from the STAGING Strapi on 2026-08-24, harvested from the rendered / HTML.
// These are the only CMS-authored alt strings reviewable as copy; every other
// CMS-driven site renders client-side and returned nothing in the SSR HTML.
const SNAP =
  'live value from STAGING Strapi CMS (news.image.alternativeText), ' +
  'snapshot 2026-08-24 - edit in the CMS, not in code';
const STRAPI = 'https://data-staging.niaid.nih.gov/strapi/uploads/';
const NEWS_LIVE: [string, string][] = [
  ['Samples in the NIAID Data Ecosystem', 'samples_16x9_eedba0a207.png'],
  [
    'Image of BEI Resources in the NIAID Data Ecosystem',
    'bei_resources_16x9_d6e6ad8784.png',
  ],
  [
    'Image of NODE datasets in the NIAID Data Ecosystem',
    'node_16x9_c47eefea38.png',
  ],
  [
    'Screenshot of EMPIAR datasets in the Discovery Portal',
    'empiar_16x9_2ff32f2165.png',
  ],
  [
    'Screenshot of bookmarked resources in the NIAID Data Ecosystem',
    'user_accounts_16x9_686a9c56cd.png',
  ],
  [
    'Image of NIAID Data Ecosystem Repository Matcher',
    'repository_matchmaker_16x9_43c49753b0.png',
  ],
  [
    'ProteomeXchange datasets in the NIAID Data Ecosystem',
    'Proteome_Xchange_16x9_446a305e3a.png',
  ],
  [
    'Blueprint Series Webinar Registration Image',
    'gofair_webinar_16x9_7e11e599a7.png',
  ],
];

for (const [copy, file] of NEWS_LIVE) {
  altRows.push({
    routes: HOME,
    file: 'src/views/home/components/NewsCarousel.tsx',
    line: 173,
    image: STRAPI + file,
    copy,
    source: SNAP,
    scope: 'route-specific',
    altType: 'dynamic-cms (live value, snapshot)',
  });
}
altRows.push({
  routes: HOME,
  file: 'src/views/home/components/NewsCarousel.tsx',
  line: 173,
  image: '/assets/news-thumbnail.png',
  copy: 'News Thumbnail Image',
  source:
    'hardcoded fallback at NewsCarousel.tsx:138-142 - OBSERVED LIVE on 2 of 10 ' +
    'carousel cards on 2026-08-24, i.e. this generic fallback really does ship',
  scope: 'route-specific',
  altType: 'dynamic-cms (live value, snapshot)',
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
  {
    routes: ALL,
    file: 'src/components/mdx/components/index.tsx',
    line: 363,
    element: "Box as='video'",
    attribute: L,
    copy: '{alt || undefined}',
    source:
      'Strapi CMS - markdown image alt re-routed onto the video element (mdx/components/index.tsx:354)',
    scope: 'global (any Strapi markdown, incl. page-container banner)',
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
    element: 'nav',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'caller-supplied',
    scope: 'shared',
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
    routes: SELECT,
    file: 'src/components/select/components/Select.tsx',
    line: 116,
    element: 'Select',
    attribute: L,
    copy: '{ariaLabel}',
    source: 'caller-supplied by each popover/toolbar consumer',
    scope: 'shared',
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

// ------------------------------------------------------------------- writing
// RFC 4180: quote every field so the 250+ char alt strings (which contain
// commas) survive a round trip through Excel and Google Sheets.
const csvLine = (fields: (string | number)[]) =>
  fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',') + '\n';

const basename = (p: string) =>
  !p || p.startsWith('{') || p.startsWith('$')
    ? ''
    : p.replace(/\/$/, '').split('/').pop() ?? '';

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
  ]);
  let count = 0;
  for (const r of altRows) {
    for (const route of r.routes) {
      out += csvLine([
        route,
        r.file,
        r.image,
        basename(r.image),
        r.copy,
        r.source,
        r.scope,
        r.line,
        r.altType,
      ]);
      count++;
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
  ]);
  let count = 0;
  for (const r of ariaRows) {
    for (const route of r.routes) {
      out += csvLine([
        route,
        r.file,
        r.line,
        r.element,
        r.attribute,
        r.copy,
        r.source,
        r.scope,
      ]);
      count++;
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
    await writeAltCsv();
    await writeAriaCsv();

    // Distinct source sites, for reconciling against a grep of `src/`.
    const sites = (rows: { file: string; line: number }[]) =>
      new Set(rows.map(r => `${r.file}:${r.line}`)).size;
    console.log(`distinct alt sites: ${sites(altRows)}`);
    console.log(`distinct aria sites: ${sites(ariaRows)}`);
  } catch (err: any) {
    console.error('Failed to generate audit spreadsheets:', err.message);
    process.exit(1);
  }
};

main();
