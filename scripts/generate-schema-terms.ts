import fs from 'fs/promises';
import path from 'path';
import { csvLine, getJson } from './lib/audit-csv';

/**
 * Extracts every term's `abstract` and `description` from the NDE schema.
 *
 * Run with `yarn generate-schema-terms`. No env needed — the registry is a
 * public endpoint.
 *
 * Source: https://discovery.biothings.io/api/registry/nde, the same endpoint
 * scripts/generate-schema-definitions/fetch-fields-from-schema.ts uses to build
 * configs/schema-definitions.json. Using it (rather than the NDE_schema.jsonld
 * on GitHub) means a later UI-vs-schema comparison is like-for-like. The two
 * sources differ in only 2 of 328 descriptions, but this one additionally has
 * every `$ref` pre-resolved and carries the required/recommended/optional
 * field tiers.
 *
 * Shape of the payload: 9 `hits`, one per class. `hits[].validation.properties`
 * is the JSON Schema where `abstract` and `description` live; nesting is plain
 * `properties` / `items.properties` inside `anyOf`/`oneOf`. `hits[].properties`
 * is a separate, smaller list of the class's declared properties, which carry a
 * `description` but never an `abstract`.
 */

const SCHEMA_API_URL = 'https://discovery.biothings.io/api/registry/nde';
const OUT_DIR = 'docs/schema';
const OUT_FILE = 'nde-schema-terms.csv';

/**
 * Nested object shapes recurse (person -> affiliation -> organization -> ...),
 * so the depth cap is what terminates the walk, not a cycle guard.
 */
const MAX_DEPTH = 4;

interface Row {
  cls: string;
  term: string;
  property: string;
  parent: string;
  depth: number;
  kind: string;
  tier: string;
  abstract: string;
  /** JSON Schema `description`, from `hits[].validation`. */
  description: string;
  /**
   * The RDF comment — a separate vocabulary from the JSON Schema description,
   * and usually different wording: of the 111 terms carrying both, 92 disagree
   * and only 19 match. Present on class rows, property declarations, and the
   * depth-1 validation rows whose term is also a declared property of that
   * class.
   */
  rdfsComment: string;
  jsonPath: string;
}

/** Every object shape a property spec can resolve to, with its path suffix. */
const subSchemas = (spec: any, at: string): [any, string][] => {
  const out: [any, string][] = [];
  if (!spec || typeof spec !== 'object') return out;
  if (spec.properties && typeof spec.properties === 'object') {
    out.push([spec.properties, `${at}.properties`]);
  }
  for (const key of ['anyOf', 'oneOf'] as const) {
    const branches = spec[key];
    if (!Array.isArray(branches)) continue;
    branches.forEach((branch, i) => {
      out.push(...subSchemas(branch, `${at}.${key}[${i}]`));
    });
  }
  if (
    spec.items &&
    typeof spec.items === 'object' &&
    !Array.isArray(spec.items)
  ) {
    out.push(...subSchemas(spec.items, `${at}.items`));
  }
  return out;
};

const walk = (
  props: Record<string, any>,
  cls: string,
  at: string,
  prefix: string,
  depth: number,
  out: Row[],
) => {
  for (const [name, spec] of Object.entries(props ?? {})) {
    if (!spec || typeof spec !== 'object') continue;
    const term = `${prefix}${name}`;
    out.push({
      cls,
      term,
      property: name,
      parent: prefix.replace(/\.$/, ''),
      depth,
      kind: 'validation property',
      tier: '',
      abstract: typeof spec.abstract === 'string' ? spec.abstract : '',
      description: typeof spec.description === 'string' ? spec.description : '',
      rdfsComment: '',
      jsonPath: `${at}.${name}`,
    });
    if (depth >= MAX_DEPTH) continue;
    for (const [nested, nestedAt] of subSchemas(spec, `${at}.${name}`)) {
      walk(nested, cls, nestedAt, `${term}.`, depth + 1, out);
    }
  }
};

/**
 * The traversal assumes refs are pre-resolved. Fail loudly if that stops being
 * true, rather than silently emitting only the top-level terms.
 *
 * Scoped to `hits[].validation`, which is the resolved copy we walk. The
 * response also embeds the raw JSON-LD under `payload.source`, and that still
 * contains all 853 `$ref`s — checking the whole payload would always trip.
 */
const assertNoRefs = (hits: any[]) => {
  const refs = hits.reduce(
    (n, hit) =>
      n +
      (JSON.stringify(hit?.validation ?? {}).match(/"\$ref"/g) ?? []).length,
    0,
  );
  if (refs > 0) {
    throw new Error(
      `hits[].validation contains ${refs} unresolved $ref(s). This script ` +
        'walks inline shapes only, so it would silently emit just the ' +
        'top-level terms. Add $ref resolution before trusting the output.',
    );
  }
};

const tierOf = (validation: any, term: string) => {
  for (const tier of ['required', 'recommended', 'optional'] as const) {
    const list = validation?.[tier];
    if (Array.isArray(list) && list.includes(term)) return tier;
  }
  return '';
};

const main = async () => {
  try {
    console.log('Extracting schema term definitions...');
    const payload = await getJson(SCHEMA_API_URL);
    const hits: any[] = payload?.hits ?? [];
    if (!hits.length) throw new Error('registry returned no hits');
    assertNoRefs(hits);

    // --- validation properties, expanded
    const raw: Row[] = [];
    for (const hit of hits) {
      const validation = hit?.validation ?? {};
      walk(
        validation.properties ?? {},
        hit.label,
        `hits[${hit.label}].validation.properties`,
        '',
        1,
        raw,
      );
    }
    // Per class, the RDF comment for each of its declared properties. The
    // registry exposes rdfs:comment under the name `description` here; matching
    // within hits[].properties is domain-respecting by construction, so there
    // is no need to parse the stringified schema:domainIncludes in the source
    // graph.
    const commentsByClass = new Map<string, Map<string, string>>();
    for (const hit of hits) {
      commentsByClass.set(
        hit.label,
        new Map(
          (hit?.properties ?? [])
            .filter((p: any) => typeof p?.description === 'string')
            .map((p: any) => [p.label, p.description] as [string, string]),
        ),
      );
    }

    for (const row of raw) {
      if (row.depth !== 1) continue;
      const hit = hits.find(h => h.label === row.cls);
      row.tier = tierOf(hit?.validation, row.term);
      row.rdfsComment = commentsByClass.get(row.cls)?.get(row.term) ?? '';
    }

    // --- collapse rows identical in class + term + all three text fields
    const collapsed = new Map<string, { row: Row; paths: number }>();
    for (const row of raw) {
      // JSON.stringify, not a join: a separator character could in principle
      // appear inside a description and collide two different rows.
      const key = JSON.stringify([
        row.cls,
        row.term,
        row.abstract,
        row.description,
        row.rdfsComment,
      ]);
      const seen = collapsed.get(key);
      if (seen) seen.paths += 1;
      else collapsed.set(key, { row, paths: 1 });
    }

    // --- the class's declared properties. The registry calls their RDF comment
    // `description`, but it is rdfs:comment, so it goes in that column and the
    // JSON Schema `description` column stays empty for these rows.
    const declarations: Row[] = [];
    for (const hit of hits) {
      for (const prop of hit?.properties ?? []) {
        declarations.push({
          cls: hit.label,
          term: prop.label,
          property: prop.label,
          parent: '',
          depth: 0,
          kind: 'property declaration',
          tier: tierOf(hit?.validation, prop.label),
          abstract: '',
          description: '',
          rdfsComment:
            typeof prop.description === 'string' ? prop.description : '',
          jsonPath: prop.curie || `hits[${hit.label}].properties.${prop.label}`,
        });
      }
    }

    // --- the 9 classes. Their rdfs:comment is hits[].description, but their
    // `abstract` exists only in the raw JSON-LD the response embeds under
    // `source`, so that has to be read separately.
    const graph: any[] = payload?.source?.['@graph'] ?? [];
    const classNodes = new Map<string, any>(
      graph
        .filter(e => e?.['@type'] === 'rdfs:Class')
        .map(e => [e['rdfs:label'], e] as [string, any]),
    );
    const classRows: Row[] = hits.map(hit => {
      const node = classNodes.get(hit.label);
      return {
        cls: hit.label,
        term: hit.label,
        property: hit.label,
        parent: '',
        depth: 0,
        kind: 'class',
        tier: '',
        abstract: typeof node?.abstract === 'string' ? node.abstract : '',
        description: '',
        rdfsComment:
          typeof hit?.description === 'string' ? hit.description : '',
        jsonPath: node?.['@id'] ?? `hits[${hit.label}]`,
      };
    });

    // --- write
    await fs.mkdir(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, OUT_FILE);
    let out = csvLine([
      'class',
      'term',
      'property',
      'parent term',
      'depth',
      'term kind',
      'field tier',
      'abstract',
      'description',
      'rdfs:comment',
      'json path',
      'reached via paths',
    ]);
    const emit = (r: Row, paths: number) =>
      csvLine([
        r.cls,
        r.term,
        r.property,
        r.parent,
        r.depth,
        r.kind,
        r.tier,
        r.abstract,
        r.description,
        r.rdfsComment,
        r.jsonPath,
        paths,
      ]);
    for (const c of classRows) out += emit(c, 1);
    for (const d of declarations) out += emit(d, 1);
    for (const { row, paths } of collapsed.values()) out += emit(row, paths);
    await fs.writeFile(file, out);

    // --- counts, for reconciling against the payload
    const depth1 = raw.filter(r => r.depth === 1);
    const joined = depth1.filter(r => r.rdfsComment).length;
    console.log(
      `${file}: ${
        classRows.length + declarations.length + collapsed.size
      } rows`,
    );
    console.log(`  class rows             : ${classRows.length}`);
    console.log(
      `  declaration rows       : ${declarations.length} over ${
        new Set(declarations.map(d => d.term)).size
      } labels`,
    );
    console.log(`  raw traversal rows     : ${raw.length}`);
    console.log(`  after collapsing       : ${collapsed.size}`);
    console.log(`  depth-1 (class, term)  : ${depth1.length}`);
    console.log(
      `  distinct top-level     : ${new Set(depth1.map(r => r.term)).size}`,
    );
    console.log(
      `  distinct dotfields     : ${new Set(raw.map(r => r.term)).size}`,
    );
    console.log(
      `  with an abstract       : ${raw.filter(r => r.abstract).length}`,
    );
    console.log(
      `  rdfs:comment values    : ${
        classRows.length + declarations.length + joined
      } ` +
        `(${classRows.length} class + ${declarations.length} declaration + ` +
        `${joined} joined onto depth-1 terms)`,
    );
  } catch (err: any) {
    console.error('Failed to extract schema terms:', err.message);
    process.exit(1);
  }
};

main();
