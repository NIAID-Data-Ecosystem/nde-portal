import fs from 'fs/promises';
import path from 'path';
import SCHEMA_DEFINITIONS from '../configs/schema-definitions.json';
import { APIResourceType } from '../src/utils/formatting/formatResourceType';
import { SchemaDefinitions } from './generate-schema-definitions/types';
import { CAP, TODAY, capped, csvLine, getJson } from './lib/audit-csv';

/**
 * Inventory of the portal's UI "pills" — small rounded labels that carry a
 * tooltip — with the origin of both the label and the tooltip, and the schema
 * definition of the property behind them.
 *
 * Run with `yarn generate-ui-pill-audit`, which loads .env.production so the
 * ontology labels can be sampled from the live NDE API.
 *
 * Four families, each sourcing its text differently:
 *
 *  A  access / status badges  - label and tooltip both hardcoded in
 *                               src/components/badges/components/*
 *  B  accordion property pills - label hardcoded in metadata/helpers.ts, tooltip
 *                               resolved from configs/schema-definitions.json
 *                               PER RESOURCE TYPE (see resolveDescription)
 *  C  ontology pills          - label is live API data (inDefinedTermSet), the
 *                               tooltip is a template built in helpers.ts
 *  D  funding ID tag          - label and tooltip are both the identifier
 *
 * The schema wording is keyed by resource type, so no single string represents
 * it. Family B is the family whose tooltip *is* that wording, and it therefore
 * emits one row per group of resource types that resolve to the same text — the
 * tooltip a user actually reads depends on the record's @type. The other three
 * families have type-independent tooltips, so they stay at one row and carry
 * every type's wording in the schema description column as reference.
 *
 * This file deliberately reports without judging: it places the pill text and
 * the schema wording side by side but computes no verdict. Families B, C and D
 * also appear in docs/accessibility/tooltip-audit.csv as four source sites —
 * this is the same ground expanded to one row per pill value, so do not count
 * findings twice across the two files.
 */

const OUT_DIR = 'docs/schema';
const OUT_FILE = 'ui-pill-audit.csv';

const RES = '/resources';
const SEARCH = '/search';

const schema = SCHEMA_DEFINITIONS as unknown as SchemaDefinitions;

const schemaName = (property: string) => schema[property]?.name ?? '';

/**
 * Every resource type the schema keys its wording by. `description` and
 * `abstract` in configs/schema-definitions.json are maps from these to a string,
 * and a property carries an entry only for the types it applies to — the
 * software properties are ComputationalTool-only, hasAPI/hasDownload are
 * ResourceCatalog-only, and so on.
 */
const TYPES: APIResourceType[] = [
  'Dataset',
  'ComputationalTool',
  'ResourceCatalog',
  'Sample',
  'DataCollection',
];

/** Shown wherever a row is not tied to one resource type. */
const ANY_TYPE = '(not type-dependent)';

const NO_WORDING = '(no description for this resource type - tooltip is empty)';

/**
 * The schema wording one accordion pill shows on a record of this type.
 *
 * Mirrors the chain in the accordion itself
 * (src/views/search/.../metadata-accordion/index.tsx:138) exactly:
 *
 *   description[type] || abstract[type] || description['Dataset'] || ''
 *
 * `source` records which branch fired, because the branches are not
 * interchangeable: the third one shows a *Dataset* sentence on a non-Dataset
 * record, and the fourth ships an empty tooltip.
 */
const resolveDescription = (property: string, type: APIResourceType) => {
  const entry = schema[property];
  const byType = entry?.description?.[type];
  if (byType != null) return { text: byType, source: 'description[type]' };
  const abstractByType = entry?.abstract?.[type];
  if (abstractByType != null) {
    return { text: abstractByType, source: 'abstract[type]' };
  }
  const dataset = entry?.description?.['Dataset'];
  if (dataset != null) {
    return { text: dataset, source: "description['Dataset'] (fallback)" };
  }
  return { text: '', source: '(none - empty tooltip)' };
};

interface DescriptionGroup {
  types: APIResourceType[];
  text: string;
  source: string;
}

/**
 * One group per distinct resolved wording, in TYPES order. Most properties word
 * themselves identically for several types, so grouping keeps the CSV at one row
 * per thing a user can actually read instead of a fixed five.
 */
const descriptionGroups = (property: string): DescriptionGroup[] => {
  const groups: DescriptionGroup[] = [];
  for (const type of TYPES) {
    const { text, source } = resolveDescription(property, type);
    const existing = groups.find(g => g.text === text);
    if (existing) {
      existing.types.push(type);
      // Same text reached by different branches — `sample` is the case: Dataset
      // gets its own wording and three other types reach the same sentence
      // through the fallback. Name both so the row is not silently attributed
      // to whichever type happened to come first.
      if (!existing.source.includes(source)) {
        existing.source += ` + ${source}`;
      }
    } else {
      groups.push({ types: [type], text, source });
    }
  }
  return groups;
};

/**
 * Every type's wording in one cell, for the families whose tooltip does not vary
 * by type but whose schema wording still does. Labelled by type so the cell can
 * be read without joining back to nde-schema-terms.csv; collapses to the bare
 * sentence when all five types agree.
 */
const allWordings = (property: string) => {
  const groups = descriptionGroups(property).filter(g => g.text);
  if (!groups.length) return '';
  if (groups.length === 1 && groups[0].types.length === TYPES.length) {
    return groups[0].text;
  }
  return groups.map(g => `[${g.types.join(', ')}] ${g.text}`).join(' | ');
};

/** `all types`, or how many distinct wordings a property spreads across. */
const wordingSummary = (property: string) => {
  const groups = descriptionGroups(property).filter(g => g.text);
  if (!groups.length) return '(no schema description for any type)';
  if (groups.length === 1) {
    return groups[0].types.length === TYPES.length
      ? 'all types'
      : `${groups[0].types.join(', ')} only`;
  }
  return `varies by type (${groups.length} wordings)`;
};

interface Pill {
  family: string;
  routes: string[];
  file: string;
  line: number;
  visible: string;
  visibleFrom: string;
  tooltip: string;
  tooltipFrom: string;
  condition: string;
  property?: string;
  /** Resource type(s) this row's schema description applies to. */
  resourceTypes: string;
  /** The wording itself — resolved per type for family B, packed for the rest. */
  schemaDescription: string;
  /** Which branch of the chain produced `schemaDescription`. */
  descriptionSource: string;
  kind: string;
  retrieved?: string;
  notes?: string;
}

/** Defaults for the families whose tooltip does not depend on resource type. */
const typeAgnostic = (property?: string) => ({
  resourceTypes: ANY_TYPE,
  schemaDescription: property ? allWordings(property) : '',
  descriptionSource: property ? wordingSummary(property) : '',
});

// --------------------------------------------- A. access / status badges
const BADGES = 'src/components/badges/components';
const HARDCODED = (f: string) => `hardcoded in ${BADGES}/${f}`;

/**
 * conditionsOfAccess. Two of the seven values are remapped before display by
 * formatConditionsOfAccess(): "Closed" -> Registered, "Restricted" ->
 * Controlled. "Restricted" therefore keeps a tooltip it can no longer reach
 * through that path.
 */
const ACCESS: [string, string, string][] = [
  ['Open', 'The resource is freely available without access restrictions.', ''],
  [
    'Controlled',
    'The resource may have conditions that limit access.',
    'displayed value for source data of "Restricted"',
  ],
  [
    'Registered',
    'The resource requires registration or authorization to access.',
    'displayed value for source data of "Closed"',
  ],
  ['Embargoed', 'Public access is restricted until publication.', ''],
  ['Varied', 'Access to the resource varies by record.', ''],
  ['Unknown', 'Conditions of access information was not found.', ''],
  [
    'Restricted',
    'The resource may have conditions that limit access.',
    'remapped to "Controlled" before display, so this label is unlikely to render',
  ],
];

const pills: Pill[] = [];

for (const [value, tooltip, note] of ACCESS) {
  pills.push({
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/ConditionsOfAccess.tsx`,
    line: 26,
    // transformConditionsOfAccessLabel(): first char + lowercased rest + " Access"
    visible: `${value.charAt(0)}${value.slice(1).toLowerCase()} Access`,
    visibleFrom:
      'transformConditionsOfAccessLabel() in src/utils/formatting/formatConditionsOfAccess.ts',
    tooltip,
    tooltipFrom:
      'getConditionsOfAccessTooltip() in src/utils/formatting/formatConditionsOfAccess.ts',
    condition: `conditionsOfAccess === '${value}'`,
    property: 'conditionsOfAccess',
    ...typeAgnostic('conditionsOfAccess'),
    kind: 'literal',
    notes: note,
  });
}

pills.push(
  {
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/AccessibleForFree.tsx`,
    line: 21,
    visible: 'No Cost Access',
    visibleFrom: HARDCODED('AccessibleForFree.tsx'),
    tooltip: 'The resource is accessible for free.',
    tooltipFrom: HARDCODED('AccessibleForFree.tsx'),
    condition: 'isAccessibleForFree === true',
    property: 'isAccessibleForFree',
    ...typeAgnostic('isAccessibleForFree'),
    kind: 'literal',
  },
  {
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/AccessibleForFree.tsx`,
    line: 21,
    // Verbatim, including the double space. Do not "fix" this here - the CSV
    // records what ships.
    visible: 'Paid  Access',
    visibleFrom: HARDCODED('AccessibleForFree.tsx'),
    tooltip: 'The resource is not accessible for free.',
    tooltipFrom: HARDCODED('AccessibleForFree.tsx'),
    condition: 'isAccessibleForFree === false',
    property: 'isAccessibleForFree',
    ...typeAgnostic('isAccessibleForFree'),
    kind: 'literal',
    notes: 'DOUBLE SPACE between "Paid" and "Access" in the source',
  },
  {
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/CreativeWorkStatus.tsx`,
    line: 26,
    visible: 'Retired',
    visibleFrom: HARDCODED('CreativeWorkStatus.tsx'),
    tooltip: 'The resource is no longer available.',
    tooltipFrom: HARDCODED('CreativeWorkStatus.tsx'),
    condition: "creativeWorkStatus === 'Retired'",
    property: 'creativeWorkStatus',
    ...typeAgnostic('creativeWorkStatus'),
    kind: 'literal',
    notes:
      'gated behind the SHOW_RETIRED_RESOURCE_CATALOG_UI feature flag; no other creativeWorkStatus value renders a badge',
  },
  {
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/HasAPI.tsx`,
    line: 19,
    visible: 'API Available',
    visibleFrom: HARDCODED('HasAPI.tsx'),
    tooltip: 'The resource supports programmatic access to data.',
    tooltipFrom: HARDCODED('HasAPI.tsx'),
    condition: 'hasAPI is truthy',
    property: 'hasAPI',
    ...typeAgnostic('hasAPI'),
    kind: 'literal',
  },
  {
    family: 'access badge',
    routes: [RES, SEARCH],
    file: `${BADGES}/HasAPI.tsx`,
    line: 19,
    visible: 'API Not Available',
    visibleFrom: HARDCODED('HasAPI.tsx'),
    tooltip: 'The resource does not support programmatic access to data.',
    tooltipFrom: HARDCODED('HasAPI.tsx'),
    condition: 'hasAPI is falsy',
    property: 'hasAPI',
    ...typeAgnostic('hasAPI'),
    kind: 'literal',
  },
);

/**
 * hasDownload. The label is a prefix plus the raw API value, so its casing
 * follows the data; the tooltip is chosen from the lowercased value.
 */
const DOWNLOADS: [string, string][] = [
  ['All content', 'The resource allows download of all content.'],
  ['Partial content', 'The resource allows download of part of the content.'],
  [
    'Record-level',
    'The resource allows download of individual records, or selections of records.',
  ],
  ['No downloads', 'Content is not downloadable.'],
];
for (const [value, tooltip] of DOWNLOADS) {
  pills.push({
    family: 'access badge',
    routes: [RES],
    file: `${BADGES}/HasDownload.tsx`,
    line: 57,
    visible: `Has Download: ${value}`,
    visibleFrom: `${HARDCODED(
      'HasDownload.tsx',
    )} prefix + the raw hasDownload value from the NDE API`,
    tooltip,
    tooltipFrom: `getTooltipLabel() in ${BADGES}/HasDownload.tsx`,
    condition: `hasDownload.toLowerCase() === '${value.toLowerCase()}'`,
    property: 'hasDownload',
    ...typeAgnostic('hasDownload'),
    kind: 'literal',
    notes:
      'the only pill family with a prefix in its label; an unrecognised value yields an empty tooltip',
  });
}

// ------------------------------------- B. metadata accordion property pills
/**
 * label -> schema property, from the `switch` in generateMetadataContent and
 * generateMetadataContentforCompToolCard. The label is hardcoded in the
 * corresponding create*Content function; the tooltip is the schema description.
 */
const ACCORDION: [string, string][] = [
  ['Funding', 'funding'],
  ['Health Condition', 'healthCondition'],
  ['License', 'license'],
  ['Measurement Technique', 'measurementTechnique'],
  ['Pathogen', 'infectiousAgent'],
  ['Sample', 'sample'],
  ['Species', 'species'],
  ['Topic Category', 'topicCategory'],
  ['Usage Info', 'usageInfo'],
  ['Variable Measured', 'variableMeasured'],
  ['Available on Device', 'availableOnDevice'],
  ['Feature List', 'featureList'],
  ['Input', 'input'],
  ['Output', 'output'],
  ['Software Help', 'softwareHelp'],
  ['Software Requirements', 'softwareRequirements'],
  ['Software Version', 'softwareVersion'],
];

const ACCORDION_FILE =
  'src/views/search/components/results-list/components/card/metadata-accordion/index.tsx';

/** Tallied for the run summary so the README figures can be refreshed from it. */
const accordionBranches: Record<string, number> = {};

for (const [label, property] of ACCORDION) {
  const name = schemaName(property);
  const nameNote =
    name && name !== label
      ? `pill label differs from the schema name "${name}"`
      : '';

  // One row per distinct resolved wording: this pill's tooltip IS the schema
  // description, so it changes with the record's @type.
  const groups = descriptionGroups(property);
  for (const group of groups) {
    for (const type of group.types) {
      const { source } = resolveDescription(property, type);
      accordionBranches[source] = (accordionBranches[source] ?? 0) + 1;
    }
    const typeList = group.types.join(', ');
    const notes = [
      nameNote,
      group.source.includes('(fallback)')
        ? `resolved from the Dataset wording, not this type's own`
        : '',
      group.text ? '' : 'no wording for this type - the tooltip renders empty',
      groups.length > 1
        ? `wording varies by resource type (${groups.length} distinct)`
        : '',
    ].filter(Boolean);
    pills.push({
      family: 'accordion property',
      routes: [SEARCH],
      file: ACCORDION_FILE,
      line: 158,
      visible: label,
      visibleFrom: `hardcoded label: in src/components/metadata/helpers.ts, wired to '${property}' by the switch in generateMetadataContent`,
      tooltip: group.text || NO_WORDING,
      tooltipFrom:
        "configs/schema-definitions.json - description[type] || abstract[type] || description['Dataset']",
      condition: `the record has ${property} data and @type is ${typeList}`,
      property,
      resourceTypes: typeList,
      schemaDescription: group.text,
      descriptionSource: group.source,
      kind: 'resolved',
      notes: notes.join('; '),
    });
  }

  // The same pill in its empty state, where the tooltip is generated instead.
  // That template does not consult the schema, so it needs no per-type rows.
  pills.push({
    family: 'accordion property',
    routes: [SEARCH],
    file: ACCORDION_FILE,
    line: 158,
    visible: label,
    visibleFrom: `hardcoded label: in src/components/metadata/helpers.ts, wired to '${property}'`,
    tooltip: `No ${label.toLocaleLowerCase()} data.`,
    tooltipFrom: `template at ${ACCORDION_FILE}:158`,
    condition: `the record has NO ${property} data (isDisabled)`,
    property,
    ...typeAgnostic(property),
    kind: 'literal',
    notes: 'empty state - the schema description is not shown',
  });
}

// ---------------------------------------------------------- D. funding ID tag
pills.push({
  family: 'funding ID',
  routes: [RES, SEARCH],
  file: 'src/components/metadata/components/tag.tsx',
  line: 22,
  visible: 'ID | <funding identifier>',
  visibleFrom:
    "label 'ID' hardcoded at src/components/metadata/helpers.ts:388, value is funding.identifier from the NDE API",
  tooltip: '<funding identifier>',
  tooltipFrom:
    'src/components/metadata/helpers.ts:391 - the identifier, repeated',
  condition: 'funding.identifier or funding.url is present',
  property: 'funding.identifier',
  ...typeAgnostic('funding.identifier'),
  kind: 'literal',
  notes:
    'the tooltip repeats the visible value rather than explaining it; falls back to the literal "Funding ID" when no identifier exists',
});

// ------------------------------------------------------- C. ontology pills
/**
 * The label is whatever `inDefinedTermSet` holds for the term, so the set is
 * open-ended and has to be sampled. Two things vary by property and are worth
 * seeing side by side:
 *
 *  - infectiousAgent and species append " Taxon" when the term set is uniprot,
 *    but their tooltip interpolates the RAW value - so the pill reads
 *    "UniProt Taxon" while the tooltip says "See UniProt taxonomy information."
 *  - healthCondition says "ontology information" where every other property
 *    says "taxonomy information".
 */
const ONTOLOGY_FILE = 'src/components/metadata/components/buttons.tsx';

const ontologyLabel = (property: string, termSet: string) =>
  (property === 'infectiousAgent' || property === 'species') &&
  termSet.toLowerCase() === 'uniprot'
    ? `${termSet} Taxon`
    : property === 'measurementTechnique' &&
      termSet.toUpperCase().includes('EDAM')
    ? 'EDAM'
    : termSet;

const ontologyTooltip = (property: string, termSet: string) => {
  if (property === 'healthCondition') {
    return termSet === 'other'
      ? 'See term information in OLS.'
      : `See ${termSet} ontology information.`;
  }
  // measurementTechnique interpolates the mapped label; the others use the raw
  // term set even where the pill label was mapped.
  const interpolated =
    property === 'measurementTechnique'
      ? ontologyLabel(property, termSet)
      : termSet;
  return `See ${interpolated} taxonomy information.`;
};

const ONTOLOGY_PROPERTIES = [
  'infectiousAgent',
  'species',
  'healthCondition',
  'measurementTechnique',
  'topicCategory',
];

const addOntologyPills = (
  property: string,
  termSets: string[],
  total: number,
) => {
  for (const termSet of termSets) {
    const label = ontologyLabel(property, termSet);
    const tooltip = ontologyTooltip(property, termSet);
    pills.push({
      family: 'ontology',
      routes: [RES, SEARCH],
      file: ONTOLOGY_FILE,
      line: 42,
      visible: label,
      visibleFrom: `${property}.inDefinedTermSet from the NDE API`,
      tooltip,
      tooltipFrom: `template in src/components/metadata/helpers.ts (ontologyProps['aria-label'])`,
      condition: `${property}.inDefinedTermSet === '${termSet}'`,
      property,
      ...typeAgnostic(property),
      kind: 'sampled example',
      retrieved: TODAY,
      notes:
        label !== termSet && !tooltip.includes(label)
          ? `pill label "${label}" but the tooltip interpolates the raw value "${termSet}"`
          : '',
    });
  }
  if (total > termSets.length) {
    pills.push({
      family: 'ontology',
      routes: [RES, SEARCH],
      file: ONTOLOGY_FILE,
      line: 42,
      visible: `(+${
        total - termSets.length
      } more ontologies not listed - ${total} seen in the sample)`,
      visibleFrom: `${property}.inDefinedTermSet from the NDE API`,
      tooltip: `(+${
        total - termSets.length
      } more - one per ontology, same template)`,
      tooltipFrom: 'summary row',
      condition: `other ${property}.inDefinedTermSet values`,
      property,
      ...typeAgnostic(property),
      kind: 'summary',
      retrieved: TODAY,
    });
  }
};

/** Sample real term sets per property. The set is open-ended, so this is not exhaustive. */
const sampleOntologies = async () => {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    throw new Error(
      'NEXT_PUBLIC_API_URL must be set - run via `yarn generate-ui-pill-audit`',
    );
  }
  const fields = ONTOLOGY_PROPERTIES.map(p => `${p}.inDefinedTermSet`).join(
    ',',
  );
  const found: Record<string, Map<string, number>> = {};
  for (const p of ONTOLOGY_PROPERTIES) found[p] = new Map();

  const collect = (node: any, property: string) => {
    if (Array.isArray(node)) return node.forEach(n => collect(n, property));
    if (!node || typeof node !== 'object') return;
    const v = node.inDefinedTermSet;
    for (const term of Array.isArray(v) ? v : [v]) {
      if (typeof term === 'string' && term.trim()) {
        found[property].set(term, (found[property].get(term) ?? 0) + 1);
      }
    }
    for (const value of Object.values(node)) collect(value, property);
  };

  // Query per property so a property that is rare still gets a sample.
  for (const property of ONTOLOGY_PROPERTIES) {
    const res = await getJson(
      `${api}/query?q=_exists_:${property}.inDefinedTermSet&size=200&fields=${fields}`,
    );
    for (const hit of res?.hits ?? []) collect(hit[property], property);
  }
  for (const property of ONTOLOGY_PROPERTIES) {
    const sorted = [...found[property].entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term);
    addOntologyPills(property, sorted.slice(0, CAP), sorted.length);
  }
  return found;
};

// ------------------------------------------------------------------- writing
const write = async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, OUT_FILE);
  let out = csvLine([
    'pill family',
    'route',
    'file path',
    'line',
    'pill visible text',
    'origin of visible text',
    'tooltip text',
    'origin of tooltip text',
    'condition shown',
    'resource type',
    'schema property',
    'schema name',
    'schema description',
    'schema description source',
    'value kind',
    'retrieved',
    'notes',
  ]);
  let count = 0;
  for (const p of pills) {
    for (const route of p.routes) {
      out += csvLine([
        p.family,
        route,
        p.file,
        p.line,
        p.visible,
        p.visibleFrom,
        p.tooltip,
        p.tooltipFrom,
        p.condition,
        p.resourceTypes,
        p.property ?? '',
        p.property ? schemaName(p.property) : '',
        p.schemaDescription,
        p.descriptionSource,
        p.kind,
        p.retrieved ?? '',
        p.notes ?? '',
      ]);
      count++;
    }
  }
  await fs.writeFile(file, out);
  return { file, count };
};

const main = async () => {
  try {
    console.log('Building the UI pill inventory...');
    const found = await sampleOntologies();
    const { file, count } = await write();
    const byFamily = pills.reduce<Record<string, number>>((acc, p) => {
      acc[p.family] = (acc[p.family] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`${file}: ${count} rows`);
    console.log(`  distinct pills: ${pills.length}`);
    for (const [family, n] of Object.entries(byFamily)) {
      console.log(`    ${family.padEnd(20)} ${n}`);
    }
    for (const property of ONTOLOGY_PROPERTIES) {
      console.log(
        `  ${property.padEnd(22)} ${
          found[property].size
        } distinct ontologies sampled`,
      );
    }

    // Per-type wording, so the figures quoted in docs/schema/README.md can be
    // refreshed from a run rather than re-derived by hand.
    const audited = Array.from(
      new Set(pills.map(p => p.property).filter(Boolean) as string[]),
    );
    const varying = audited.filter(
      p => descriptionGroups(p).filter(g => g.text).length > 1,
    );
    console.log(
      `  ${varying.length} of ${audited.length} audited properties word their description differently per resource type`,
    );
    console.log(
      `  accordion chain branches over ${ACCORDION.length} properties x ${TYPES.length} types:`,
    );
    for (const [branch, n] of Object.entries(accordionBranches).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`    ${branch.padEnd(34)} ${n}`);
    }
  } catch (err: any) {
    console.error('Failed to build the UI pill inventory:', err.message);
    process.exit(1);
  }
};

main();
