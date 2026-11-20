/**
 * Broken-link check. Not part of the a11y run: it needs real CMS content and
 * live third-party sites, so it has its own config (playwright.links.config.ts)
 * and runs with `yarn test:links`. See e2e/README.md.
 *
 * Loads ROUTES, plus every CMS page under CRAWL that they link to, collects the
 * <a href> on each page, then requests each unique URL once (HEAD, then GET if
 * HEAD fails). A link that doesn't come back OK is retried once.
 * - broken (fails the test): an internal link that returns >= 400, or an
 *   external one that returns 404/410 or whose host doesn't resolve or refuses
 *   the connection.
 * - unverified (reported only): other 4xx/5xx, timeouts and TLS errors. These
 *   are usually bot protection or an outage, not a dead link. Check by hand.
 *
 * With SLACK_WEBHOOK_URL set, broken links are also posted to Slack.
 */
import { writeFile } from 'node:fs/promises';

import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from '@playwright/test';

const ROUTES = [
  '/',
  '/about',
  '/faq',
  '/disclaimer',
  '/changelog',
  '/updates',
  '/search',
  '/advanced-search',
  '/ontology-browser',
  '/repository-matcher',
  '/sources',
  '/program-collections',
  '/knowledge-center',
  '/features',
  '/diseases',
];

// CMS sections hold most outbound links, so their linked pages are loaded too.
const CRAWL = /^\/(knowledge-center|features|diseases)\/[^/]+$/;
const MAX_PAGES = 200;

// Dataset result cards link to source records the portal doesn't author.
const IGNORE_WITHIN = '.search-results-cards';

// The changelog links every commit. Commits don't disappear, and GitHub answers
// hundreds of requests with 503s, so they aren't checked.
const SKIP = /^https:\/\/github\.com\/[^/]+\/[^/]+\/commit\//;

const HOSTS_IN_PARALLEL = 8;
const REQUEST = {
  timeout: 20_000,
  maxRetries: 1,
  // Some sites (e.g. hhs.gov) answer 403 to requests without these.
  headers: {
    accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
  },
};
// Browsers fetch a missing intermediate certificate; Node doesn't. Those sites
// are retried without verification, but expired or self-signed certificates
// are still reported.
const INCOMPLETE_CHAIN =
  /unable to (verify the first|get local issuer) certificate/;
const SLACK_MAX_LINKS = 40; // Slack allows 50 blocks per message.

type Verdict = 'ok' | 'broken' | 'unverified';
type Result = {
  url: string;
  verdict: Verdict;
  detail: string;
  pages: string[];
};

test('no broken links', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const found = new Map<string, Set<string>>(); // url -> pages it appears on
  const visited = new Set<string>();

  await test.step('collect links', async () => {
    const queue = [...ROUTES];
    while (queue.length && visited.size < MAX_PAGES) {
      const route = queue.shift()!;
      if (visited.has(route)) continue;
      visited.add(route);
      for (const href of await hrefsOn(page, route)) {
        const url = normalize(href, origin);
        if (!url) continue;
        if (!found.has(url)) found.set(url, new Set());
        found.get(url)!.add(route);
        const target = new URL(url);
        if (target.origin === origin && CRAWL.test(target.pathname)) {
          queue.push(target.pathname);
        }
      }
    }
  });

  const results: Result[] = [];
  await test.step(`check ${found.size} links`, async () => {
    const byHost = new Map<string, string[]>();
    for (const url of found.keys()) {
      const { host } = new URL(url);
      byHost.set(host, [...(byHost.get(host) ?? []), url]);
    }
    // One request at a time per host, so no site sees a burst.
    await inParallel([...byHost.values()], HOSTS_IN_PARALLEL, async urls => {
      for (const url of urls) {
        const internal = new URL(url).origin === origin;
        let outcome = await check(page.request, url, internal);
        if (outcome.verdict !== 'ok') {
          await new Promise(resolve => setTimeout(resolve, 1_000));
          outcome = await check(page.request, url, internal);
        }
        results.push({ url, ...outcome, pages: [...found.get(url)!] });
      }
    });
  });

  const broken = results.filter(r => r.verdict === 'broken');
  const unverified = results.filter(r => r.verdict === 'unverified');
  console.log(
    `Checked ${results.length} links on ${visited.size} pages: ` +
      `${broken.length} broken, ${unverified.length} unverified.`,
  );
  if (unverified.length) {
    console.log(`Unverified, check by hand:\n${byHostAndDetail(unverified)}`);
  }
  // Full results: test-results/<test>/links.json, also attached to the report.
  const report = test.info().outputPath('links.json');
  await writeFile(
    report,
    JSON.stringify({ pages: [...visited], broken, unverified }, null, 2),
  );
  await test.info().attach('links.json', {
    path: report,
    contentType: 'application/json',
  });
  if (broken.length) {
    await notifySlack(page.request, broken, results.length, origin);
  }

  expect(broken.map(line), `${broken.length} broken link(s)`).toEqual([]);
});

async function hrefsOn(page: Page, route: string): Promise<string[]> {
  try {
    const response = await page.goto(route);
    // A missing page is reported when its URL is checked; don't crawl it.
    if (!response || response.status() >= 400) return [];
    // Most links render after client-side API and CMS fetches.
    await page
      .waitForLoadState('networkidle', { timeout: 15_000 })
      .catch(() => {});
    return await page.$$eval(
      'a[href]',
      (anchors, ignoreWithin) =>
        anchors
          .filter(
            a => a instanceof HTMLAnchorElement && !a.closest(ignoreWithin),
          )
          .map(a => (a as HTMLAnchorElement).href),
      IGNORE_WITHIN,
    );
  } catch (error) {
    console.warn(`Couldn't load ${route}: ${firstLine(error)}`);
    return [];
  }
}

function normalize(href: string, origin: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null; // mailto:, tel:, etc.
  if (SKIP.test(url.href)) return null;
  url.hash = '';
  // The static export serves the same file whatever the query string.
  if (url.origin === origin) url.search = '';
  return url.href;
}

async function check(
  request: APIRequestContext,
  url: string,
  internal: boolean,
): Promise<Pick<Result, 'verdict' | 'detail'>> {
  let status: number;
  try {
    status = await statusOf(request, url).catch(error => {
      if (!INCOMPLETE_CHAIN.test(String(error))) throw error;
      return statusOf(request, url, { ignoreHTTPSErrors: true });
    });
  } catch (error) {
    const detail = firstLine(error);
    const dead = /ENOTFOUND|ECONNREFUSED/.test(detail);
    return { verdict: dead ? 'broken' : 'unverified', detail };
  }
  if (status < 400) return { verdict: 'ok', detail: String(status) };
  const dead = internal || status === 404 || status === 410;
  return { verdict: dead ? 'broken' : 'unverified', detail: String(status) };
}

async function statusOf(
  request: APIRequestContext,
  url: string,
  options: { ignoreHTTPSErrors?: boolean } = {},
): Promise<number> {
  const init = { ...REQUEST, ...options };
  let response = await request.head(url, init);
  // Many servers mishandle HEAD (405, 403, even 404), so confirm with GET.
  if (response.status() >= 400) {
    await response.dispose();
    response = await request.get(url, init);
  }
  const status = response.status();
  await response.dispose();
  return status;
}

async function notifySlack(
  request: APIRequestContext,
  broken: Result[],
  total: number,
  site: string,
) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  const summary =
    `:boom: ${broken.length} broken link${broken.length === 1 ? '' : 's'} ` +
    `out of ${total} on ${site}` +
    (GITHUB_RUN_ID
      ? `. <${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|View run>`
      : '');
  const shown = broken.slice(0, SLACK_MAX_LINKS);
  const blocks = [
    section(summary),
    ...shown.map(r =>
      section(`<${r.url}|${r.url}>\n${r.detail} · on ${pagesLabel(r)}`),
    ),
  ];
  if (broken.length > shown.length) {
    blocks.push(section(`…and ${broken.length - shown.length} more.`));
  }
  try {
    const response = await request.post(webhook, {
      data: { text: summary, blocks },
    });
    if (!response.ok()) console.error(`Slack returned ${response.status()}`);
  } catch (error) {
    console.error(`Couldn't post to Slack: ${firstLine(error)}`);
  }
}

async function inParallel<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items];
  const run = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      await worker(item);
    }
  };
  await Promise.all(Array.from({ length: limit }, run));
}

const section = (text: string) => ({
  type: 'section',
  text: { type: 'mrkdwn', text },
});

const pagesLabel = ({ pages }: Result) =>
  pages.length > 3
    ? `${pages.slice(0, 3).join(', ')} +${pages.length - 3} more`
    : pages.join(', ');

const line = (r: Result) => `${r.detail}  ${r.url}  (on ${pagesLabel(r)})`;

// One line per link, except a host failing many links the same way (e.g. bot
// protection) gets a single count; links.json has every URL.
function byHostAndDetail(results: Result[]) {
  const groups = new Map<string, Result[]>();
  for (const r of results) {
    const key = `${r.detail}  ${new URL(r.url).host}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()]
    .sort((a, b) => b.length - a.length)
    .map(group =>
      group.length > 3
        ? `${group[0].detail}  ${group.length} links on ${
            new URL(group[0].url).host
          }`
        : group.map(line).join('\n'),
    )
    .join('\n');
}

const firstLine = (error: unknown) =>
  String(error instanceof Error ? error.message : error)
    .split('\n')[0]
    .replace(/^apiRequestContext\.\w+: /, '');
