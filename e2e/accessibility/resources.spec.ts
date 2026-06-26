/**
 * Accessibility tests for the Resource (dataset detail) route (`/resources`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * State coverage note — this route is intentionally NOT the full four-state
 * matrix, because of how `src/pages/resources.tsx` is built:
 *   - The page reads `id` from the query string and fetches a single record
 *     client-side via TanStack Query (`getResourceById` → the NDE `**\/query*`
 *     endpoint, reading `hits[0]`). Only this client-side request runs in the
 *     browser, so `page.route` can deterministically drive the loading and
 *     populated states. We always navigate with `?id=...` (the query is
 *     `enabled` only when an id is present) and wait for state-specific UI
 *     before scanning, so we scan the mocked DOM and not a transient frame.
 *   - EMPTY and ERROR are unreachable as in-route states. The component runs
 *     `router.push('/404')` and returns `<></>` whenever `!isLoading && !data`,
 *     which is true both when the query resolves with no hits AND when it
 *     rejects (on error, `data` is undefined). So the inline `EmptyState` and
 *     `Error` JSX blocks are dead code behind that redirect — exercising either
 *     navigates away to the 404 page, which is out of scope for this route's
 *     spec. The deterministic, accessible in-route states are loading and
 *     populated, which is what we scan below.
 *
 * Endpoints mocked (client-side): `**\/query*` — the NDE /query API backing
 * `getResourceById`.
 *
 * Populated coverage runs once per resource `@type` that can back this route
 * (DataCollection, Dataset, ComputationalTool), since each renders a different
 * section set; the h1 readiness check is keyed off each record's `name`. The
 * raw "JSON Metadata" section is excluded from the scan — see
 * JSON_VIEWER_EXCLUDE for why.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  attachScreenshot,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

// The query is only `enabled` when an id is present, so always include one.
const ROUTE = '/resources?id=accessibility-fixture-resource';

// The only endpoint this route reads. The NDE API endpoints are NOT under
// `/api/` — `getResourceById` GETs `${API_URL}/query`.
const API_GLOB = '**/query*';

// The "JSON Metadata" section (`<section id="metadata">`) renders the raw record
// through react-json-tree. That third-party widget emits `<div>` chunk toggles
// ("51 ... 100") directly inside its `<ul>`s once a collection exceeds 50 entries
// (axe `list` rule, serious) — which real ComputationalTool records routinely do,
// since the API returns 50+ fields. The invalid markup is owned by the library,
// not this app, so we exclude the JSON tree from the scan rather than fail on
// output we can't fix here. We target only the tree's lists so the section
// heading and the Download/Copy buttons stay covered.
const JSON_VIEWER_EXCLUDE = '#metadata ul';

// Representative raw NDE /query hits for the populated state. `getResourceById`
// reads `hits[0]` and runs it through `formatAPIResource`, so each hit must
// carry enough fields to render the header (h1 = name), the Description and
// Provenance sections, and the sidebar. We include one of each resource `@type`
// that can back this route — DataCollection, Dataset and ComputationalTool —
// because they render different section sets; the populated test below scans
// each in turn. Every hit carries its own `_meta.completeness`.
const HITS = [
  {
    '@type': 'DataCollection',
    _id: 'bvbrc_genome_114053',
    _ignored: ['all.keyword'],
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
        'spatialCoverage',
        'temporalCoverage',
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
    about: {
      '@type': 'DefinedTerm',
      description: 'Subclass of BioChemEntity',
      displayName: 'Genome',
      name: 'Genome',
      url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
    },
    collectionSize: [
      {
        '@type': 'QuantitativeValue',
        minValue: 81,
        unitText: 'Genomes',
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
      about: {
        '@type': 'DefinedTerm',
        displayName: 'Genome',
        inDefinedTermSet: 'NCIT',
        name: 'Genome',
        termCode: 'NCIT:C16629',
        url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
      },
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
        {
          '@type': 'DefinedTerm',
          inDefinedTermSet: 'EDAM',
          name: 'CSV',
          url: 'http://edamontology.org/format_3752',
        },
      ],
      potentialAction: {
        '@type': 'Action',
        name: 'Use API call for an example record',
        target:
          'https://www.bv-brc.org/api/genome/?eq(taxon_lineage_ids,114053)&select(genome_id,genome_name,taxon_id,taxon_lineage_ids,isolation_country,host_common_name,host_name,host_scientific_name,host_taxon_id)&sort(+genome_id)&http_accept=application/json&limit(1,0)',
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
            alternateName: [
              'National Institute of Allergy & Infectious Diseases',
              'NIAID',
              'Instituto Nacional de Alergias y Enfermedades Infecciosas',
            ],
            employee: [
              {
                familyName: 'RUTVISUTTINUNT',
                givenName: 'WIRIYA',
                name: 'WIRIYA RUTVISUTTINUNT',
              },
            ],
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
        '@type': 'Action',
        actionProcess: {
          '@type': 'HowTo',
          step: [
            "Step 1: Download bulk genome data from the BV-BRC FTPS server (ftps://ftp.bv-brc.org/RELEASE_NOTES/bacteria/ and ftps://ftp.bv-brc.org/RELEASE_NOTES/viruses/). Stream and aggregate three tab-separated files: 'genome_metadata' for per-taxon genome counts, isolation countries, host organisms, diseases, collection dates, and earliest completion dates; 'genome_summary' for the latest date_modified per taxon; and 'genome_lineage' for species names and species-level taxon grouping.",
            "Step 2: Parse the aggregated records to generate an organism-specific DataCollection per species-level NCBI Taxonomy ID. Use the latest 'date_modified' from genome_summary for 'dateModified' and the earliest 'completion_date' from genome_metadata for 'dateCreated'. Generate 'temporalCoverage' from the 'collection_date' values across all records for that organism. Use the count of genome records for 'collectionSize'. Generate the values for 'species', 'infectiousAgent', 'url', 'name', and 'description' properties based on the information retrieved for the NCBI taxonomy code and any templated text.",
            "Step 3. Fill in manually curated fields from the BV-BRC resource catalog record such as 'measurementTechnique', 'variableMeasured', 'topicCategory', 'conditionsOfAccess', 'usageInfo'.",
          ],
        },
        description:
          'How this BV-BRC Genome DataCollection Record was generated for the NIAID Data Ecosystem.',
        name: 'DataCollection Generation Process in the NIAID Data Ecosystem',
      },
      {
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
      {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'EDAM',
        isCurated: true,
        name: 'Annotation',
        url: 'http://edamontology.org/operation_0226',
      },
    ],
    name: 'BV-BRC uncultured Pseudoalteromonas sp. genomes',
    spatialCoverage: [
      {
        '@type': 'AdministrativeArea',
        administrativeType: 'country',
        locationType: 'collection',
        name: 'Canada',
      },
      {
        '@type': 'AdministrativeArea',
        administrativeType: 'country',
        locationType: 'collection',
        name: 'China',
      },
      {
        '@type': 'AdministrativeArea',
        administrativeType: 'country',
        locationType: 'collection',
        name: 'South Korea',
      },
      {
        '@type': 'AdministrativeArea',
        administrativeType: 'country',
        locationType: 'collection',
        name: 'Spain',
      },
    ],
    species: [
      {
        '@type': 'DefinedTerm',
        identifier: 'taxonomy:114053',
        inDefinedTermSet: 'NCBI Taxonomy',
        name: 'uncultured Pseudoalteromonas sp.',
        url: 'https://www.ncbi.nlm.nih.gov/taxonomy/114053',
      },
    ],
    temporalCoverage: [
      {
        '@type': 'TemporalInterval',
        endDate: '2020',
        name: 'Collection Period',
        startDate: '2010',
        temporalType: 'collection',
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
      {
        '@type': 'DefinedTerm',
        identifier: 'topic_2259',
        inDefinedTermSet: 'EDAM',
        name: 'Computational biology',
        url: 'http://edamontology.org/topic_2259',
      },
      {
        '@type': 'DefinedTerm',
        identifier: 'topic_0091',
        inDefinedTermSet: 'EDAM',
        name: 'Bioinformatics',
        url: 'http://edamontology.org/topic_0091',
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
  },

  {
    '@type': 'Dataset',
    _id: 'prjeb64017',
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 11,
        recommended_score_ratio: 0.52,
        required_max_score: 9,
        required_ratio: 1,
        required_score: 9,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 20,
      },
      lineage: [
        {
          parent_taxon: 76804,
          taxon: 2499399,
        },
        {
          parent_taxon: 6072,
          taxon: 33213,
        },
        {
          parent_taxon: 32523,
          taxon: 32524,
        },
        {
          parent_taxon: 376913,
          taxon: 314293,
        },
        {
          parent_taxon: 7742,
          taxon: 7776,
        },
        {
          parent_taxon: 694002,
          taxon: 2509481,
        },
        {
          parent_taxon: 3433758,
          taxon: 290028,
        },
        {
          taxon: 1,
        },
        {
          parent_taxon: 33511,
          taxon: 7711,
        },
        {
          parent_taxon: 9347,
          taxon: 1437010,
        },
        {
          parent_taxon: 117570,
          taxon: 117571,
        },
        {
          parent_taxon: 33208,
          taxon: 6072,
        },
        {
          parent_taxon: 2559587,
          taxon: 2732396,
        },
        {
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
        },
        {
          parent_taxon: 2499399,
          taxon: 11118,
        },
        {
          parent_taxon: 1,
          taxon: 10239,
        },
        {
          parent_taxon: 33213,
          taxon: 33511,
        },
        {
          parent_taxon: 7776,
          taxon: 117570,
        },
        {
          parent_taxon: 8287,
          taxon: 1338369,
        },
        {
          parent_taxon: 33154,
          taxon: 33208,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
        },
        {
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 9443,
          taxon: 376913,
        },
        {
          parent_taxon: 1338369,
          taxon: 32523,
        },
        {
          parent_taxon: 2732506,
          taxon: 76804,
        },
        {
          parent_taxon: 2732408,
          taxon: 2732506,
        },
        {
          parent_taxon: 314295,
          taxon: 9604,
        },
        {
          parent_taxon: 131567,
          taxon: 2759,
        },
        {
          parent_taxon: 1437010,
          taxon: 314146,
        },
        {
          parent_taxon: 314293,
          taxon: 9526,
        },
        {
          parent_taxon: 2509481,
          taxon: 3433758,
        },
        {
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
        },
        {
          parent_taxon: 10239,
          taxon: 2559587,
        },
        {
          parent_taxon: 32524,
          taxon: 40674,
        },
        {
          parent_taxon: 40674,
          taxon: 32525,
        },
        {
          parent_taxon: 2759,
          taxon: 33154,
        },
        {
          parent_taxon: 32525,
          taxon: 9347,
        },
        {
          parent_taxon: 9526,
          taxon: 314295,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
        {
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 2501931,
          taxon: 694002,
        },
        {
          parent_taxon: 11118,
          taxon: 2501931,
        },
        {
          parent_taxon: 2732396,
          taxon: 2732408,
        },
      ],
      recommended_augmented_fields: [],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'infectiousAgent',
        'healthCondition',
        'species',
        'citation',
        'license',
        'sdPublisher',
        'spatialCoverage',
        'temporalCoverage',
        'identifier',
      ],
      required_augmented_fields: [],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'measurementTechnique',
        'includedInDataCatalog',
        'distribution',
        'funding',
        'date',
      ],
    },
    _score: 2,
    author: [
      {
        identifier: null,
        type: 'Organization',
        name: 'Institut Pasteur',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    citation: [
      {
        abstract: null,
        author: null,
        citation: null,
        datePublished: null,
        description: null,
        doi: null,
        id: null,
        issueNumber: null,
        journalName: null,
        journalNameAbbrev: null,
        name: 'TMPRSS2 is a functional receptor for human coronavirus HKU1',
        pagination: null,
        pmcid: null,
        pmid: null,
        url: 'https://www.nature.com/articles/s41586-023-06761-7',
        volumeNumber: null,
      },
    ],
    date: '2025-04-07',
    dateCreated: '2025-04-07',
    dateModified: '2025-04-07',
    datePublished: '2023-07-13',
    description:
      'Sequencing of viral stocks of HKU-1 used for in vitro characterizations',
    distribution: [
      {
        '@type': 'DataDownload',
        contentUrl: 'https://www.ebi.ac.uk/ena/data/view/PRJEB64017',
        dateModified: '2023-10-25',
        encodingFormat: null,
        contentSize: null,
        dateCreated: null,
        datePublished: null,
        description: null,
        name: null,
        '@id': null,
      },
    ],
    funding: [
      {
        '@type': 'MonetaryGrant',
        endDate: '2025-05-31',
        funder: [
          {
            '@type': 'Organization',
            alternateName: [
              'National Institute of Allergy & Infectious Diseases',
              'NIAID',
              'Instituto Nacional de Alergias y Enfermedades Infecciosas',
            ],
            employee: [
              {
                familyName: 'PATTERSON',
                givenName: 'JEAN',
                name: 'JEAN PATTERSON',
              },
            ],
            identifier: 'https://ror.org/043z4tv69',
            name: 'National Institute of Allergy and Infectious Diseases',
            parentOrganization: 'National Institutes of Health',
          },
        ],
        identifier: '1U01AI151758-01',
        name: 'Inter-regional study of transmission, adaptation and pathogenesis of viruses with pandemic potential in Southeast Asia and West/Central Africa',
        startDate: '2020-07-17',
        url: 'https://reporter.nih.gov/project-details/9967380',
      },
      {
        '@type': 'MonetaryGrant',
        funder: [
          {
            '@type': 'Organization',
            name: 'INCEPTION',
            parentOrganization: 'ANR',
          },
        ],
        identifier: 'ANR-16-CONV-0005',
      },
      {
        '@type': 'MonetaryGrant',
        funder: [
          {
            '@type': 'Organization',
            name: 'LABEX IBEID',
            parentOrganization: 'ANR',
          },
        ],
        identifier: 'ANR-10-LABX-62-IBEID',
      },
    ],
    healthCondition: [
      {
        '@type': 'DefinedTerm',
        alternateName: ['viral respiratory tract infection'],
        curatedBy: {
          dateModified: '2026-06-11',
          name: 'Data Discovery Engine',
          url: 'https://discovery.biothings.io/',
        },
        identifier: '0024352',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'viral respiratory tract infection',
        originalName: 'viral respiratory tract infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0024352',
      },
    ],
    identifier: 'PRJEB64017',
    includedInDataCatalog: [
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://discovery.biothings.io/dataset/b3b48c620dde8112',
        name: 'Data Discovery Engine',
        url: 'https://discovery.biothings.io/',
        versionDate: '2026-06-13',
      },
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://www.ncbi.nlm.nih.gov/bioproject/PRJEB64017',
        name: 'NCBI BioProject',
        url: 'https://www.ncbi.nlm.nih.gov/bioproject/',
        versionDate: '2026-06-13',
      },
    ],
    infectiousAgent: [
      {
        '@type': 'DefinedTerm',
        alternateName: ['CoV-HKU1', 'HCoV-HKU1', 'Human CoV/HKU1'],
        classification: 'infectiousAgent',
        commonName: 'HCoV-HKU1',
        curatedBy: {
          dateModified: '2026-06-11',
          name: 'Data Discovery Engine',
          url: 'https://discovery.biothings.io/',
        },
        displayName: 'HCoV-HKU1 | Human coronavirus HKU1',
        identifier: '290028',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Human coronavirus HKU1',
        originalName: 'Human coronavirus HKU1',
        url: 'https://www.uniprot.org/taxonomy/290028',
      },
    ],
    keywords: ['monoisolate'],
    license:
      'https://s100.copyright.com/AppDispatchServlet?title=TMPRSS2%20is%20a%20functional%20receptor%20for%20human%20coronavirus%20HKU1&author=Nell%20Saunders%20et%20al&contentID=10.1038%2Fs41586-023-06761-7&copyright=The%20Author%28s%29%2C%20under%20exclusive%20licence%20to%20Springer%20Nature%20Limited&publication=0028-0836&publicationDate=2023-10-25&publisherName=SpringerNature&orderBeanReset=true',
    measurementTechnique: [
      {
        alternateName: [
          'Illumina Sequencing Technology',
          'Illumina Sequencing',
          'Illumina',
        ],
        curatedBy: {
          dateModified: '2026-06-13',
          name: 'Data Discovery Engine',
          url: 'https://discovery.biothings.io/',
        },
        inDefinedTermSet: 'NCIT',
        isCurated: true,
        name: 'Illumina Sequencing',
        url: 'http://purl.obolibrary.org/obo/NCIT_C146817',
      },
    ],
    name: 'Sequence of HKU1 isolates',
    sdPublisher: [
      {
        '@type': 'Organization',
        name: 'ENA',
      },
    ],
    sourceOrganization: [
      {
        '@type': 'ResearchProject',
        abstract:
          'The Centers for Research in Emerging Infectious Diseases (CREID) Network is a global consortium of research centers focused on studying emerging and re-emerging infectious diseases in regions prone to outbreaks. These centers conduct surveillance, research, and response efforts to better mitigate future infectious disease threats.',
        alternateName: [
          'CREID',
          'Centers for Research in Emerging Infectious Disease',
        ],
        description:
          'The Centers for Research in Emerging Infectious Diseases (CREID) Network is a coordinated group of emerging infectious disease research centers situated in regions around the globe where emerging and re-emerging infectious disease outbreaks are likely to occur.',
        name: 'NIAID CREID Network',
        parentOrganization: 'NIAID',
        url: 'https://creid-network.org/',
      },
    ],
    spatialCoverage: [
      {
        '@type': 'AdministrativeArea',
        name: 'Europe',
      },
    ],
    species: [
      {
        '@type': 'DefinedTerm',
        alternateName: [
          'Homo sapiense',
          'Homo spaiens',
          'Homo sapeins',
          'Homo sapians',
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'Humo sapiens',
          'Homo sapiens (PARIS)',
          'Home sapiens',
          'Homo spiens',
          'Homo sapian',
          'Homo sampiens',
          'Homo sapiens (SIRT6)',
          'Homo sapien',
          'human',
          'Homo sapines',
          'Homo sapience',
          'Homo sapients',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2026-06-11',
          name: 'Data Discovery Engine',
          url: 'https://discovery.biothings.io/',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'Homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    temporalCoverage: [
      {
        '@type': 'TemporalInterval',
        endDate: '2023-12-31',
        startDate: '2022-01-01',
      },
    ],
    url: 'https://discovery.biothings.io/dataset/b3b48c620dde8112',
    variableMeasured: [
      {
        name: 'Other',
      },
    ],
  },
  {
    '@type': 'ComputationalTool',
    _id: 'biotools_recoder',
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0,
        augmented_required_ratio: 0,
        recommended_max_score: 20,
        recommended_score: 15,
        recommended_score_ratio: 0.75,
        required_max_score: 6,
        required_ratio: 0.83,
        required_score: 5,
        total_max_score: 26,
        total_recommended_augmented: 2,
        total_required_augmented: 1,
        total_score: 20,
      },
      lineage: [],
      recommended_augmented_fields: [],
      recommended_fields: [
        'citedBy',
        'topicCategory',
        'codeRepository',
        'programmingLanguage',
        'applicationCategory',
        'input',
        'output',
        'featureList',
        'operatingSystem',
        'softwareVersion',
        'citation',
        'dateModified',
        'license',
        'identifier',
        'url',
      ],
      required_augmented_fields: [],
      required_fields: [
        'date',
        'includedInDataCatalog',
        'funding',
        'description',
        'name',
      ],
    },
    _score: 2,
    applicationCategory: ['Command-line tool'],
    citation: [
      {
        abstract: null,
        author: [
          {
            name: 'Rice P.',
          },
          {
            name: 'Longden L.',
          },
          {
            name: 'Bleasby A.',
          },
        ],
        citation: null,
        datePublished: '2000-06-01',
        description: null,
        doi: '10.1016/S0168-9525(00)02024-2',
        id: null,
        issueNumber: null,
        journalName: 'Trends in Genetics',
        journalNameAbbrev: null,
        name: 'EMBOSS: The European Molecular Biology Open Software Suite',
        pagination: null,
        pmcid: null,
        pmid: null,
        url: null,
        volumeNumber: null,
      },
    ],
    citedBy: [
      {
        doi: '10.1017/CBO9781139151399',
      },
      {
        doi: '10.1017/CBO9781139151405',
      },
    ],
    codeRepository: ['http://emboss.open-bio.org/html/adm/ch01s01.html'],
    contributor: [
      {
        name: 'EMBOSS Contributors',
        url: 'http://emboss.open-bio.org/html/use/pr01s01.html',
      },
      {
        name: 'EMBL-EBI',
      },
      {
        name: 'UK MRC',
      },
      {
        name: 'Wellcome Trust',
      },
      {
        name: 'UK BBSRC',
      },
      {
        name: 'EMBOSS',
      },
    ],
    creativeWorkStatus: 'Mature',
    date: '2018-12-10',
    dateModified: '2018-12-10',
    datePublished: '2015-11-08',
    description:
      'Find restriction sites to remove (mutate) with no translation change.',
    downloadUrl: [
      {
        name: 'http://emboss.open-bio.org/html/adm/ch01s01.html',
      },
    ],
    featureList: [
      {
        inDefinedTermSet: 'EDAM',
        name: 'Restriction site recognition',
        url: 'http://edamontology.org/operation_0431',
      },
    ],
    funding: [
      {
        funder: {
          '@type': 'Organization',
          name: 'UK MRC',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          alternateName: ['WT', 'Wellcome'],
          identifier: 'https://ror.org/029chgv08',
          name: 'Wellcome Trust',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          name: 'UK BBSRC',
        },
      },
    ],
    identifier: 'recoder',
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://bio.tools/recoder',
      name: 'bio.tools',
      url: 'https://bio.tools/',
      versionDate: '2026-03-03',
    },
    input: [
      {
        inDefinedTermSet: 'EDAM',
        name: 'Sequence record',
        url: 'http://edamontology.org/data_0849',
      },
    ],
    isAccessibleForFree: true,
    isRelatedTo: [
      {
        url: 'http://emboss.open-bio.org/html/adm/ch01s01.html',
      },
    ],
    keywords: ['EMBOSS'],
    license: 'GPL-3.0',
    mainEntityOfPage: 'http://emboss.open-bio.org/rel/rel6/apps/recoder.html',
    name: 'recoder',
    operatingSystem: ['Linux', 'Windows', 'Mac'],
    output: [
      {
        inDefinedTermSet: 'EDAM',
        name: 'Nucleic acid features',
        url: 'http://edamontology.org/data_1276',
      },
    ],
    programmingLanguage: ['C'],
    softwareHelp: [
      {
        name: ['Terms of use'],
        url: 'http://emboss.open-bio.org/html/dev/ch01s01.html',
      },
      {
        name: ['Citation instructions'],
        url: 'http://emboss.open-bio.org/html/use/pr02s04.html',
      },
      {
        name: ['General'],
        url: 'http://emboss.open-bio.org/rel/rel6/apps/recoder.html',
      },
    ],
    softwareVersion: ['r6'],
    topicCategory: [
      {
        identifier: 'topic_3511',
        inDefinedTermSet: 'EDAM',
        name: 'Nucleic acid sites, features and motifs',
        url: 'http://edamontology.org/topic_3511',
      },
    ],
    url: 'https://bio.tools/recoder',
    id: 'biotools_recoder',
    aggregateRating: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    author: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    genre: null,
    hasPart: null,
    healthCondition: null,
    infectiousAgent: null,
    interactionStatistics: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    inLanguage: null,
    measurementTechnique: null,
    nctid: null,
    processorRequirements: null,
    publisher: null,
    sameAs: null,
    sdPublisher: null,
    softwareAddOn: null,
    softwareRequirements: null,
    sourceOrganization: null,
    spatialCoverage: null,
    species: null,
    temporalCoverage: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
];

// The page only ever renders `hits[0]`, so each populated test mocks the API to
// return a single resource at index 0. We key the h1 readiness check off each
// record's `name` field (rendered as the page h1 via the header component).
const RESOURCES = HITS.map(hit => ({
  type: hit['@type'] as string,
  name: hit.name as string,
  fixture: { total: 1, hits: [hit] },
}));

// Resource names contain regex metacharacters (`.`, parentheses), so escape
// before building the case-insensitive h1 matcher.
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- Shared checks run in every state ---------------------------------------

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice
  // rules, so this single scan is the backbone of the check. The raw JSON
  // metadata tree is excluded — see JSON_VIEWER_EXCLUDE.
  const results = await analyzeA11y(page, { exclude: JSON_VIEWER_EXCLUDE });
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately so contrast regressions
  // are easy to triage in the HTML report. There is no helper for this — run
  // the single color-contrast rule inline, matching the canonical spec.
  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
    .analyze();
  await attachA11yReport(testInfo, `${state} — contrast`, contrast.violations);

  const blockingContrast = blockingViolations(contrast.violations);
  expect(
    blockingContrast,
    `Color-contrast violations found:\n${formatViolations(blockingContrast)}`,
  ).toEqual([]);

  // Structural sanity — the `main` landmark proves the page chrome rendered.
  // The h1 (the resource name) only exists once data resolves, so it is asserted
  // per state by the caller rather than here.
  await expect(page.getByRole('main')).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route
  // (`includeSearchBar`) and its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name` / `link-name` rules handle aria-label, aria-labelledby, text
  // content and titled icons, so we delegate the authoritative check to axe.
  const names = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({
      runOnly: { type: 'rule', values: ['button-name', 'link-name'] },
    })
    .analyze();
  await attachA11yReport(
    testInfo,
    `${state} — button-link-name`,
    names.violations,
  );

  const blockingNames = blockingViolations(names.violations);
  expect(
    blockingNames,
    `Button/link name violations found:\n${formatViolations(blockingNames)}`,
  ).toEqual([]);

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await attachScreenshot(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Resource — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep the resource request pending so the loading UI stays on screen.
    // `isLoading` is true while the query is in flight, so the page does not
    // redirect to /404 during this state.
    await page.route(API_GLOB, () => new Promise<void>(() => {}));
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The resource header and sections render Chakra `Skeleton`s
    // (`.chakra-skeleton`) while loading — a CSS selector is acceptable here
    // only because skeletons have no accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Populated ---------------------------------------------------------------

test.describe('a11y: Resource — populated', () => {
  // One scan per resource `@type`, since each renders a different section set.
  for (const resource of RESOURCES) {
    test(`passes axe with representative data (${resource.type})`, async ({
      page,
    }, testInfo) => {
      await page.route(API_GLOB, route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(resource.fixture),
        }),
      );
      await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

      // Wait for the resource name h1 — its text only renders once the fixture
      // record resolves — so we know we're scanning the populated DOM, not the
      // loading skeletons or a transient redirect frame. (Chakra `Skeleton`
      // wrappers keep their `.chakra-skeleton` class after loading, so the
      // visible, named h1 is the reliable readiness signal here.)
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: new RegExp(escapeRegExp(resource.name), 'i'),
        }),
      ).toBeVisible();

      await runSharedChecks(page, testInfo, `populated — ${resource.type}`);
    });
  }
});

// --- Interaction states ------------------------------------------------------
//
// Assessed and intentionally none added. The resource detail page's only
// distinct mounted-on-open surface is the Download Metadata format menu
// (src/components/download-metadata), which is the SAME component already scanned
// open in search.spec.ts ("download metadata menu") — re-scanning it here would
// add no new coverage. The remaining interactions are not distinct markup worth a
// separate axe pass: the metadata/heading tooltips are minor hover hints, the
// "read more"/"read less" cell toggles and the search-history Collapse just
// reveal more of the same already-scanned text/markup, and the based-on table
// sort/pagination re-render existing rows. Each resting-state scan above already
// covers the relevant DOM.
