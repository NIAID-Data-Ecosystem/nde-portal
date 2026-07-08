/**
 * Build a static export for the Playwright a11y suite.
 *
 * Why this exists: the a11y specs run far faster against a prebuilt static
 * export (`out/`) served as plain files than against `next dev`, which
 * cold-compiles every route on first hit and re-runs `getStaticProps` on every
 * request. See playwright.config.ts and e2e/README.md.
 *
 * Two things this script handles that a plain `next build` does not:
 *   1. Some routes fetch Strapi CMS data in `getStaticProps`/`getStaticPaths`
 *      SERVER-SIDE (out of reach of Playwright's `page.route`). With
 *      `output: 'export'` those run ONCE at build time, so the mock Strapi
 *      server (e2e/mock-strapi-server.js) must be up during the build and
 *      NEXT_PUBLIC_STRAPI_API_URL must point at it (NEXT_PUBLIC_* is inlined at
 *      build time). Dynamic routes like /diseases/asthma only exist in `out/`
 *      if the mock returns their slug.
 *   2. It runs `next build` DIRECTLY, deliberately skipping `build:core`'s
 *      generate-footer-content / generate-metadata-completeness-fields steps.
 *      Those hit the GitHub API (unauthenticated → rate-limited on CI, and
 *      generate-footer-content exits non-zero when GitHub is unreachable). The
 *      committed configs/ are used as-is, which is fine for a11y scans.
 *
 * Invoked via `yarn build:a11y` (which wraps this in `env-cmd -f .env.staging`
 * so staging NEXT_PUBLIC_* values are present; we override only Strapi).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const MOCK_STRAPI_PORT = Number(process.env.MOCK_STRAPI_PORT) || 1337;
const MOCK_STRAPI_URL = `http://localhost:${MOCK_STRAPI_PORT}`;
const ROOT = process.cwd();
const nextBin = path.join(
  ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
);

/** Start the mock Strapi server and resolve once it logs "listening". */
function startMockStrapi() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['e2e/mock-strapi-server.js'], {
      cwd: ROOT,
      env: { ...process.env, MOCK_STRAPI_PORT: String(MOCK_STRAPI_PORT) },
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('mock Strapi server did not start within 10s'));
    }, 10_000);

    child.stdout.on('data', chunk => {
      process.stdout.write(chunk);
      if (chunk.toString().includes('listening')) {
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`mock Strapi server exited early (code ${code})`));
    });
  });
}

/** Run `next build` with Strapi pointed at the mock; resolve with exit code. */
function runNextBuild() {
  return new Promise(resolve => {
    const child = spawn(nextBin, ['build'], {
      cwd: ROOT,
      env: { ...process.env, NEXT_PUBLIC_STRAPI_API_URL: MOCK_STRAPI_URL },
      stdio: 'inherit',
    });
    child.on('exit', code => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

let mock;
try {
  console.log(`[build-a11y] starting mock Strapi on ${MOCK_STRAPI_URL}`);
  mock = await startMockStrapi();
  console.log('[build-a11y] running next build (static export → out/)');
  const code = await runNextBuild();
  console.log(`[build-a11y] next build exited with code ${code}`);
  process.exitCode = code;
} catch (err) {
  console.error(`[build-a11y] ${err.message}`);
  process.exitCode = 1;
} finally {
  // The build's exit is what mattered — always tear the mock down.
  if (mock && !mock.killed) mock.kill();
}
