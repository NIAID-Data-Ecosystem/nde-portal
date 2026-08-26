/**
 * Shared machinery for the accessibility audit generators in `scripts/`.
 *
 * The audits (`generate-a11y-audit.ts`, `generate-tooltip-audit.ts`) are all the
 * same shape: a hand-maintained inventory of source sites, each of which
 *
 *  - renders on a known set of routes, and gets one row per route;
 *  - shows copy that is either a literal in the JSX or an expression whose real
 *    values have to be resolved from config, a CMS, an API, or a caller.
 *
 * Everything in here is the part that does not care *which* attribute is being
 * audited: CSV quoting, the route sets, and the resolver that maps a site to the
 * real strings it renders.
 */

// ---------------------------------------------------------------- route sets
// Every route that renders PageContainer (i.e. all of them except /news, which
// is a client-side redirect to /updates with no UI of its own).
export const ALL = [
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

export const uniq = (routes: string[]) => Array.from(new Set(routes)).sort();

export const HOME = ['/'];
export const KC = ['/knowledge-center', '/knowledge-center/[...slug]'];
export const SB = ['/404', '/about', '/resources', '/search']; // includeSearchBar
export const SBKC = uniq([...SB, ...KC]);
export const TOC = [
  '/diseases',
  '/features',
  '/program-collections',
  '/sources',
];
export const TABLE = [
  '/',
  '/repository-matcher',
  '/resources',
  '/saved',
  '/search',
];
export const DS = ['/diseases/[slug]'];
export const AS = ['/advanced-search'];
export const RES = ['/resources'];
export const SEARCH = ['/search'];
export const SAVED = ['/saved'];
/** Also mounted in the /search popup. */
export const OB = ['/ontology-browser', '/search'];
export const NONE = ['(none - component has no consumer)'];

export const HARD = 'hardcoded in JSX';

export const TODAY = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------- writing
// RFC 4180: quote every field so the 250+ char strings (which contain commas)
// survive a round trip through Excel and Google Sheets.
export const csvLine = (fields: (string | number)[]) =>
  fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',') + '\n';

export const basename = (p: string) =>
  !p || p.startsWith('{') || p.startsWith('$')
    ? ''
    : p.replace(/\/$/, '').split('/').pop() ?? '';

// ---------------------------------------------------------------- resolving
/**
 * A real string that one of the inventory entries actually renders.
 *
 * Entries whose copy is an expression (`{ariaLabel}`, `{tooltipLabel}`) are not
 * reviewable as copy, so their resolved values are registered against them. At
 * write time such an entry emits one row per value instead of one row showing
 * the expression.
 */
export interface Resolved {
  copy: string;
  /** Overrides the entry's image path when the value brings its own. */
  image?: string;
  /** Replaces the entry's source column — says where THIS value comes from. */
  source?: string;
  /** ISO date, set for anything fetched at run time. */
  retrieved?: string;
  /** True for per-record values that cannot be enumerated, only sampled. */
  isExample?: boolean;
  /** True for the "+N more" row appended when a site exceeds CAP. */
  isSummary?: boolean;
}

/** The fields the resolver needs; each audit extends this with its own columns. */
export interface BaseEntry {
  routes: string[];
  file: string;
  line: number;
  /** The literal or expression as written in the source. */
  copy: string;
  /**
   * Overrides the `file:line` key used to look up resolved values, so one
   * source site can carry different value sets for different route families.
   */
  valueKey?: string;
  /**
   * Callers this site's copy comes from, as `file:line` pairs that must exist
   * elsewhere in the same inventory. A shared component shows different real
   * values on different routes, so naming the callers lets the writer resolve
   * per route. Resolution is transitive.
   */
  derivesFrom?: { file: string; line: number }[];
}

/** At most this many real values are listed per site; the rest are summarised. */
export const CAP = 10;

/** Cap a value list and append a summary row when anything was left out. */
export const capped = (values: Resolved[]): (Resolved | null)[] => {
  if (!values.length) return [null];
  const shown: (Resolved | null)[] = values.slice(0, CAP);
  if (values.length > CAP) {
    shown.push({
      copy:
        `(+${values.length - CAP} more values not listed - ` +
        `${values.length} total at this site)`,
      source: 'summary row',
      retrieved: values[0].retrieved,
      isSummary: true,
    });
  }
  return shown;
};

export const dedupe = (values: Resolved[]) => {
  const seen = new Set<string>();
  return values.filter(v => !seen.has(v.copy) && seen.add(v.copy));
};

export const suffix = (v: Resolved | null, base: string) => {
  if (!v) return base;
  if (v.isSummary) return `${base} (summary)`;
  if (v.isExample) return `${base} (sampled example)`;
  return v.retrieved ? `${base} (resolved, live)` : `${base} (resolved)`;
};

/** Shorthand for a derivesFrom list: from(['path/to/caller.tsx', 42], ...). */
export const from = (...pairs: [string, number][]) =>
  pairs.map(([file, line]) => ({ file, line }));

/**
 * Holds the resolved values for one audit and answers "what does this site
 * actually show on this route?".
 */
export const createResolver = <E extends BaseEntry>() => {
  const resolved = new Map<string, Resolved[]>();
  const byKey = new Map<string, E[]>();

  const keyOf = (e: { file: string; line: number; valueKey?: string }) =>
    e.valueKey ?? `${e.file}:${e.line}`;

  const registerKey = (key: string, values: Resolved[]) => {
    if (!values.length) return;
    // Strict: registering the same key twice used to silently concatenate,
    // which let a stale set of values sit alongside the corrected one.
    if (resolved.has(key)) {
      throw new Error(
        `values are already registered for ${key} - merge them at the call ` +
          'site rather than registering twice',
      );
    }
    resolved.set(key, values);
  };

  const register = (file: string, line: number, values: Resolved[]) =>
    registerKey(`${file}:${line}`, values);

  /** Register a list of plain strings that share one source description. */
  const registerLiterals = (
    file: string,
    line: number,
    values: string[],
    source: string,
  ) =>
    register(
      file,
      line,
      values.map(copy => ({ copy, source })),
    );

  /** Index the inventory so derivesFrom targets can be looked up. */
  const index = (entries: E[]) => {
    for (const entry of entries) {
      const k = `${entry.file}:${entry.line}`;
      byKey.set(k, (byKey.get(k) ?? []).concat(entry));
    }
  };

  /**
   * The real values a pass-through site shows on one specific route, followed
   * transitively through its callers. Throws if a named caller is not in the
   * inventory, so a stale reference fails loudly instead of emitting a blank.
   */
  const derivedFor = (
    entry: E,
    route: string,
    seen: Set<string> = new Set(),
  ): Resolved[] => {
    const out: Resolved[] = [];
    for (const target of entry.derivesFrom ?? []) {
      const key = `${target.file}:${target.line}`;
      if (seen.has(key)) continue;
      const callers = byKey.get(key);
      if (!callers) {
        throw new Error(
          `derivesFrom target is not in the inventory: ${key} ` +
            `(referenced by ${entry.file}:${entry.line})`,
        );
      }
      const next = new Set(seen).add(key);
      for (const caller of callers) {
        if (!caller.routes.includes(route)) continue;
        const own = resolved.get(keyOf(caller));
        if (own?.length) {
          out.push(...own.map(v => ({ ...v, source: `passed by ${key}` })));
        } else if (caller.derivesFrom?.length) {
          out.push(...derivedFor(caller, route, next));
        } else {
          out.push({ copy: caller.copy, source: `passed by ${key}` });
        }
      }
    }
    return out;
  };

  /** Registered values, then anything derived from callers for this route. */
  const valuesFor = (entry: E, route: string, noun = 'label'): Resolved[] => {
    const registered = resolved.get(keyOf(entry)) ?? [];
    const derived = entry.derivesFrom?.length
      ? dedupe(derivedFor(entry, route))
      : [];
    if (!registered.length && entry.derivesFrom?.length && !derived.length) {
      // A pass-through with no caller on this route shows nothing here.
      return [
        {
          copy: `(NO VALUE - no caller supplies a ${noun} on this route)`,
          source: `no caller of ${entry.file}:${entry.line} renders on ${route}`,
        },
      ];
    }
    return dedupe(registered.concat(derived));
  };

  /** Route-independent: the values registered against this site, capped. */
  const rowsFor = (entry: { file: string; line: number; valueKey?: string }) =>
    capped(resolved.get(keyOf(entry)) ?? []);

  /**
   * Two entries sharing a resolution key both inherit the same values, which
   * silently doubles a site's rows. Anything intentionally sharing a
   * `file:line` must disambiguate with `valueKey`.
   */
  const assertNoSharedKeys = (
    entries: { file: string; line: number; valueKey?: string }[],
  ) => {
    const seen = new Map<string, number>();
    for (const e of entries) {
      const k = keyOf(e);
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    const clashes = [...seen.entries()].filter(
      ([k, n]) => n > 1 && resolved.has(k),
    );
    if (clashes.length) {
      throw new Error(
        'entries share a resolution key that has registered values; give them ' +
          `distinct valueKeys: ${clashes
            .map(([k, n]) => `${k} (x${n})`)
            .join(', ')}`,
      );
    }
  };

  return {
    resolved,
    keyOf,
    register,
    registerKey,
    registerLiterals,
    index,
    derivedFor,
    valuesFor,
    rowsFor,
    assertNoSharedKeys,
    size: () => resolved.size,
  };
};

// ------------------------------------------------------------------ fetching
export const getJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
};

/**
 * Distinct `file:line` pairs in an inventory. Printed by every generator so the
 * count can be reconciled against a grep of `src/` — resolving values should
 * add rows, never sites.
 */
export const countSites = (entries: { file: string; line: number }[]) =>
  new Set(entries.map(e => `${e.file}:${e.line}`)).size;
