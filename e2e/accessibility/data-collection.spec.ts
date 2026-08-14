/**
 * Accessibility tests for the DataCollection view of the Resource route
 * (`/resources?id=…` where the record's `@type` is `DataCollection`).
 *
 * Why this spec exists separately from `resources.spec.ts`: that spec covers the
 * route generically (one resting scan per `@type`, loading state, and the
 * unreachable empty/error states). This spec covers the DataCollection-specific
 * UI in `src/components/resource-sections` — the sections and components that
 * only a `DataCollection` record renders:
 *   - the top-of-page "Description" block (`components/description`), which for
 *     DataCollection is hoisted out of the collapsible Description section
 *   - the "generation process" card (`BasedOnActionProcess` in
 *     `components/based-on`), built from the `isBasedOn` entries whose
 *     `@type` is `Action`. Its detail panel is an accordion that is
 *     COLLAPSED by default, so its markup does not exist at rest — see the
 *     interaction state at the bottom of this file.
 *   - the "Research Domain" / "Content Types" / "Collection Size Details"
 *     overview blocks (`components/about`), which merge `about` with
 *     `exampleOfWork.about` and render above the main overview for this type
 *   - the "Example of Work" section (`components/example-of-work`): schema
 *     version, encoding formats and the schema-properties table
 *   - the sidebar "On This Page" nav, now filtered to `ui.showInNavigation`
 *     sections in `src/pages/resources.tsx`
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report but only
 * `serious`/`critical` impacts FAIL the build, so minor/moderate noise doesn't
 * block CI. See e2e/utils/axe.ts.
 *
 * Endpoints mocked (client-side): `**\/query*` — the NDE /query API backing
 * `getResourceById`. Nothing on this route is fetched at build time, so the
 * whole scanned DOM comes from the fixture below.
 *
 * State coverage — this spec intentionally scans the populated state plus one
 * interaction state, and not the full four-state matrix:
 *   - LOADING renders NONE of the UI above. Every DataCollection-specific block
 *     is gated on `data?.['@type'] === 'DataCollection'`, and `data` is
 *     undefined while the query is in flight, so the loading DOM is the generic
 *     skeleton set already scanned by `resources.spec.ts` ("Resource —
 *     loading"). Repeating it here would add runtime and no coverage.
 *   - EMPTY and ERROR are unreachable as in-route states: `src/pages/resources.tsx`
 *     runs `router.push('/404')` and returns `<></>` whenever `!isLoading &&
 *     !data`, which is true both when the query resolves with no hits and when
 *     it rejects. The inline `EmptyState`/`Error` JSX is dead code behind that
 *     redirect — exercising either navigates away to the 404 page, which
 *     `not-found.spec.ts` covers. This is documented at length in
 *     `resources.spec.ts`.
 *
 * The raw "JSON Metadata" section is excluded from the scan for the same reason
 * as in `resources.spec.ts` — see JSON_VIEWER_EXCLUDE.
 */
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { runAxeScans } from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

// The query is only `enabled` when an id is present, so always include one.
const ROUTE = '/resources?id=a11y-fixture-data-collection';

// The only endpoint this route reads. The NDE API endpoints are NOT under
// `/api/` — `getResourceById` GETs `${API_URL}/query`.
const API_GLOB = '**/query*';

// The "JSON Metadata" section (`<section id="metadata">`) renders the raw record
// through react-json-tree. That third-party widget emits `<div>` chunk toggles
// directly inside its `<ul>`s once a collection exceeds 50 entries (axe `list`
// rule, serious). The invalid markup is owned by the library, not this app, so
// we exclude the JSON tree's lists rather than fail on output we can't fix here;
// the section heading and its Download/Copy buttons stay covered.
const JSON_VIEWER_EXCLUDE = '#metadata ul';

// Fixture-only strings we wait on / assert, so we know the scanned DOM came from
// the mock and not from a stale render.
const NAME = 'BV-BRC uncultured Pseudoalteromonas sp. genomes (a11y fixture)';
const DESCRIPTION_SNIPPET = 'publicly available from the BV-BRC API version';
const ACTION_NAME =
  'DataCollection Generation Process in the NIAID Data Ecosystem';

// A representative raw NDE /query hit. `getResourceById` reads `hits[0]` and
// runs it through `formatAPIResource` (which spreads the record, so `about` and
// `exampleOfWork` pass through untouched), then the page stores it as `rawData`.
//
// Shaped after a real BV-BRC genome DataCollection, but deliberately exercising
// every branch of the new components:
//   - `about` carries one term WITH a url and one WITHOUT, so both TagWithUrl
//     branches render (linked tag vs. plain text).
//   - `exampleOfWork.about` duplicates `about[0]`, so the de-duplication in
//     `AboutResource` is exercised (one "Genome" tag, not two).
//   - `collectionSize` uses both `minValue` and `value` rows.
//   - `exampleOfWork.encodingFormat` includes an entry without a `url`.
//   - `exampleOfWork.additionalProperty` includes a `name`+`value` row, a
//     `propertyID`-only row, a row with neither (renders "Unknown property") and
//     a row with no value ("Unknown value") — and enough rows to overflow the
//     400px scroll container, with NO focusable content inside it (see the
//     `documentation_type` row for why that matters).
//   - `isBasedOn` mixes an `Action` (→ the generation-process card, with
//     `disambiguatingDescription` and a multi-step `actionProcess`) with a
//     `ResourceCatalog` (→ the Based On table), covering the split introduced on
//     this branch.
const HIT = {
  '@type': 'DataCollection',
  _id: 'a11y_fixture_data_collection',
  _meta: {
    completeness: {
      augmented_recommended_ratio: 0,
      augmented_required_ratio: 0,
      recommended_max_score: 21,
      recommended_score: 12,
      recommended_score_ratio: 0.57,
      required_max_score: 9,
      required_ratio: 0.78,
      required_score: 7,
      total_max_score: 30,
      total_recommended_augmented: 5,
      total_required_augmented: 2,
      total_score: 19,
    },
    lineage: [],
    recommended_augmented_fields: [],
    recommended_fields: [
      'dateCreated',
      'dateModified',
      'infectiousAgent',
      'species',
      'variableMeasured',
      'conditionsOfAccess',
      'isBasedOn',
      'license',
      'topicCategory',
      'usageInfo',
    ],
    required_augmented_fields: [],
    required_fields: [
      'name',
      'description',
      'url',
      'measurementTechnique',
      'includedInDataCatalog',
      'funding',
      'date',
    ],
  },
  _score: 2,
  about: [
    {
      '@type': 'DefinedTerm',
      description: 'Subclass of BioChemEntity',
      displayName: 'Genome',
      inDefinedTermSet: 'NCIT',
      name: 'Genome',
      url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
    },
    {
      // No `url` — renders through TagWithUrl's plain-text branch.
      '@type': 'DefinedTerm',
      displayName: 'Antimicrobial resistance phenotype',
      inDefinedTermSet: 'NCIT',
      name: 'Antimicrobial resistance phenotype',
    },
  ],
  collectionSize: [
    { '@type': 'QuantitativeValue', minValue: 81, unitText: 'Genomes' },
    {
      '@type': 'QuantitativeValue',
      unitText: 'Antimicrobial resistance panels',
      value: 12,
    },
  ],
  conditionsOfAccess: 'Open',
  creditText:
    'see https://www.bv-brc.org/citation for how to cite this resource',
  date: '2025-02-07',
  dateCreated: '2021-09-18',
  dateModified: '2025-02-07',
  description:
    'uncultured Pseudoalteromonas sp. genomes publicly available from the BV-BRC API version 1.9.3 and/or FTP. These genomes were collected from Canada, China, South Korea, Spain and undisclosed locations. For more details, visit: https://www.bv-brc.org/view/Taxonomy/114053#view_tab=genomes',
  exampleOfWork: {
    '@type': 'CreativeWork',
    // Duplicates `about[0]` so the content-type de-duplication runs.
    about: {
      '@type': 'DefinedTerm',
      displayName: 'Genome',
      inDefinedTermSet: 'NCIT',
      name: 'Genome',
      termCode: 'NCIT:C16629',
      url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'genome_id', value: 'string' },
      { '@type': 'PropertyValue', name: 'genome_name', value: 'string' },
      { '@type': 'PropertyValue', name: 'taxon_id', value: 'integer' },
      { '@type': 'PropertyValue', name: 'taxon_lineage_ids', value: 'integer' },
      { '@type': 'PropertyValue', name: 'isolation_country', value: 'string' },
      { '@type': 'PropertyValue', name: 'host_common_name', value: 'string' },
      { '@type': 'PropertyValue', name: 'host_name', value: 'string' },
      {
        '@type': 'PropertyValue',
        name: 'host_scientific_name',
        value: 'string',
      },
      { '@type': 'PropertyValue', name: 'host_taxon_id', value: 'integer' },
      { '@type': 'PropertyValue', name: 'collection_date', value: 'date' },
      { '@type': 'PropertyValue', name: 'collection_year', value: 'integer' },
      { '@type': 'PropertyValue', name: 'geographic_group', value: 'string' },
      { '@type': 'PropertyValue', name: 'genome_status', value: 'string' },
      { '@type': 'PropertyValue', name: 'genome_length', value: 'integer' },
      { '@type': 'PropertyValue', name: 'gc_content', value: 'float' },
      {
        '@type': 'PropertyValue',
        name: 'sequencing_platform',
        value: 'string',
      },
      { '@type': 'PropertyValue', name: 'assembly_method', value: 'string' },
      { '@type': 'PropertyValue', name: 'date_inserted', value: 'date' },
      { '@type': 'PropertyValue', name: 'date_modified', value: 'date' },
      // `propertyID` only — the name falls back to the identifier.
      { '@type': 'PropertyValue', propertyID: 'public', value: 'boolean' },
      // Neither name nor propertyID — renders "Unknown property".
      { '@type': 'PropertyValue', value: 'string' },
      // No value — renders "Unknown value".
      { '@type': 'PropertyValue', name: 'antimicrobial_resistance' },
      // Deliberately NOT an http value. Every row here is a plain type name —
      // which is what a real schema doc looks like — so the overflowing scroll
      // container holds NO focusable content. That is what makes this fixture a
      // regression guard for axe's `scrollable-region-focusable` (serious): the
      // container only passes because `ExampleOfWorkDisplay` sets `tabIndex={0}`
      // on it. Adding a link inside this table would satisfy the rule
      // incidentally and silently retire the guard. The
      // `value.startsWith('http')` → external-link branch renders the same
      // `<Link isExternal>` already covered by `schemaVersion` and
      // `encodingFormat` above.
      {
        '@type': 'PropertyValue',
        name: 'documentation_type',
        value: 'string',
      },
    ],
    encodingFormat: [
      {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'EDAM',
        name: 'JSON',
        url: 'http://edamontology.org/format_3464',
      },
      {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'EDAM',
        name: 'TSV',
        url: 'http://edamontology.org/format_3475',
      },
      // No `url` — renders as plain text between the HStack dividers.
      { '@type': 'DefinedTerm', inDefinedTermSet: 'EDAM', name: 'CSV' },
    ],
    potentialAction: {
      '@type': 'Action',
      name: 'Use API call for an example record',
      target:
        'https://www.bv-brc.org/api/genome/?eq(taxon_lineage_ids,114053)&http_accept=application/json&limit(1,0)',
    },
    schemaVersion: 'https://www.bv-brc.org/api/doc/genome',
  },
  funding: [
    {
      '@type': 'MonetaryGrant',
      endDate: '2029-06-30',
      funder: [
        {
          '@type': 'Organization',
          alternateName: ['NIAID'],
          identifier: 'https://ror.org/043z4tv69',
          name: 'National Institute of Allergy and Infectious Diseases',
          parentOrganization: 'National Institutes of Health',
        },
      ],
      identifier: '1U24AI183849-01',
      name: 'The Bacterial and Viral Bioinformatics Resource Center (BV-BRC)',
      startDate: '2024-07-18',
      url: 'https://reporter.nih.gov/project-details/10913717',
    },
  ],
  genre: 'IID',
  includedInDataCatalog: [
    {
      '@type': 'DataCatalog',
      alternateName: 'BV-BRC',
      archivedAt:
        'https://www.bv-brc.org/view/Taxonomy/114053#view_tab=genomes',
      name: 'Bacterial and Viral Bioinformatics Resource Center',
      url: 'https://www.bv-brc.org/',
    },
  ],
  infectiousAgent: [
    {
      '@type': 'DefinedTerm',
      identifier: 'taxonomy:114053',
      inDefinedTermSet: 'NCBI Taxonomy',
      name: 'uncultured Pseudoalteromonas sp.',
      url: 'https://www.ncbi.nlm.nih.gov/taxonomy/114053',
    },
  ],
  isAccessibleForFree: true,
  isBasedOn: [
    {
      // `@type: 'Action'` → the collapsible generation-process card.
      '@type': 'Action',
      actionProcess: {
        '@type': 'HowTo',
        step: [
          "Step 1: Download bulk genome data from the BV-BRC FTPS server. Stream and aggregate three tab-separated files: 'genome_metadata' for per-taxon genome counts, isolation countries, host organisms, diseases, collection dates, and earliest completion dates; 'genome_summary' for the latest date_modified per taxon; and 'genome_lineage' for species names and species-level taxon grouping.",
          "Step 2: Parse the aggregated records to generate an organism-specific DataCollection per species-level NCBI Taxonomy ID. Use the count of genome records for 'collectionSize'.",
          "Step 3: Fill in manually curated fields from the BV-BRC resource catalog record such as 'measurementTechnique', 'variableMeasured', 'topicCategory', 'conditionsOfAccess' and 'usageInfo'.",
        ],
      },
      description:
        'How this BV-BRC Genome DataCollection record was generated for the NIAID Data Ecosystem.',
      disambiguatingDescription:
        'Generated by the NIAID Data Ecosystem from bulk BV-BRC downloads.',
      name: ACTION_NAME,
    },
    {
      // Not an Action → stays in the Based On table.
      '@type': 'ResourceCatalog',
      name: 'Bacterial and Viral Bioinformatics Resource Center',
      url: 'https://data.niaid.nih.gov/resources?id=dde_42e839db86d4166d',
    },
  ],
  license:
    'https://www.bv-brc.org/docs/system_documentation/data_management_sharing.html',
  measurementTechnique: [
    {
      '@type': 'DefinedTerm',
      inDefinedTermSet: 'NCIT',
      isCurated: true,
      name: 'Curation',
      url: 'http://purl.obolibrary.org/obo/NCIT_C48292',
    },
  ],
  name: NAME,
  species: [
    {
      '@type': 'DefinedTerm',
      identifier: 'taxonomy:114053',
      inDefinedTermSet: 'NCBI Taxonomy',
      name: 'uncultured Pseudoalteromonas sp.',
      url: 'https://www.ncbi.nlm.nih.gov/taxonomy/114053',
    },
  ],
  topicCategory: [
    {
      '@type': 'DefinedTerm',
      identifier: 'topic_0622',
      inDefinedTermSet: 'EDAM',
      name: 'Genomics',
      url: 'http://edamontology.org/topic_0622',
    },
  ],
  url: 'https://www.bv-brc.org/view/Taxonomy/114053#view_tab=genomes',
  usageInfo: {
    url: 'https://www.bv-brc.org/docs/system_documentation/data_management_sharing.html',
  },
  variableMeasured: [
    {
      '@type': 'DefinedTerm',
      inDefinedTermSet: 'EFO',
      isCurated: true,
      name: 'genomic measurement',
      url: 'http://www.ebi.ac.uk/efo/EFO_0004554',
    },
  ],
};

// The page only ever renders `hits[0]`.
const FIXTURE = { total: 1, hits: [HIT] };

/** Mock the single endpoint this route reads, then land on the record. */
async function gotoDataCollection(page: Page) {
  await page.route(API_GLOB, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE),
    }),
  );
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

  // The record name renders as the page h1 only once the fixture resolves, so
  // this is the signal that we're looking at the populated DOM rather than the
  // loading skeletons or a transient redirect frame. (Chakra `Skeleton`
  // wrappers keep their class after loading, so the named h1 is the reliable
  // readiness check here.) `NAME` contains regex metacharacters, so match on
  // the exact string rather than building a RegExp.
  await expect(
    page.getByRole('heading', { level: 1, name: NAME }),
  ).toBeVisible();
}

// --- Shared checks run in every resting state --------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — the `main` landmark proves the page chrome rendered.
  await expect(page.getByRole('main')).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route
  // (`includeSearchBar`) and its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state, { exclude: JSON_VIEWER_EXCLUDE });
}

// --- Populated ---------------------------------------------------------------

test.describe('a11y: DataCollection resource — populated', () => {
  test('passes axe with a representative DataCollection record', async ({
    page,
  }, testInfo) => {
    await gotoDataCollection(page);

    // Fixture strings also appear in the raw-JSON section further down the page,
    // so every text assertion below takes `.first()` — DOM order puts the real
    // UI ahead of the JSON tree.

    // Hoisted description block: for DataCollection the description renders at
    // the top of the page under its own label, not inside the Description
    // section.
    await expect(
      page.getByText('Description', { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText(DESCRIPTION_SNIPPET).first()).toBeVisible();

    // Generation-process card, collapsed at rest.
    await expect(page.getByText(ACTION_NAME).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /show details/i }),
    ).toBeVisible();

    // `AboutResource` blocks above the overview.
    await expect(page.getByText(/research domain/i).first()).toBeVisible();
    await expect(page.getByText(/content types/i).first()).toBeVisible();
    await expect(
      page.getByText(/collection size details/i).first(),
    ).toBeVisible();

    // "Example of Work" section — a collapsible Section, so its accessible
    // surface is the accordion button, and it is open by default.
    await expect(
      page.getByRole('button', {
        name: /show more details about example of work/i,
      }),
    ).toBeVisible();
    await expect(page.getByText('Schema version').first()).toBeVisible();
    await expect(page.getByText('Encoding format').first()).toBeVisible();
    await expect(page.getByText('Schema properties').first()).toBeVisible();

    // Sidebar "On This Page" nav — proves the new section is navigable and that
    // the `ui.showInNavigation` filter added in src/pages/resources.tsx still
    // lists it.
    await expect(
      page.getByRole('link', { name: 'Example of Work', exact: true }),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'populated — DataCollection');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The resting scan above sees the page as it first paints. The one surface it
// cannot see is the generation-process detail panel: `BasedOnActionProcess`
// wraps it in a Chakra `Accordion allowToggle` with no `defaultIndex`, so the
// panel — the action's description and its numbered steps — is not expanded on
// first paint. That markup is scanned below.
//
// The collapsible `Section` accordions (Overview, Description, Based On,
// Example of Work, …) are NOT scanned as interaction states: they default to
// `isDefaultOpen`, so their expanded panels are already covered by the resting
// scan, and toggling them only removes markup.

test.describe('a11y: DataCollection resource — action process details', () => {
  test('passes axe with the generation-process panel expanded', async ({
    page,
  }, testInfo) => {
    await gotoDataCollection(page);

    // Expand the action's details, then wait for the panel's own accessible
    // proof — the button flips to "Hide details" and the "Steps" block mounts —
    // before scanning, so we scan the expanded DOM and not the frame before it.
    await page.getByRole('button', { name: /show details/i }).click();

    await expect(
      page.getByRole('button', { name: /hide details/i }),
    ).toBeVisible();
    await expect(page.getByText('Steps', { exact: true })).toBeVisible();

    await runAxeScans(page, testInfo, 'action-process-expanded', {
      exclude: JSON_VIEWER_EXCLUDE,
    });
  });
});
