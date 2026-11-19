/**
 * Saved page performance harness.
 *
 * Compares the Saved page's table implementations (the legacy virtualized
 * `Table` against the native `DataTable`) under identical conditions, the way
 * `repository-matcher.perf.mjs` does for the Repository Matcher (see README.md
 * for the method and the acceptance criteria):
 *
 *   - production static exports (`yarn build:a11y` → `out/`) served by `serve`
 *   - the same data for every build: the user-data endpoints are mocked (120
 *     saved queries and 120 saved resources); the resources are real records
 *     recorded once from the production API into `.cache/`
 *   - Chromium, CPU throttled with --throttle
 *   - builds measured interleaved: each round runs every build once,
 *     alternating which goes first, so they all see the same machine state
 *
 *   node e2e/perf/saved.perf.mjs \
 *     --builds legacy=http://localhost:3201,native=http://localhost:3202 \
 *     --throttle 4 --label saved-4x
 *
 * Results are written to e2e/perf/results/<label>.json (gitignored).
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(HERE, '.cache');
const RESULTS_DIR = path.join(HERE, 'results');
const RESOURCES_CACHE = path.join(CACHE_DIR, 'saved-resources.json');
const RESOURCES_URL =
  'https://api.data.niaid.nih.gov/v1/query?q=influenza&size=120' +
  '&fields=_id,name,@type,includedInDataCatalog.name,dateModified';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, all) => {
    if (arg.startsWith('--')) acc.push([arg.slice(2), all[i + 1]]);
    return acc;
  }, []),
);
const BUILDS = (
  args.builds || 'legacy=http://localhost:3201,native=http://localhost:3202'
)
  .split(',')
  .map(pair => {
    const [name, base] = pair.split('=');
    return { name, base };
  });
const LABEL = args.label || 'saved';
const RUNS = Number(args.runs || 5);
const THROTTLE = Number(args.throttle || 4);
const [VW, VH] = (args.viewport || '1440x900').split('x').map(Number);

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

/* ------------------------------------------------------------------------- */
/* Data                                                                       */
/* ------------------------------------------------------------------------- */

if (!fs.existsSync(RESOURCES_CACHE)) {
  const response = await fetch(RESOURCES_URL);
  const body = await response.text();
  fs.writeFileSync(
    RESOURCES_CACHE,
    JSON.stringify({
      recordedFrom: RESOURCES_URL,
      recordedAt: new Date(),
      body,
    }),
  );
  console.log(`recorded saved resources (${body.length} bytes)`);
}
const HITS = JSON.parse(
  JSON.parse(fs.readFileSync(RESOURCES_CACHE, 'utf8')).body,
).hits.map(
  ({ _id, name, '@type': type, includedInDataCatalog, dateModified }) => ({
    _id,
    name,
    '@type': type,
    includedInDataCatalog,
    dateModified,
  }),
);

const METADATA_CACHE = path.join(CACHE_DIR, 'metadata.json');
const METADATA = fs.existsSync(METADATA_CACHE)
  ? JSON.parse(fs.readFileSync(METADATA_CACHE, 'utf8')).body
  : null;

// Deterministic timestamps, a few hours apart, over the last months.
const savedAt = index =>
  new Date(Date.UTC(2026, 9, 30) - index * 7.3 * 3600 * 1000).toISOString();

const SAVED_DATASETS = HITS.map((hit, index) => ({
  dataset_id: hit._id,
  name: hit.name,
  saved_at: savedAt(index),
}));

const TERMS = [
  'asthma',
  '"HIV" OR "AIDS"',
  'influenza vaccine',
  'malaria',
  'tuberculosis',
  'covid-19 long term outcomes',
  'single cell RNA-seq',
  'antimicrobial resistance',
  'dengue',
  'Staphylococcus aureus',
  'mouse model',
  'immune response',
];
const FILTER_SETS = [
  {},
  { date: ['2000-01-01', '2026-12-31'] },
  { '@type': ['Dataset'] },
  {
    'includedInDataCatalog.name': ['Zenodo', 'Figshare'],
    date: ['2015-01-01', '2026-12-31'],
  },
  {
    'healthCondition.name.raw': ['asthma'],
    'infectiousAgent.displayName.raw': ['Influenza A virus'],
    '@type': ['Dataset', 'ComputationalTool'],
  },
];
const SAVED_QUERIES = Array.from({ length: 120 }, (_, index) => {
  const term = TERMS[index % TERMS.length];
  const query = `${term} ${Math.floor(index / TERMS.length) + 1}`;
  return {
    query,
    name: query,
    total: ((index * 7919) % 250000) + 3,
    filters: FILTER_SETS[index % FILTER_SETS.length],
    saved_at: savedAt(index),
  };
});

// A word that matches some, but not all, of the resource names.
const SEARCH_TERM = ['sequencing', 'genome', 'vaccine', 'mouse', 'human'].find(
  term => {
    const n = HITS.filter(h => h.name.toLowerCase().includes(term)).length;
    return n >= 5 && n <= 60;
  },
);

const USER = {
  username: 'perf-user',
  oauth_provider: 'GitHub',
  name: 'Perf User',
  email: 'perf.user@example.org',
  organization: 'NIAID perf fixture',
};

const json = (route, body) => {
  const origin = route.request().headers().origin;
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: origin
      ? {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
        }
      : {},
    body: JSON.stringify(body),
  });
};

/** Routes for one page load; the favourites are per context. */
const makeRouteHandler = () => {
  let datasets = [...SAVED_DATASETS];
  let searches = [...SAVED_QUERIES];
  const profile = () => ({
    ...USER,
    linked_accounts: [],
    favorite_searches: searches,
    favorite_datasets: datasets,
    ai_toggle_preference: false,
    beta: false,
    contact_preference: false,
    feedback_preference: false,
    onboarding_complete: true,
    created: '2026-03-11T19:36:34+00:00',
    updated: '2026-03-11T20:24:13+00:00',
  });

  return async route => {
    const request = route.request();
    const url = new URL(request.url());
    const isLocal =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    // Strapi is baked as localhost:1337 in the a11y build: no CMS content.
    if (isLocal && url.port === '1337') return json(route, { data: [] });
    if (isLocal) return route.continue();

    const method = request.method();
    if (method === 'OPTIONS') return json(route, {});
    const p = url.pathname;
    if (p.endsWith('/user_info')) return json(route, USER);
    if (p.endsWith('/xsrf_token')) return json(route, { xsrf_token: 'perf' });
    if (p.endsWith('/user/data/favorites/datasets')) {
      const body = request.postDataJSON() ?? {};
      if (method === 'DELETE') {
        datasets = datasets.filter(d => d.dataset_id !== body.dataset_id);
      } else if (method === 'POST') {
        datasets = [...datasets, body];
      }
      return json(route, { favorite_datasets: datasets });
    }
    if (p.endsWith('/user/data/favorites/searches')) {
      const body = request.postDataJSON() ?? {};
      if (method === 'DELETE') {
        searches = searches.filter((_, i) => i !== body.index);
      } else if (method === 'POST') {
        searches = [...searches, body];
      }
      return json(route, { favorite_searches: searches });
    }
    if (p.endsWith('/user/data')) return json(route, profile());
    if (/\/v1\/query$/.test(p) && method === 'POST') return json(route, HITS);
    // The page also reads /metadata; replay the production response the
    // Repository Matcher harness recorded, if it's there.
    if (/\/v1\/metadata$/.test(p) && METADATA) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: METADATA,
      });
    }
    return route.abort(); // analytics, fonts, anything else
  };
};

/* ------------------------------------------------------------------------- */
/* Page-side recorders (as in repository-matcher.perf.mjs)                    */
/* ------------------------------------------------------------------------- */

const INIT_SCRIPT = () => {
  window.__perf = { longtasks: [], events: [] };
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {
      window.__perf.longtasks.push({
        start: e.startTime,
        duration: e.duration,
      });
    }
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {
      window.__perf.events.push({
        name: e.name,
        start: e.startTime,
        duration: e.duration,
      });
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });

  /*
  Implementation-agnostic probes. The legacy table is a div[role=table] named
  by `aria-label` ("Saved resources table"); the native one a <table> named by
  its caption ("Saved resources").
  */
  const findTable = name =>
    [...document.querySelectorAll('table, [role="table"]')].find(t =>
      (
        t.getAttribute('aria-label') ??
        t.querySelector('caption')?.textContent ??
        ''
      )
        .toLowerCase()
        .startsWith(name),
    );
  // The element the table's rows scroll in.
  const scrollerOf = table => {
    const candidates = [table, ...table.querySelectorAll('*')];
    for (
      let el = table.parentElement;
      el && el !== document.body;
      el = el.parentElement
    ) {
      candidates.push(el);
    }
    return candidates.find(el =>
      /(auto|scroll)/.test(getComputedStyle(el).overflowY),
    );
  };
  // "Page x of y" of each pager, in page order: [queries, resources].
  const pagerPages = () =>
    [...document.querySelectorAll('span, p')]
      .map(el => el.textContent.trim())
      .filter(text => /^Page \d+ of \d+$/.test(text));
  const firstLinkText = table => table?.querySelector('a')?.textContent ?? null;
  window.__saved = { findTable, scrollerOf, pagerPages, firstLinkText };
};

const windowStats = (page, t0, t1) =>
  page.evaluate(
    ([from, to]) => {
      const tasks = window.__perf.longtasks.filter(
        t => t.start >= from && t.start <= to,
      );
      const events = window.__perf.events.filter(
        e => e.start >= from && e.start <= to,
      );
      return {
        tbt: tasks.reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0),
        longestTask: tasks.reduce((max, t) => Math.max(max, t.duration), 0),
        longTasks: tasks.length,
        inp: events
          .filter(e => /click|pointer|key|input/.test(e.name))
          .reduce((max, e) => Math.max(max, e.duration), 0),
      };
    },
    [t0, t1],
  );

const now = page => page.evaluate(() => performance.now());
const afterNextPaint = page =>
  page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(performance.now())),
        ),
      ),
  );

async function measure(page, action, until, untilArg) {
  const t0 = await now(page);
  await action();
  await page.waitForFunction(until, untilArg, {
    timeout: 60_000,
    polling: 'raf',
  });
  const t1 = await afterNextPaint(page);
  return { latency: t1 - t0, ...(await windowStats(page, t0, t1)) };
}

async function measureFrames(page, action) {
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = t => {
      window.__frames.push(t - last);
      last = t;
      if (window.__frames.recording !== false) requestAnimationFrame(tick);
    };
    window.__frames.recording = true;
    requestAnimationFrame(tick);
  });
  const t0 = await now(page);
  await action();
  const t1 = await afterNextPaint(page);
  const frames = await page.evaluate(() => {
    window.__frames.recording = false;
    return window.__frames.slice(1);
  });
  const sorted = [...frames].sort((a, b) => a - b);
  return {
    frames: frames.length,
    p95Frame: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    maxFrame: sorted[sorted.length - 1] ?? 0,
    dropped1: frames.filter(f => f > 17).length,
    dropped2: frames.filter(f => f > 34).length,
    jankFrames: frames.filter(f => f > 50).length,
    ...(await windowStats(page, t0, t1)),
  };
}

/* ------------------------------------------------------------------------- */
/* Scenarios                                                                  */
/* ------------------------------------------------------------------------- */

const RESOURCES = 'saved resources';
const QUERIES = 'saved queries';
// Pager index in page order.
const PAGER = { [QUERIES]: 0, [RESOURCES]: 1 };

// The table's rows are on screen: settled (the native table marks a pending
// background render with aria-busy) and the pager shows `pageText`.
const settled = ([name, pagerIndex, pageText, minScrollHeight]) => {
  const { findTable, scrollerOf, pagerPages } = window.__saved;
  const table = findTable(name);
  if (!table || table.getAttribute('aria-busy') === 'true') return false;
  if (pageText && pagerPages()[pagerIndex] !== pageText) return false;
  if (
    minScrollHeight &&
    !(scrollerOf(table)?.scrollHeight >= minScrollHeight)
  ) {
    return false;
  }
  return true;
};

const firstLinkChanged = ([name, before]) => {
  const { findTable, firstLinkText } = window.__saved;
  const table = findTable(name);
  return (
    !!table &&
    table.getAttribute('aria-busy') !== 'true' &&
    firstLinkText(table) !== before
  );
};

const tableLocator = (page, name) =>
  page.getByRole('table', { name: new RegExp(`^${name}`, 'i') });

async function wheelOverRows(page, name) {
  const cell = tableLocator(page, name)
    .locator('tbody td, [role="cell"]')
    .nth(1);
  const box = await cell.boundingBox();
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + Math.min(box.height / 2, 30),
  );
  return measureFrames(page, async () => {
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(32);
    }
  });
}

async function scrollTableToTop(page, name) {
  await page.evaluate(n => {
    const { findTable, scrollerOf } = window.__saved;
    const scroller = scrollerOf(findTable(n));
    if (scroller) scroller.scrollTop = 0;
  }, name);
  await page.waitForTimeout(300);
}

// Name, descending: the legacy header has separate ascending/descending
// buttons; the native one a single button that flips the current direction.
async function sortNameDescending(page, name) {
  const header = tableLocator(page, name)
    .locator('th, [role="columnheader"]')
    .filter({ hasText: /^name/i })
    .first();
  const buttons = header.locator('button');
  const button = (await buttons.count()) > 1 ? buttons.nth(1) : buttons.first();
  const before = await page.evaluate(
    n => window.__saved.firstLinkText(window.__saved.findTable(n)),
    name,
  );
  return measure(page, () => button.click(), firstLinkChanged, [name, before]);
}

async function setPageSize100(page, name) {
  const select = page
    .getByRole('combobox', { name: 'Select number of rows per page' })
    .nth(PAGER[name]);
  // A real key press (End picks the last option, 100), not `selectOption`:
  // its synthetic events aren't trusted, so they'd report no INP.
  await select.focus();
  return measure(
    page,
    () => page.keyboard.press('End'),
    settled,
    // 100 rows of at least 45px; a virtualized list reports its estimated
    // total height as soon as it knows the row count.
    [name, PAGER[name], 'Page 1 of 2', 4000],
  );
}

async function runOnce(browser, base) {
  const context = await browser.newContext({
    viewport: { width: VW, height: VH },
  });
  await context.route('**/*', makeRouteHandler());
  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  const result = {};

  // 1. Initial render: both tables' first pages, with resource metadata.
  await page.goto(`${base}/saved`, { waitUntil: 'commit' });
  await page.waitForFunction(
    ([q, r]) => {
      const { findTable, pagerPages } = window.__saved;
      const resources = findTable(r);
      return (
        !!findTable(q)?.querySelector('a') &&
        !!resources?.querySelector('a') &&
        resources.getAttribute('aria-busy') !== 'true' &&
        // Metadata arrived: a type is shown.
        /Dataset|Sample|Resource Catalog/.test(resources.textContent) &&
        pagerPages().length === 2
      );
    },
    [QUERIES, RESOURCES],
    { timeout: 120_000, polling: 'raf' },
  );
  const ready = await afterNextPaint(page);
  result.load = { latency: ready, ...(await windowStats(page, 0, ready)) };
  await page.waitForTimeout(1500);
  result.fontsReadyBeforeInteractions = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.status === 'loaded' ? 1 : 0;
  });

  // 2. Resources: 100 rows per page, scroll, sort.
  result.pageSize = await setPageSize100(page, RESOURCES);
  result.domNodes = await page.evaluate(
    () => document.getElementsByTagName('*').length,
  );
  await page.waitForTimeout(500);
  result.scrollY = await wheelOverRows(page, RESOURCES);
  await scrollTableToTop(page, RESOURCES);
  result.sort = await sortNameDescending(page, RESOURCES);
  await page.waitForTimeout(500);

  // 3. Resources: search, clear, search again (warm).
  const search = page.getByRole('textbox', { name: /search saved resources/i });
  const searched = [RESOURCES, PAGER[RESOURCES], 'Page 1 of 1', 0];
  const cleared = [RESOURCES, PAGER[RESOURCES], 'Page 1 of 2', 0];
  result.searchFilter = await measure(
    page,
    () => search.fill(SEARCH_TERM),
    settled,
    searched,
  );
  result.searchClear = await measure(
    page,
    () => search.fill(''),
    settled,
    cleared,
  );
  result.searchFilterWarm = await measure(
    page,
    () => search.fill(SEARCH_TERM),
    settled,
    searched,
  );
  await search.fill('');
  await page.waitForFunction(settled, cleared);
  await page.waitForTimeout(500);

  // 4. Resources: un-save the first row.
  const bookmark = tableLocator(page, RESOURCES)
    .getByRole('button', { name: 'Remove from saved' })
    .first();
  result.bookmark = await measure(
    page,
    () => bookmark.click(),
    ([name, BOOKMARK_BUTTON]) => {
      // The flipped button may be a new element: look in the first row again
      // (the first with a bookmark; the header row has none).
      const rows = window.__saved
        .findTable(name)
        ?.querySelectorAll('tr, [role="row"]');
      const row = [...(rows ?? [])].find(r => r.querySelector(BOOKMARK_BUTTON));
      return !!row?.querySelector('button[aria-label="Save this resource"]');
    },
    [
      RESOURCES,
      'button:is([aria-label="Remove from saved"], [aria-label="Save this resource"])',
    ],
  );
  await page.waitForTimeout(500);

  // 5. Resources: page 2 (rows 101-120).
  const before = await page.evaluate(
    n => window.__saved.firstLinkText(window.__saved.findTable(n)),
    RESOURCES,
  );
  const next = page
    .getByRole('button', { name: 'Go to next page.' })
    .nth(PAGER[RESOURCES]);
  result.nextPage = await measure(
    page,
    () => next.click(),
    ([name, pagerIndex, firstBefore]) => {
      const { findTable, pagerPages, firstLinkText } = window.__saved;
      const table = findTable(name);
      return (
        pagerPages()[pagerIndex] === 'Page 2 of 2' &&
        table?.getAttribute('aria-busy') !== 'true' &&
        firstLinkText(table) !== firstBefore
      );
    },
    [RESOURCES, PAGER[RESOURCES], before],
  );

  // 6. Queries: 100 rows per page, scroll, sort.
  await page
    .getByRole('table', { name: /^saved queries/i })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  result.qPageSize = await setPageSize100(page, QUERIES);
  await page.waitForTimeout(500);
  result.qScrollY = await wheelOverRows(page, QUERIES);
  await scrollTableToTop(page, QUERIES);
  result.qSort = await sortNameDescending(page, QUERIES);

  await context.close();
  return result;
}

/* ------------------------------------------------------------------------- */

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

console.log(
  `search term "${SEARCH_TERM}"; ${SAVED_DATASETS.length} resources, ${SAVED_QUERIES.length} queries`,
);
const browser = await chromium.launch();
const runs = Object.fromEntries(BUILDS.map(b => [b.name, []]));
for (let i = 0; i < RUNS; i++) {
  const order = i % 2 ? [...BUILDS].reverse() : BUILDS;
  for (const build of order) {
    process.stdout.write(`round ${i + 1}/${RUNS} ${build.name}… `);
    runs[build.name].push(await runOnce(browser, build.base));
    console.log('done');
  }
}
await browser.close();

const summarize = buildRuns => {
  const summary = {};
  for (const scenario of Object.keys(buildRuns[0])) {
    const first = buildRuns[0][scenario];
    if (typeof first !== 'object') {
      summary[scenario] = median(buildRuns.map(r => r[scenario]));
      continue;
    }
    summary[scenario] = {};
    for (const metric of Object.keys(first)) {
      summary[scenario][metric] = Math.round(
        median(buildRuns.map(r => r[scenario]?.[metric] ?? 0)),
      );
    }
  }
  return summary;
};

const summaries = Object.fromEntries(
  Object.entries(runs).map(([name, buildRuns]) => [name, summarize(buildRuns)]),
);
fs.writeFileSync(
  path.join(RESULTS_DIR, `${LABEL}.json`),
  JSON.stringify(
    {
      label: LABEL,
      builds: BUILDS,
      runs: RUNS,
      throttle: THROTTLE,
      viewport: `${VW}x${VH}`,
      searchTerm: SEARCH_TERM,
      date: new Date(),
      summaries,
      raw: runs,
    },
    null,
    2,
  ),
);
for (const [name, summary] of Object.entries(summaries)) {
  console.log(
    `\n${LABEL} ${name} — medians over ${RUNS} runs, ${THROTTLE}x CPU`,
  );
  console.table(summary);
}
