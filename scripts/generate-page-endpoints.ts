/**
 * Scans each Next.js page's import tree to detect which upstream API
 * endpoints it depends on at runtime, then writes the mapping to
 * src/utils/page-endpoints.generated.ts.
 *
 * Detection works by recursively following local imports from each page
 * file and searching for the env-var strings that gate API access:
 *   - NEXT_PUBLIC_API_URL      → niaid-data-api
 *   - NEXT_PUBLIC_STRAPI_API_URL → niaid-strapi
 *
 * Shared layout components (PageContainer, Navigation, Footer, etc.)
 * are excluded so that the universal Strapi notices-banner dependency
 * doesn't mark every page as Strapi-dependent.
 *
 * Run: yarn generate-page-endpoints
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, 'src/pages');
const OUT_PATH = path.join(ROOT, 'src/utils/page-endpoints.generated.ts');

// Env vars → endpoint IDs
const DETECTORS: [string, RegExp][] = [
  ['niaid-data-api', /NEXT_PUBLIC_API_URL/],
  ['niaid-strapi', /NEXT_PUBLIC_STRAPI_API_URL/],
];

// Shared components imported by every page — exclude to avoid false positives.
// The PageContainer fetches Strapi notices for the banner; that's universal
// and doesn't affect whether a page's *content* depends on Strapi.
const EXCLUDED_PREFIXES = [
  'src/components/page-container',
  'src/components/navigation-bar',
  'src/components/footer',
  'src/components/error',
  'src/components/mdx',
  'src/components/auth',
  'src/components/loading',
  'src/theme',
];

// Pages that shouldn't appear in the status monitor
const SKIP_ROUTES = new Set(['/404', '/status']);

// ── Helpers ──────────────────────────────────────────────────────────

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function resolveToFile(p: string): string | null {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(p + ext)) return p + ext;
  }
  for (const ext of EXTENSIONS) {
    const idx = path.join(p, `index${ext}`);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

function resolveImport(imp: string, fromFile: string): string | null {
  if (imp.startsWith('src/')) return resolveToFile(path.join(ROOT, imp));
  if (imp.startsWith('.'))
    return resolveToFile(path.join(path.dirname(fromFile), imp));
  return null; // external package
}

function isExcluded(filePath: string): boolean {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return EXCLUDED_PREFIXES.some(prefix => rel.startsWith(prefix));
}

function extractImports(filePath: string): string[] {
  const src = fs.readFileSync(filePath, 'utf-8');
  const results: string[] = [];
  const re = /(?:import\s.*?from\s+|from\s+|require\()['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) results.push(m[1]);
  return results;
}

/** BFS through local imports starting from entryFile. */
function collectFiles(entryFile: string): Set<string> {
  const visited = new Set<string>();
  const queue = [entryFile];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (visited.has(file) || isExcluded(file)) continue;
    visited.add(file);
    for (const imp of extractImports(file)) {
      const resolved = resolveImport(imp, file);
      if (resolved && !visited.has(resolved) && !isExcluded(resolved)) {
        queue.push(resolved);
      }
    }
  }
  return visited;
}

function detectEndpoints(files: Set<string>): string[] {
  const found = new Set<string>();
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf-8');
    for (const [id, pattern] of DETECTORS) {
      if (pattern.test(src)) found.add(id);
    }
  }
  return [...found].sort();
}

// ── Page discovery ───────────────────────────────────────────────────

interface PageEntry {
  route: string;
  file: string;
}

function discoverPages(dir: string, prefix: string): PageEntry[] {
  const pages: PageEntry[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip api/ directory
      if (entry.name === 'api') continue;
      pages.push(
        ...discoverPages(path.join(dir, entry.name), `${prefix}/${entry.name}`),
      );
    } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      const name = entry.name.replace(/\.(tsx?|jsx?)$/, '');
      if (['_app', '_document'].includes(name)) continue;

      let route: string;
      if (name === 'index') {
        route = prefix || '/';
      } else if (name.startsWith('[')) {
        // Dynamic catch-all like [[...slug]] → use directory path
        route = prefix || '/';
      } else {
        route = `${prefix}/${name}`;
      }

      pages.push({ route, file: path.join(dir, entry.name) });
    }
  }
  return pages;
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  console.log('Generating page endpoint dependencies...');

  const pages = discoverPages(PAGES_DIR, '').filter(
    p => !SKIP_ROUTES.has(p.route),
  );

  const result: Record<string, string[]> = {};
  for (const { route, file } of pages) {
    const files = collectFiles(file);
    result[route] = detectEndpoints(files);
  }

  // Sort by route
  const sorted = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b)),
  );

  const output = [
    '// AUTO-GENERATED — do not edit. Run: yarn generate-page-endpoints',
    '',
    'export const PAGE_ENDPOINTS: Record<string, string[]> = ' +
      JSON.stringify(sorted, null, 2) +
      ';',
    '',
  ].join('\n');

  fs.writeFileSync(OUT_PATH, output);
  console.log(`Wrote ${Object.keys(sorted).length} pages → ${OUT_PATH}`);

  // Print summary
  for (const [route, endpoints] of Object.entries(sorted)) {
    const deps = endpoints.length > 0 ? endpoints.join(', ') : '(static)';
    console.log(`  ${route.padEnd(25)} ${deps}`);
  }
}

main();
