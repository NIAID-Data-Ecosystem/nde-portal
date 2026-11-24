/**
 * Repository Matcher performance harness.
 *
 * Compares table implementations (e.g. the virtualized baseline against the
 * native-table pilot) under identical, realistic conditions:
 *
 *   - a production static export (`yarn build:a11y` → `out/`) served by `serve`
 *   - the live production API responses, recorded once into `.cache/` and
 *     replayed on every run, so every build sees byte-identical data
 *   - Chromium with 4x CPU throttling (override with --throttle)
 *
 * It measures initial render, vertical/horizontal scrolling and the table's
 * interactions, and prints medians over --runs fresh page loads. It is a
 * manual tool, not part of `playwright test` (the file name doesn't match the
 * spec pattern).
 *
 *   npx serve out --listen 3201 --no-clipboard &
 *   node e2e/perf/repository-matcher.perf.mjs --base http://localhost:3201 --label baseline
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
const PROD_API = 'https://api.data.niaid.nih.gov/v1';
// The virtualized baseline is a div[role=table] labelled by aria-label; the
// native DataTable a <table> named by its caption, inside `.nde-data-table`.
const TABLE_LABEL =
  ':is([aria-label="Repository matcher table"], .nde-data-table table)';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, all) => {
    if (arg.startsWith('--')) acc.push([arg.slice(2), all[i + 1]]);
    return acc;
  }, []),
);
const BASE = args.base || 'http://localhost:3201';
const LABEL = args.label || 'run';
const RUNS = Number(args.runs || 5);
const THROTTLE = Number(args.throttle || 4);
const [VW, VH] = (args.viewport || '1440x900').split('x').map(Number);

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

/* ------------------------------------------------------------------------- */
/* Network: replay recorded production API responses, block everything else  */
/* ------------------------------------------------------------------------- */

const cacheFile = pathname =>
  path.join(CACHE_DIR, `${pathname.replace(/[^a-z0-9]+/gi, '_')}.json`);

async function handleRoute(route) {
  const url = new URL(route.request().url());
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // Strapi is baked as localhost:1337 in the a11y build; nothing on this page
  // needs CMS content, so answer every CMS call with an empty collection.
  if (isLocal && url.port === '1337') {
    return route.fulfill({ json: { data: [] } });
  }
  if (isLocal) return route.continue();

  const apiMatch = url.pathname.match(/\/v1\/(query|metadata)/);
  if (!apiMatch) return route.abort(); // analytics, fonts, etc.

  // Keyed by endpoint only, so builds that order query params differently
  // still replay the same body. The recorded params are kept for reference.
  const file = cacheFile(apiMatch[1]);
  if (!fs.existsSync(file)) {
    const prodUrl = `${PROD_API}${url.pathname.replace(/^.*\/v1/, '')}${
      url.search
    }`;
    const response = await route.fetch({ url: prodUrl });
    const body = await response.text();
    fs.writeFileSync(
      file,
      JSON.stringify({ recordedFrom: prodUrl, recordedAt: new Date(), body }),
    );
    console.log(`  recorded ${apiMatch[1]} (${body.length} bytes)`);
  }
  const { body } = JSON.parse(fs.readFileSync(file, 'utf8'));
  return route.fulfill({ status: 200, contentType: 'application/json', body });
}

/* ------------------------------------------------------------------------- */
/* Page-side recorders                                                        */
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
};

/** Long-task and event-timing stats for the window [t0, t1]. */
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
        // INP-style: the slowest discrete input in the window, including input
        // delay, handlers and the paint that followed.
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

/** Run `action`, wait for `until` to hold, and report latency + main-thread cost. */
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

/** Frame-time stats while `action` runs. */
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
    // At 60 Hz a frame is due every 16.7 ms. Frames are bucketed by how many
    // display refreshes they missed: >17 ms missed one (a dropped frame),
    // >34 ms missed two or more, >50 ms ("jank") is a visible hitch.
    dropped1: frames.filter(f => f > 17).length,
    dropped2: frames.filter(f => f > 34).length,
    jankFrames: frames.filter(f => f > 50).length,
    ...(await windowStats(page, t0, t1)),
  };
}

/* ------------------------------------------------------------------------- */
/* Implementation-agnostic table probes                                       */
/* ------------------------------------------------------------------------- */

const TABLE = TABLE_LABEL;

const tablePopulated = label => {
  const table = document.querySelector(label);
  const counter = [...document.querySelectorAll('p, span')].find(el =>
    /^\d+ results$/.test(el.textContent?.trim() ?? ''),
  );
  return (
    !!table &&
    !!counter &&
    parseInt(counter.textContent, 10) > 0 &&
    table.querySelectorAll('a').length > 0
  );
};

const resultCount = () => {
  const counter = [...document.querySelectorAll('p, span')].find(el =>
    /^\d+ results$/.test(el.textContent?.trim() ?? ''),
  );
  return counter ? parseInt(counter.textContent, 10) : -1;
};

const firstBodyCell = label => {
  const table = document.querySelector(label);
  return table?.querySelector('tbody td, [role="rowgroup"] [role="cell"]');
};

async function scrollContainerCenter(page) {
  // Wheel over a body cell so the nearest scroll container receives it.
  const cell = page.locator(`${TABLE} tbody td, ${TABLE} [role="cell"]`).nth(1);
  const box = await cell.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + Math.min(box.height / 2, 40) };
}

/* ------------------------------------------------------------------------- */
/* Scenarios                                                                  */
/* ------------------------------------------------------------------------- */

async function runOnce(browser) {
  const context = await browser.newContext({
    viewport: { width: VW, height: VH },
  });
  await context.route('**/*', handleRoute);
  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });

  const result = {};

  // 1. Initial render: navigation start → populated table painted.
  await page.goto(`${BASE}/repository-matcher`, { waitUntil: 'commit' });
  await page.waitForFunction(tablePopulated, TABLE_LABEL, {
    timeout: 120_000,
    polling: 'raf',
  });
  const ready = await afterNextPaint(page);
  result.load = { latency: ready, ...(await windowStats(page, 0, ready)) };
  result.rows = await page.evaluate(resultCount);
  result.domNodes = await page.evaluate(
    () => document.getElementsByTagName('*').length,
  );
  // Let late effects (tooltips, measurement) settle before interacting, and
  // make sure web fonts are ready, so no interaction below pays for a font load.
  await page.waitForTimeout(1500);
  result.fontsReadyBeforeInteractions = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.status === 'loaded' ? 1 : 0;
  });

  // 2. Vertical scroll through the table.
  const center = await scrollContainerCenter(page);
  await page.mouse.move(center.x, center.y);
  result.scrollY = await measureFrames(page, async () => {
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(32);
    }
  });
  // 3. Horizontal scroll.
  result.scrollX = await measureFrames(page, async () => {
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(300, 0);
      await page.waitForTimeout(32);
    }
  });
  // Back to the top-left for the interactions.
  await page.evaluate(label => {
    const table = document.querySelector(label);
    let el = table;
    while (el && el !== document.body) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
      el = el.parentElement;
    }
    window.scrollTo(0, 0);
  }, TABLE_LABEL);
  await page.waitForTimeout(500);

  // 4. Sort by Name, descending (baseline: the "descending" arrow; native:
  //    a second click on the already-ascending Name header).
  const nameHeader = page
    .locator(`${TABLE} th, ${TABLE} [role="columnheader"]`)
    .filter({ hasText: /^name/i })
    .first();
  const nameButtons = nameHeader.locator('button');
  const sortButton =
    (await nameButtons.count()) > 1 ? nameButtons.nth(1) : nameButtons.first();
  const firstNameBefore = await page
    .locator(`${TABLE} a`)
    .first()
    .textContent();
  result.sort = await measure(
    page,
    () => sortButton.click(),
    ([label, before]) =>
      document.querySelector(label)?.querySelector('a')?.textContent !== before,
    [TABLE_LABEL, firstNameBefore],
  );

  // 5. Pin the first column (baseline: page checkbox; native: switch inside
  //    Customize Columns — opening the popover is not measured).
  const pinCheckbox = page.getByText('Pin first column', { exact: true });
  if (!(await pinCheckbox.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /customize columns/i }).click();
    await page.getByText('Pin first column', { exact: true }).waitFor();
  }
  result.pin = await measure(
    page,
    () => page.getByText('Pin first column', { exact: true }).click(),
    label => {
      const table = document.querySelector(label);
      const cell = table?.querySelector(
        'tbody td, [role="rowgroup"] [role="cell"]',
      );
      return !!cell && getComputedStyle(cell).position === 'sticky';
    },
    TABLE_LABEL,
  );
  await page.keyboard.press('Escape');

  // 6. Hide, then re-show, the Description column via Customize Columns.
  await page.getByRole('button', { name: /customize columns/i }).click();
  const descriptionToggle = page
    .getByRole('dialog')
    .getByText('Description', { exact: true });
  await descriptionToggle.waitFor();
  result.hideColumn = await measure(
    page,
    () => descriptionToggle.click(),
    ([label, want]) =>
      [
        ...document.querySelectorAll(
          `${label} th, ${label} [role="columnheader"]`,
        ),
      ].some(th => /^description/i.test(th.textContent.trim())) === want,
    [TABLE_LABEL, false],
  );
  result.showColumn = await measure(
    page,
    () => descriptionToggle.click(),
    ([label, want]) =>
      [
        ...document.querySelectorAll(
          `${label} th, ${label} [role="columnheader"]`,
        ),
      ].some(th => /^description/i.test(th.textContent.trim())) === want,
    [TABLE_LABEL, true],
  );
  await page.keyboard.press('Escape');

  // 7. Filter by search, then clear it (re-renders every row).
  const total = await page.evaluate(resultCount);
  const search = page.getByRole('textbox', { name: /search repositories/i });
  result.searchFilter = await measure(
    page,
    () => search.fill('sequencing'),
    before => {
      const counter = [...document.querySelectorAll('p, span')].find(el =>
        /^\d+ results$/.test(el.textContent?.trim() ?? ''),
      );
      return counter && parseInt(counter.textContent, 10) !== before;
    },
    total,
  );
  result.searchClear = await measure(
    page,
    () => search.fill(''),
    before => {
      const counter = [...document.querySelectorAll('p, span')].find(el =>
        /^\d+ results$/.test(el.textContent?.trim() ?? ''),
      );
      return counter && parseInt(counter.textContent, 10) === before;
    },
    total,
  );

  // 7b. The same search again ("warm"): any CSS the first keystroke inserted
  //     at runtime already exists, so this isolates the steady-state cost.
  result.searchFilterWarm = await measure(
    page,
    () => search.fill('sequencing'),
    before => {
      const counter = [...document.querySelectorAll('p, span')].find(el =>
        /^\d+ results$/.test(el.textContent?.trim() ?? ''),
      );
      return counter && parseInt(counter.textContent, 10) !== before;
    },
    total,
  );
  await search.fill('');
  await page.waitForFunction(before => {
    const counter = [...document.querySelectorAll('p, span')].find(el =>
      /^\d+ results$/.test(el.textContent?.trim() ?? ''),
    );
    return counter && parseInt(counter.textContent, 10) === before;
  }, total);
  await page.waitForTimeout(500);

  // 8. Expand the first truncated description.
  const showMore = page
    .locator(TABLE)
    .getByRole('button', { name: /^show more/i })
    .first();
  if (await showMore.count()) {
    result.expand = await measure(
      page,
      () => showMore.click(),
      label =>
        !!document
          .querySelector(label)
          ?.querySelector('[aria-expanded="true"]'),
      TABLE_LABEL,
    );
    // 8b. Expand a second description ("warm"): the expanded styles already
    //     exist after the first.
    const next = page
      .locator(TABLE)
      .getByRole('button', { name: /^show more/i })
      .first();
    if (await next.count()) {
      result.expandWarm = await measure(
        page,
        () => next.click(),
        label =>
          document
            .querySelector(label)
            ?.querySelectorAll('[aria-expanded="true"]').length >= 2,
        TABLE_LABEL,
      );
    }
  }

  await context.close();
  return result;
}

/* ------------------------------------------------------------------------- */

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const browser = await chromium.launch();
const runs = [];
for (let i = 0; i < RUNS; i++) {
  process.stdout.write(`run ${i + 1}/${RUNS}… `);
  runs.push(await runOnce(browser));
  console.log('done');
}
await browser.close();

const summary = {};
for (const scenario of Object.keys(runs[0])) {
  const first = runs[0][scenario];
  if (typeof first !== 'object') {
    summary[scenario] = median(runs.map(r => r[scenario]));
    continue;
  }
  summary[scenario] = {};
  for (const metric of Object.keys(first)) {
    summary[scenario][metric] = Math.round(
      median(runs.map(r => r[scenario]?.[metric] ?? 0)),
    );
  }
}

const out = {
  label: LABEL,
  base: BASE,
  runs: RUNS,
  throttle: THROTTLE,
  viewport: `${VW}x${VH}`,
  date: new Date(),
  summary,
  raw: runs,
};
fs.writeFileSync(
  path.join(RESULTS_DIR, `${LABEL}.json`),
  JSON.stringify(out, null, 2),
);
console.log(`\n${LABEL} — medians over ${RUNS} runs, ${THROTTLE}x CPU`);
console.table(summary);
