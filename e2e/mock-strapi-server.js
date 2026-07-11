/**
 * Lightweight mock Strapi CMS server for Playwright a11y tests.
 *
 * Some routes fetch data from Strapi in `getStaticProps` (server-side), which
 * Playwright's `page.route` cannot intercept. This server provides deterministic
 * fixture responses for those endpoints so that a11y tests never depend on a
 * live CMS.
 *
 * Started automatically by Playwright via the `webServer` array in
 * `playwright.config.ts`. The Next.js dev server's `NEXT_PUBLIC_STRAPI_API_URL`
 * is pointed here so both server-side (`getStaticProps`) and client-side
 * (`useQuery` refetch) calls hit these fixtures.
 *
 * Port: MOCK_STRAPI_PORT env var, defaults to 1337.
 */

const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.MOCK_STRAPI_PORT) || 1337;

// ---------------------------------------------------------------------------
// Fixtures — minimal but structurally complete payloads.
// ---------------------------------------------------------------------------

const NEWS_FIXTURE = [
  {
    id: 1,
    name: 'Mock News Report',
    slug: 'news-report-mock-a11y-fixture',
    subtitle: null,
    shortDescription: 'A deterministic news fixture for accessibility testing.',
    description: 'Full description of the mock news report used in a11y scans.',
    image: null,
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    categories: null,
  },
];

const EVENTS_FIXTURE = [
  {
    id: 1,
    name: 'Mock Upcoming Event',
    slug: 'mock-upcoming-event',
    subtitle: null,
    shortDescription:
      'A deterministic event fixture for accessibility testing.',
    description: 'Full description of the mock event used in a11y scans.',
    image: null,
    eventDate: '2027-12-01',
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    categories: null,
  },
];

const FEATURES_FIXTURE = [
  {
    id: 1,
    title: 'Mock Feature Page',
    abstract: 'A deterministic feature fixture for accessibility testing.',
    content: 'Full content of the mock feature page used in a11y scans.',
    subtitle: 'Mock subtitle',
    slug: 'mock-feature-a11y',
    thumbnail: null,
    banner: null,
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    categories: null,
  },
];

const NOTICES_FIXTURE = [];

// Disease pages (src/pages/diseases/[[...slug]].tsx). `getStaticPaths` +
// `getStaticProps` run SERVER-SIDE at build time and 404 the route on failure,
// so a static export only emits `/diseases/<slug>` if that slug is returned
// here. This server ignores query strings, so the same collection answers both
// the list query (`fetchAllDiseasePages`) and the by-slug query
// (`fetchDiseaseBySlug`, which reads `data[0]`) — hence `asthma` is `data[0]`,
// matching the slug diseases.spec.ts navigates to. Fields are render-safe:
// `image` is optional-chained and `processDiseaseDescription` guards undefined.
const DISEASES_FIXTURE = [
  {
    id: 1,
    title: 'Asthma',
    topic: 'Asthma',
    slug: 'asthma',
    query: { q: 'asthma' },
    image: null,
    subtitle: 'A deterministic disease fixture for accessibility testing.',
    description:
      'Full description of the mock disease page used in a11y scans.',
    contacts: [],
    externalLinks: [],
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

// Knowledge-center docs (src/pages/knowledge-center/[[...slug]].tsx). Same
// build-time constraint: `getStaticPaths` returns zero paths (dropping the
// WHOLE tree, including the bare index) when the docs list is empty, so this
// MUST be non-empty and include the slug knowledge-center.spec.ts navigates to
// (`frequently-asked-questions`). `getStaticProps` reads `data[0]`.
const DOCS_FIXTURE = [
  {
    id: 1,
    name: 'Frequently Asked Questions',
    slug: 'frequently-asked-questions',
    subtitle: 'A deterministic docs fixture for accessibility testing.',
    description:
      'Full content of the mock documentation page used in a11y scans.',
    category: {
      id: 1,
      name: 'General',
      publishedAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
    },
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

// Knowledge-center index categories (client-side `fetchCategories`).
const CATEGORIES_FIXTURE = [
  {
    id: 1,
    name: 'General',
    publishedAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    docs: [
      {
        id: 1,
        name: 'Frequently Asked Questions',
        slug: 'frequently-asked-questions',
        description: 'A deterministic docs fixture for accessibility testing.',
      },
    ],
  },
];

// Map pathname → fixture data. Query parameters are ignored, so one fixture per
// endpoint answers every query variation (list / filter-by-slug / fields-only).
const ROUTES = {
  '/api/news-reports': NEWS_FIXTURE,
  '/api/events': EVENTS_FIXTURE,
  '/api/features': FEATURES_FIXTURE,
  '/api/notices': NOTICES_FIXTURE,
  '/api/diseases': DISEASES_FIXTURE,
  '/api/docs': DOCS_FIXTURE,
  '/api/categories': CATEGORIES_FIXTURE,
};

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  // CORS headers — required for browser-side refetches from the Next.js origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight.
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  // Per-request logging is noisy during a full `next build` (getStaticProps
  // hits these endpoints for every generated route). Gate it behind a flag.
  if (process.env.MOCK_STRAPI_DEBUG) {
    console.log(`[mock-strapi] ${req.method} ${pathname}`);
  }

  const fixture = ROUTES[pathname];
  if (fixture) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: fixture }));
  } else if (pathname.startsWith('/api/')) {
    // Unknown Strapi endpoints get an empty collection so pages whose
    // `getStaticProps` fetches from Strapi don't crash with a 404.
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: [] }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[mock-strapi] listening on ${PORT}`);
});
