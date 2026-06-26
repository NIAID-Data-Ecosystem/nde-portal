/**
 * Accessibility tests for the Search route (`/search`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. We report every violation in the HTML report but only FAIL the
 * build on `serious` or `critical` impact, so minor/moderate noise doesn't block
 * CI. See e2e/utils/axe.ts and the canonical repository-matcher.spec.ts.
 *
 * State coverage — the full four-state matrix is reachable here. `src/pages/
 * search.tsx` seeds `initialData` from getStaticProps, but every results view is
 * driven by client-side TanStack Query hooks (useSearchResultsData →
 * useSearchResultsQuery, the filter aggregations, the disease carousel), so
 * `page.route` can put the browser-side DOM into loading / empty / populated /
 * error deterministically. We always wait for state-specific UI before scanning
 * so we know we're scanning the mocked DOM, not the SSR seed.
 *
 * Endpoints mocked (all client-side):
 *   - `**\/query*`        the NDE /query API (results + @type facet aggregations)
 *   - `**\/metadata*`     the NDE metadata endpoint backing the filters sidebar
 *   - `**\/api/diseases*` the Strapi diseases lookup behind the carousel
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

const ROUTE = '/search';

// Every external endpoint the route reads. The NDE API endpoints are NOT under
// `/api/`; only the Strapi CMS diseases lookup is.
const API_GLOBS = ['**/query*', '**/metadata*', '**/api/diseases*'];

// Representative raw NDE /query hits for the populated state — a real page of
// HIV-related Dataset records (Vivli, Mendeley, GEO, etc.) pulled from the live
// API. fetchSearchResults runs each through formatAPIResource, so the cards
// render straight from this fixture. The records are intentionally rich: they
// carry the metadata the "Show metadata" accordion expands (healthCondition,
// infectiousAgent, species, measurementTechnique, funding, variableMeasured,
// usageInfo, license) plus the full `_meta.completeness` block the per-card
// completeness badge reads. The mix exercises the card's edge cases: long
// clinical-trial titles, single vs. multiple authors and funders, records with
// and without a license/description, and controlled vs. free access.
const POPULATED_HITS = [
  {
    '@type': 'Dataset',
    _id: 'vivli_603b5575-25d3-4b36-9ddc-ed5db6b27da5',
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.19,
        augmented_required_ratio: 0.11,
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
      lineage: [
        {
          parent_taxon: 2169561,
          taxon: 11632,
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
          parent_taxon: 11646,
          taxon: 3418651,
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
          parent_taxon: 2732397,
          taxon: 2732409,
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
          parent_taxon: 2732514,
          taxon: 2169561,
        },
        {
          parent_taxon: 8287,
          taxon: 1338369,
        },
        {
          parent_taxon: 3418651,
          taxon: 11709,
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
          parent_taxon: 2732409,
          taxon: 2732514,
        },
        {
          parent_taxon: 1338369,
          taxon: 32523,
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
          parent_taxon: 1233735,
          taxon: 11646,
        },
        {
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 11632,
          taxon: 327045,
        },
        {
          parent_taxon: 2559587,
          taxon: 2732397,
        },
        {
          parent_taxon: 10239,
          taxon: 2559587,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 327045,
          taxon: 1233735,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
        {
          parent_taxon: 207598,
          taxon: 9605,
        },
      ],
      recommended_augmented_fields: [
        'species',
        'infectiousAgent',
        'healthCondition',
        'topicCategory',
      ],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'datePublished',
        'doi',
        'healthCondition',
        'variableMeasured',
        'conditionsOfAccess',
        'keywords',
        'sdPublisher',
        'spatialCoverage',
        'temporalCoverage',
        'identifier',
      ],
      required_augmented_fields: ['measurementTechnique'],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'includedInDataCatalog',
        'funding',
        'date',
      ],
    },
    _score: 25.858242,
    author: [
      {
        identifier: null,
        type: null,
        name: 'IAVI',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    conditionsOfAccess: 'Controlled',
    date: '2025-01-30',
    description:
      'This is a phase 1 first-in-human clinical trial to assess the safety, tolerability, and\n immunogenicity of eOD-GT8 60mer Vaccine, Adjuvanted, in up to 48 healthy adult HIV-negative\n volunteers.',
    doi: 'https://doi.org/10.25934/PR00008695',
    funding: [
      {
        funder: {
          '@type': 'Organization',
          alternateName: [
            'The International AIDS Vaccine Initiative',
            'IAVI',
            'International AIDS Vaccine Initiative, Inc.',
            'IAVI Inc',
          ],
          identifier: 'https://ror.org/05ayv2203',
          name: 'International AIDS Vaccine Initiative',
        },
      },
    ],
    healthCondition: [
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDS',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://doi.org/10.25934/PR00008695',
      name: 'Vivli',
      url: 'https://vivli.org/',
      versionDate: '2026-06-13',
    },
    infectiousAgent: [
      {
        alternateName: [
          'HIV-2',
          'LAV-2',
          'HIV2',
          'HIV type 2',
          'human immunodeficiency virus type 2 HIV-2',
          'HIV',
          'Human immunodeficiency virus-2',
          'AIDS virus',
          'Human immunodeficiency virus type 2',
          'human immunodeficiency virus type 2, HIV-2',
        ],
        classification: 'infectiousAgent',
        displayName: 'Human immunodeficiency virus 2',
        fromEXTRACT: true,
        identifier: '11709',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Human immunodeficiency virus 2',
        originalName: 'HIV',
        url: 'https://www.uniprot.org/taxonomy/11709',
      },
    ],
    isAccessibleForFree: true,
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C142568',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Group Sequential Design',
        url: 'http://purl.obolibrary.org/obo/NCIT_C142568',
      },
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C15417',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Randomized Clinical Trial',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15417',
      },
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C15228',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Double Blind Study',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15228',
      },
    ],
    name: 'Dataset from A Phase 1, Randomized, Double-blind, Placebo-controlled Dosage Escalation Trial to Evaluate the Safety and Immunogenicity of eOD-GT8 60mer Vaccine, Adjuvanted in HIV-uninfected, Healthy Adult Volunteers',
    sample: {
      '@type': 'Sample',
      developmentalStage: {
        '@type': 'QuantitativeValue',
        maxValue: 50,
        minValue: 18,
        name: '18 Years to 50 Years',
        unitText: 'Years',
      },
      sampleQuantity: {
        '@type': 'QuantitativeValue',
        unitCode: 'http://purl.obolibrary.org/obo/NCIT_C207572',
        unitText: 'enrolled subjects',
        value: 46,
      },
      sampleType: {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'NCIT',
        name: 'Study Subject',
        termCode: 'NCIT_C41189',
        url: 'http://purl.obolibrary.org/obo/NCIT_C41189',
      },
      sex: 'All',
    },
    sdPublisher: [
      {
        identifier: 'NCT03547245',
        name: 'ClinicalTrials.gov',
      },
    ],
    species: [
      {
        alternateName: [
          'Humo sapiens',
          'Home sapiens',
          'Homo sapines',
          'Homo sapian',
          'Homo sapiens Linnaeus, 1758',
          'Homo sampiens',
          'Homo sapians',
          'Homo sapien',
          'Homo sapients',
          'Homo spaiens',
          'Homo spiens',
          'Human',
          'Homo sapeins',
          'Homo sapience',
          'Homo sapiense',
          'human',
        ],
        classification: 'host',
        commonName: 'Human',
        displayName: 'Human | Homo sapiens',
        fromEXTRACT: true,
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Homo sapiens',
        originalName: 'Human',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    topicCategory: [
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_3379',
        inDefinedTermSet: 'EDAM',
        name: 'Preclinical and clinical studies',
        url: 'http://edamontology.org/topic_3379',
      },
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_3966',
        inDefinedTermSet: 'EDAM',
        name: 'Vaccinology',
        url: 'http://edamontology.org/topic_3966',
      },
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_0804',
        inDefinedTermSet: 'EDAM',
        name: 'Immunology',
        url: 'http://edamontology.org/topic_0804',
      },
    ],
    url: 'https://doi.org/10.25934/PR00008695',
    variableMeasured: [
      {
        name: [
          'Efficacy',
          'Efficacy',
          'Efficacy',
          'Immune response',
          'Immune response',
        ],
      },
    ],
    id: 'vivli_603b5575-25d3-4b36-9ddc-ed5db6b27da5',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    downloadUrl: null,
    genre: null,
    hasPart: null,
    input: null,
    interactionStatistics: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    usageInfo: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'vivli_66d348a0-e4ef-4618-b5a7-d92b9b79b3e0',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.1,
        augmented_required_ratio: 0.11,
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
      lineage: [
        {
          parent_taxon: 2169561,
          taxon: 11632,
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
          parent_taxon: 11646,
          taxon: 3418651,
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
          parent_taxon: 2732397,
          taxon: 2732409,
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
          parent_taxon: 2732514,
          taxon: 2169561,
        },
        {
          parent_taxon: 8287,
          taxon: 1338369,
        },
        {
          parent_taxon: 3418651,
          taxon: 11709,
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
          parent_taxon: 2732409,
          taxon: 2732514,
        },
        {
          parent_taxon: 1338369,
          taxon: 32523,
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
          parent_taxon: 1233735,
          taxon: 11646,
        },
        {
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 11632,
          taxon: 327045,
        },
        {
          parent_taxon: 2559587,
          taxon: 2732397,
        },
        {
          parent_taxon: 10239,
          taxon: 2559587,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 327045,
          taxon: 1233735,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
        {
          parent_taxon: 207598,
          taxon: 9605,
        },
      ],
      recommended_augmented_fields: ['species', 'infectiousAgent'],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'datePublished',
        'doi',
        'healthCondition',
        'variableMeasured',
        'conditionsOfAccess',
        'keywords',
        'sdPublisher',
        'spatialCoverage',
        'temporalCoverage',
        'identifier',
      ],
      required_augmented_fields: ['measurementTechnique'],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'includedInDataCatalog',
        'funding',
        'date',
      ],
    },
    _score: 25.2593,
    author: [
      {
        identifier: null,
        type: null,
        name: 'IAVI',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    conditionsOfAccess: 'Controlled',
    date: '2026-01-15',
    description:
      'This a phase 1 first-in-human clinical trial to evaluate the safety, tolerability, and immunogenicity of BG505 SOSIP.664 gp140 Vaccine, Adjuvanted, in up to 60 healthy adult HIV-uninfected volunteers.',
    doi: 'https://doi.org/10.25934/PR00011811',
    funding: [
      {
        funder: {
          '@type': 'Organization',
          alternateName: [
            'The International AIDS Vaccine Initiative',
            'IAVI',
            'International AIDS Vaccine Initiative, Inc.',
            'IAVI Inc',
          ],
          identifier: 'https://ror.org/05ayv2203',
          name: 'International AIDS Vaccine Initiative',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          alternateName: ['GlaxoSmithKline plc.', 'GSK', 'GSK plc.'],
          identifier: 'https://ror.org/01xsqw823',
          name: 'GlaxoSmithKline',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          name: 'Fred Hutchinson Cancer Research Center - Seattle HIV Vaccine Trials Unit',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          name: 'Kenya AIDS Vaccine Initiative - Institute of Clinical Research (KAVI-ICR)',
        },
      },
      {
        funder: {
          '@type': 'Organization',
          alternateName: [
            'Mass General Hospital',
            'MGH',
            'Mass General',
            'Centro para Pacientes Internacionales de Mass General',
            '美国麻省总医院',
            'مستشفى ماساتشوستس العام',
          ],
          identifier: 'https://ror.org/002pd6e78',
          name: 'Massachusetts General Hospital',
          parentOrganization: 'Mass General Brigham',
        },
      },
    ],
    healthCondition: [
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://doi.org/10.25934/PR00011811',
      name: 'Vivli',
      url: 'https://vivli.org/',
      versionDate: '2026-06-13',
    },
    infectiousAgent: [
      {
        alternateName: [
          'HIV-2',
          'LAV-2',
          'HIV2',
          'HIV type 2',
          'human immunodeficiency virus type 2 HIV-2',
          'HIV',
          'Human immunodeficiency virus-2',
          'AIDS virus',
          'Human immunodeficiency virus type 2',
          'human immunodeficiency virus type 2, HIV-2',
        ],
        classification: 'infectiousAgent',
        displayName: 'Human immunodeficiency virus 2',
        fromEXTRACT: true,
        identifier: '11709',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Human immunodeficiency virus 2',
        originalName: 'HIV',
        url: 'https://www.uniprot.org/taxonomy/11709',
      },
    ],
    isAccessibleForFree: true,
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C82639',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Parallel Study',
        url: 'http://purl.obolibrary.org/obo/NCIT_C82639',
      },
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C15417',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Randomized Clinical Trial',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15417',
      },
      {
        '@type': 'DefinedTerm',
        fromNCT: true,
        identifier: 'C15228',
        inDefinedTermSet: 'NCIT',
        isCurated: false,
        name: 'Double Blind Study',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15228',
      },
    ],
    name: 'Dataset from A Randomized, Double-blinded, Placebo-controlled, Dose-escalation Phase 1 Clinical Trial to Evaluate the Safety and Immunogenicity of Recombinant HIV Envelope Protein BG505 SOSIP.664 gp140 Vaccine, Adjuvanted, in Healthy, HIV-1 Uninfected Adults',
    sample: {
      '@type': 'Sample',
      developmentalStage: {
        '@type': 'QuantitativeValue',
        maxValue: 50,
        minValue: 18,
        name: '18 Years to 50 Years',
        unitText: 'Years',
      },
      sampleQuantity: {
        '@type': 'QuantitativeValue',
        unitCode: 'http://purl.obolibrary.org/obo/NCIT_C207572',
        unitText: 'enrolled subjects',
        value: 61,
      },
      sampleType: {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'NCIT',
        name: 'Study Subject',
        termCode: 'NCIT_C41189',
        url: 'http://purl.obolibrary.org/obo/NCIT_C41189',
      },
      sex: 'ALL',
    },
    sdPublisher: [
      {
        identifier: 'NCT03699241',
        name: 'ClinicalTrials.gov',
      },
    ],
    species: [
      {
        alternateName: [
          'Humo sapiens',
          'Home sapiens',
          'Homo sapines',
          'Homo sapian',
          'Homo sapiens Linnaeus, 1758',
          'Homo sampiens',
          'Homo sapians',
          'Homo sapien',
          'Homo sapients',
          'Homo spaiens',
          'Homo spiens',
          'Human',
          'Homo sapeins',
          'Homo sapience',
          'Homo sapiense',
          'human',
        ],
        classification: 'host',
        commonName: 'Human',
        displayName: 'Human | Homo sapiens',
        fromEXTRACT: true,
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Homo sapiens',
        originalName: 'Human',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://doi.org/10.25934/PR00011811',
    variableMeasured: [
      {
        name: [
          'Adverse Event',
          'Adverse Event',
          'Serious Adverse Event',
          'Diseases and disorders ',
          'BG505 SOSIP.664 gp140',
          'BG505 SOSIP.664 gp140',
          'BG505 SOSIP.664 gp140',
          'BG505 SOSIP.664 gp140',
          'BG505 SOSIP.664 gp140',
        ],
      },
    ],
    id: 'vivli_66d348a0-e4ef-4618-b5a7-d92b9b79b3e0',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    downloadUrl: null,
    genre: null,
    hasPart: null,
    input: null,
    interactionStatistics: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'mendeley_f7wfdbrfys',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.1,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 7,
        recommended_score_ratio: 0.33,
        required_max_score: 9,
        required_ratio: 0.67,
        required_score: 6,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 13,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['species', 'healthCondition'],
      recommended_fields: [
        'dateModified',
        'datePublished',
        'doi',
        'keywords',
        'license',
        'sdPublisher',
        'identifier',
      ],
      required_augmented_fields: [],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'includedInDataCatalog',
        'date',
      ],
    },
    _score: 25.074776,
    author: [
      {
        identifier: null,
        type: null,
        name: 'Urban Nchimunya Haankuku',
        affiliation: null,
        familyName: 'Haankuku',
        givenName: 'Urban Nchimunya',
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    date: '2019-07-15',
    description:
      'The human immune virus (HIV) is a viral infection that destroys the human immune system resulting in acquired immunodeficiency syndrome (AIDS). If untreated, it can reduce the cluster of CD4 positive T-cells and increases the HIV viral load, thus causing AIDS. The Zambia HIV prevalence rate is among the highest in the sub-Saharan region. According to WHO, HIV/AIDS is a major cause of death in Zambia, with about a million deaths attributed to HIV/AIDS-related causes. With no HIV vaccine readily available and no permanent cure for HIV/AIDS, the antiretroviral (ARV) drug that slows the spread of the virus remains the only option. The ARV shuts down viral reproduction as well as reduces the immune suppression caused by HIV. Taking a combination of three ARV drugs from different classes suppresses the reproduction of the virus. The administration of ARV has challenges of Transmitted Drug Resistance Mutation strains (TDRMs) in the treatment of HIV naïve patients. In this article, we formulate a technique for determining an optimal ARV combination using Bayesian statistical methods. The proposed technique assist the medical personnel responsible in deciding the optimal ARV combination per patient in the presence of TDRMs test. We developed a transition probability matrix chart for each combination. Using the data from Zambia, we demonstrate the computation process and provide an interpretation of the obtained results. The findings from the analysis indicate that the probability of patients remaining on first baseline combinations namely, 1, 2, 3, 4, 5 and 6 are: 0.96, 0.99, 0.97, 0.91, 0.96, and 0.96 respectively. The probabilities obtained can be \nused to choose an optimal ARV combination in the presence of Transmitted Drug Resistance Mutation Strains because you can isolate the particular drugs which the patient is resistance.',
    doi: '10.17632/f7wfdbrfys.1',
    healthCondition: [
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'acquired immunodeficiency syndrome',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
      {
        alternateName: [
          'arthropod-borne viral infection',
          'arbovirus infection',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0020731',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'arbovirus infection',
        originalName: 'viral infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0020731',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://data.mendeley.com/datasets/f7wfdbrfys',
      name: 'Mendeley',
      url: 'https://data.mendeley.com/',
      versionDate: '2026-06-14T02:36:54.078175',
    },
    license: 'http://creativecommons.org/licenses/by/4.0',
    name: 'HIV data for Livingstone district health facilities (2016)',
    sdPublisher: [
      {
        name: 'Mendeley Data',
      },
    ],
    species: [
      {
        alternateName: [
          'Humo sapiens',
          'Home sapiens',
          'Homo sapines',
          'Homo sapian',
          'Homo sapiens Linnaeus, 1758',
          'Homo sampiens',
          'Homo sapians',
          'Homo sapien',
          'Homo sapients',
          'Homo spaiens',
          'Homo spiens',
          'Human',
          'Homo sapeins',
          'Homo sapience',
          'Homo sapiense',
          'human',
        ],
        classification: 'host',
        commonName: 'Human',
        displayName: 'Human | Homo sapiens',
        fromEXTRACT: true,
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Homo sapiens',
        originalName: 'HUMAN',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://data.mendeley.com/datasets/f7wfdbrfys',
    id: 'mendeley_f7wfdbrfys',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    mainEntityOfPage: null,
    measurementTechnique: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'ncbi_sra_srp488078',
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.05,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 5,
        recommended_score_ratio: 0.24,
        required_max_score: 9,
        required_ratio: 0.78,
        required_score: 7,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 12,
      },
      lineage: [
        {
          parent_taxon: 2169561,
          taxon: 11632,
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
          parent_taxon: 2732397,
          taxon: 2732409,
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
          parent_taxon: 2732514,
          taxon: 2169561,
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
          parent_taxon: 2732409,
          taxon: 2732514,
        },
        {
          parent_taxon: 11646,
          taxon: 3418650,
        },
        {
          parent_taxon: 1338369,
          taxon: 32523,
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
          parent_taxon: 1233735,
          taxon: 11646,
        },
        {
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 11632,
          taxon: 327045,
        },
        {
          parent_taxon: 2559587,
          taxon: 2732397,
        },
        {
          parent_taxon: 10239,
          taxon: 2559587,
        },
        {
          parent_taxon: 3418650,
          taxon: 11676,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 327045,
          taxon: 1233735,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
        {
          parent_taxon: 207598,
          taxon: 9605,
        },
      ],
      recommended_augmented_fields: ['healthCondition'],
      recommended_fields: [
        'dateModified',
        'datePublished',
        'infectiousAgent',
        'species',
        'isBasedOn',
      ],
      required_augmented_fields: [],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'measurementTechnique',
        'includedInDataCatalog',
        'date',
      ],
    },
    _score: 24.817886,
    author: [
      {
        identifier: null,
        type: null,
        name: 'Kumamoto University',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: 'dr.omnia.reda@gmail.com',
      },
    ],
    date: '2024-02-08',
    description:
      'A novel in vitro latency model (HIV-Tocky) suggests the multi-layered nature of HIV-1 post-integration latency at which latent proviruses with a history of expression showed features of stable latency contrary to these lacking a history of expression.',
    healthCondition: [
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDS',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://www.ncbi.nlm.nih.gov/sra/SRP488078',
      name: 'NCBI SRA',
      url: 'https://www.ncbi.nlm.nih.gov/sra/',
      versionDate: '2026-04-02',
    },
    infectiousAgent: [
      {
        alternateName: [
          'AIDS virus',
          'human immunodeficiency virus-1 HIV-1',
          'HIV-1',
          'HIV1',
          'human immunodeficiency virus type 1 ,HIV-1',
          'human immunodeficiency virus HIV-1',
          'human immunodeficiency virus type 1, HIV-1',
          'human immunodeficiency virus type-1 HIV-1',
          'Human immundeficiency virus type 1',
          'HIV',
          'human immunodeficiency virus type I HIV-1',
          'human immunodeficiency virus type 1 HIV 1',
          'Human immunodeficiency virus type 1',
          'Human immunodeficiencey virus type 1',
          'LAV-1',
          'human immunodeficiency virus type 1 HIV1',
          'human immunodeficiency virus 1 HIV-1',
          'human immunodeficiency virus type 1 HIV-1',
          'Human immunodeficiency virus type I',
        ],
        classification: 'infectiousAgent',
        curatedBy: {
          dateModified: '2024-04-10',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human immunodeficiency virus 1',
        identifier: '11676',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Human immunodeficiency virus 1',
        originalName: 'human immunodeficiency virus 1',
        url: 'https://www.uniprot.org/taxonomy/11676',
      },
    ],
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: 'C204828',
        inDefinedTermSet: 'NCIT',
        isCurated: true,
        name: 'Targeted Capture Sequencing',
        originalName: 'Targeted-Capture',
        url: 'http://purl.obolibrary.org/obo/NCIT_C204828',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000659',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'RNA-seq assay',
        originalName: 'RNA-Seq',
        url: 'http://purl.obolibrary.org/obo/MMO_0000659',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002767',
        inDefinedTermSet: 'OBI',
        isCurated: true,
        name: 'amplicon sequencing assay',
        originalName: 'AMPLICON',
        url: 'http://purl.obolibrary.org/obo/OBI_0002767',
      },
    ],
    name: 'HIV-Tocky system to visualize proviral expression dynamics',
    sample: {
      '@type': 'SampleCollection',
      aggregateElement: {
        associatedGenotype: ['JURKAT/HIV_TIMER', 'JURKAT/HIV_TNGFR'],
        cellType: [
          {
            name: 'Jurkat/HIV_Timer',
          },
        ],
        sampleType: [
          {
            name: 'Human T-lymphocyte',
          },
          {
            name: 'Jurkat Cell line',
          },
        ],
      },
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'samn39829127',
          additionalIdentifier: 'SRS20382210',
          identifier: 'SAMN39829127',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829127',
        },
        {
          '@type': 'Sample',
          _id: 'samn39836284',
          additionalIdentifier: 'SRS20393460',
          identifier: 'SAMN39836284',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39836284',
        },
        {
          '@type': 'Sample',
          _id: 'samn39836283',
          additionalIdentifier: 'SRS20393459',
          identifier: 'SAMN39836283',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39836283',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829134',
          additionalIdentifier: 'SRS20382216',
          identifier: 'SAMN39829134',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829134',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829133',
          additionalIdentifier: 'SRS20382215',
          identifier: 'SAMN39829133',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829133',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829132',
          additionalIdentifier: 'SRS20382214',
          identifier: 'SAMN39829132',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829132',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829131',
          additionalIdentifier: 'SRS20382213',
          identifier: 'SAMN39829131',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829131',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829130',
          additionalIdentifier: 'SRS20382212',
          identifier: 'SAMN39829130',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829130',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829128',
          additionalIdentifier: 'SRS20382211',
          identifier: 'SAMN39829128',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829128',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829125',
          additionalIdentifier: 'SRS20382209',
          identifier: 'SAMN39829125',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829125',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829126',
          additionalIdentifier: 'SRS20382208',
          identifier: 'SAMN39829126',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829126',
        },
        {
          '@type': 'Sample',
          _id: 'samn39829129',
          additionalIdentifier: 'SRS20382207',
          identifier: 'SAMN39829129',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39829129',
        },
        {
          '@type': 'Sample',
          _id: 'samn39825134',
          additionalIdentifier: 'SRS20380366',
          identifier: 'SAMN39825134',
          name: 'IS_R+',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39825134',
        },
        {
          '@type': 'Sample',
          _id: 'samn39825133',
          additionalIdentifier: 'SRS20380365',
          identifier: 'SAMN39825133',
          name: 'IS_B+R+',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39825133',
        },
        {
          '@type': 'Sample',
          _id: 'samn39825132',
          additionalIdentifier: 'SRS20380364',
          identifier: 'SAMN39825132',
          name: 'IS_B+',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39825132',
        },
        {
          '@type': 'Sample',
          _id: 'samn39825131',
          additionalIdentifier: 'SRS20380363',
          identifier: 'SAMN39825131',
          name: 'IS_TN',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN39825131',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 16,
      },
    },
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/sra/SRP488078',
    id: 'ncbi_sra_srp488078',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    sdPublisher: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'gse293960',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.05,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 6,
        recommended_score_ratio: 0.29,
        required_max_score: 9,
        required_ratio: 0.89,
        required_score: 8,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 14,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['healthCondition'],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'datePublished',
        'species',
        'sdPublisher',
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
        'date',
      ],
    },
    _score: 24.722672,
    author: [
      {
        identifier: null,
        type: 'Person',
        name: 'Zihui Zhao',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Suyue Huang',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    date: '2025-04-12',
    description:
      'To investigate the early immune profiles of patients, particularly those with HIV and tuberculosis co-infection, we collected blood samples from three individuals in the HIV/MTB co-infection group, three HIV/AIDS patients, and three healthy controls. Peripheral blood mononuclear cells (PBMCs) were isolated, and the MobiNova®-100 Single Cell System (MobiDrop (Zhejiang) Co., Ltd.) was employed to prepare single-cell sequencing libraries. Subsequently, a single-cell RNA expression matrix was generated using the Illumina NovaSeq 6000 System, yielding a total of 113,816 cells for further analysis. The inclusion criteria for patients were as follows: (1) newly diagnosed with HIV infection/AIDS; (2) newly diagnosed with tuberculosis, receiving initial treatment. The exclusion criteria were: (1) prior use of antiretroviral therapy (ART) or anti-tuberculosis drugs; (2) detection of drug resistance in HIV susceptibility tests; (3) severe liver and/or kidney dysfunction; and (4) presence of underlying conditions such as pancreatitis or malignant tumors. Based on these criteria, a total of 6 patients were enrolled in the study, including 3 HIV/AIDS patients with M. tuberculosis co-infection (none of whom had received either anti-tuberculosis or antiviral treatment) and 3 early-diagnosed HIV/AIDS patients (none of whom had received antiretroviral treatment). This study also included three healthy control individuals.  *************************************************************** Raw files for human/patient samples were not submitted to GEO due to concerns about submitting personally identifiable sequence data for open access. ***************************************************************',
    healthCondition: [
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
      {
        alternateName: [
          'mixed tumor, malignant',
          'malignant mixed tumor',
          'malignant mixed cancer',
          'malignant mixed tumour',
          'mixed tumor, malignant (morphologic abnormality)',
          'tumor, mixed, malignant',
          'mixed tumor, malignant, NOS (morphologic abnormality)',
          'malignant mixed neoplasm',
          'mixed neoplasm, malignant',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005853',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'malignant mixed neoplasm',
        originalName: 'Malignant tumors',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005853',
      },
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDs',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
      {
        alternateName: ['tuberculosis disease'],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0018076',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'tuberculosis',
        originalName: 'Tuberculosis',
        url: 'http://purl.obolibrary.org/obo/MONDO_0018076',
      },
      {
        alternateName: ['inflammation of pancreas', 'pancreas inflammation'],
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0004982',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'pancreatitis',
        originalName: 'pancreatitis',
        sameas: [
          {
            identifier: 'DOID:4989',
            url: 'http://purl.obolibrary.org/obo/DOID_4989',
          },
          {
            identifier: 'EFO:0000278',
            name: 'pancreatitis',
            url: 'http://purl.obolibrary.org/obo/EFO_0000278',
          },
          {
            identifier: 'MESH:D010195',
            name: 'Pancreatitis',
            url: 'http://purl.obolibrary.org/obo/MESH_D010195',
          },
          {
            identifier: 'NCIT:C3306',
            url: 'http://purl.obolibrary.org/obo/NCIT_C3306',
          },
          {
            identifier: 'SCTID:75694006',
            name: ['Pancreatitis (disorder)', 'Pancreatitis'],
            url: 'http://purl.obolibrary.org/obo/SCTID_75694006',
          },
          {
            identifier: 'UMLS:C0030305',
            url: 'http://purl.obolibrary.org/obo/UMLS_C0030305',
          },
        ],
        url: 'http://purl.obolibrary.org/obo/MONDO_0004982',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt:
        'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE293960',
      name: 'NCBI GEO',
      url: 'https://www.ncbi.nlm.nih.gov/geo/',
      versionDate: '2026-05-15',
    },
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000644',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'high-throughput expression assay',
        originalName: 'Expression profiling by high throughput sequencing',
        url: 'https://ontobee.org/ontology/MMO?iri=http://purl.obolibrary.org/obo/MMO_0000644',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002697',
        inDefinedTermSet: 'EFO',
        isCurated: true,
        name: 'assay by high throughput sequencer',
        originalName: 'Expression profiling by high throughput sequencing',
        url: 'http://www.ebi.ac.uk/efo/EFO_0002697',
      },
    ],
    name: 'Single-Cell Transcriptomics Matrix of all PBMC samples used in “Single-Cell Transcriptomics Reveals Immune Dysregulation in HIV-MTB Co-Infection: CD4+ T Cells Exhaustion and CD8+ T Cells Hyperactivation”',
    sample: {
      '@type': 'SampleCollection',
      aggregateElement: {
        anatomicalStructure: {
          '@type': 'DefinedTerm',
          name: 'blood',
        },
        sampleType: [
          {
            '@type': 'DefinedTerm',
            name: 'SRA',
          },
          {
            '@type': 'DefinedTerm',
            name: 'transcriptomic single cell',
          },
        ],
        url: [
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895273',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895275',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895277',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895280',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895282',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895285',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895287',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895289',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895292',
        ],
      },
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'gsm8895273',
          identifier: 'GSM8895273',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895273',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895275',
          identifier: 'GSM8895275',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895275',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895277',
          identifier: 'GSM8895277',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895277',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895280',
          identifier: 'GSM8895280',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895280',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895282',
          identifier: 'GSM8895282',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895282',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895285',
          identifier: 'GSM8895285',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895285',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895287',
          identifier: 'GSM8895287',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895287',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895289',
          identifier: 'GSM8895289',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895289',
        },
        {
          '@type': 'Sample',
          _id: 'gsm8895292',
          identifier: 'GSM8895292',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM8895292',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 9,
      },
    },
    sdPublisher: [
      {
        '@type': 'Organization',
        name: 'Shanghai Institute of Infectious Disease and Biosecurity, Fudan University',
      },
    ],
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE293960',
    id: 'gse293960',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'ncbi_sra_srp444331',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.05,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 4,
        recommended_score_ratio: 0.19,
        required_max_score: 9,
        required_ratio: 0.78,
        required_score: 7,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 11,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['healthCondition'],
      recommended_fields: [
        'dateModified',
        'datePublished',
        'species',
        'isBasedOn',
      ],
      required_augmented_fields: [],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'measurementTechnique',
        'includedInDataCatalog',
        'date',
      ],
    },
    _score: 24.676472,
    author: [
      {
        identifier: null,
        type: null,
        name: 'Zhongnan Hospital of Wuhan University',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: 'luzhonshan@whu.edu.cn',
      },
    ],
    date: '2024-06-28',
    description:
      'Background: Many studies have shown that long noncoding RNAs (lncRNAs) derived from the host and human immunodeficiency virus (HIV) itself play important roles in virus-host interactions and viral pathogenesis. It is unclear whether lncRNAs were involved in ART therapy of HIV/AIDS patients. Methods: Six HIV/acquired immunodeficiency syndrome (AIDS) subjects pre-HAART and post-HAART with effective control of plasma viremia (<20 HIV RNA copies/ml) and 6 healthy subjects were recruited in this study to perform RNA sequencing. The expression profiles of lncRNAs and mRNAs were obtained, to exploration of the potential roles of lncRNAs, trans- and cis-acting analysis was used. Then, Gene Ontology (GO) and Kyoto Encyclopedia of Genes and Genomes (KEGG) pathway enrichment analyses were performed to sort out functional categories of genes. Results: We identified a total of 974 lncRNAs whose expression levels were restored to normal after ART therapy. The results of the cis-acting analysis showed that only six lncRNAs have cis-regulated target genes, among which the target gene RP11-290F5.1, interferon regulatory factors 2 (IRF2), could promote HIV replication. We also identified lncRNA CTB-119C2.1, which regulates most mRNAs with differential expression between pre- and post-HAART, and the differences were significant. We selected lncRNA CTB-119C2.1 for qRTâPCR verification, and the results were consistent with those of RNA-seq. RAB3A and GADD45A, two of the lncRNA CTB-119C2.1-associated genes, have been shown to be associated with HIV infection. KEGG analysis of lncRNA CTB-119C2.1-associated genes revealed that most of the genes are involved in the p53 signaling pathway or pathways related to cell circulation and DNA replication. Conclusion: In this study, we used RNA-seq to systematically compare the expression profiles of lncRNAs in HIV subjects between untreated and treated time points. We successfully identified some lncRNAs with differential expression during certain periods (no HIV infection, HIV infection before treatment, and after treatment). Their expression is associated with HIV viral loads, and some of their regulating genes were found to be involved in HIV pathogenesis through bioinformatic analysis. These findings could help to reveal the underlying molecular mechanism of the progression of HIV infection. Overall design: In order to reveal whether lncrna is involved in ART therapy for HIV/AIDS patients,six HIV/acquired immunodeficiency syndrome (AIDS) subjects pre-HAART and post-HAART with effective control of plasma viremia (<20 HIV RNA copies/ml) and 6 healthy subjects were recruited in this study to perform RNA sequencing. The expression profiles of lncRNAs and mRNAs were obtained, to exploration of the potential roles of lncRNAs, trans- and cis-acting analysis was used. Then, Gene Ontology (GO) and Kyoto Encyclopedia of Genes and Genomes (KEGG) pathway enrichment analyses were performed to sort out functional categories of genes.',
    healthCondition: [
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'acquired immunodeficiency syndrome',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://www.ncbi.nlm.nih.gov/sra/SRP444331',
      name: 'NCBI SRA',
      url: 'https://www.ncbi.nlm.nih.gov/sra/',
      versionDate: '2026-04-02',
    },
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000659',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'RNA-seq assay',
        originalName: 'RNA-Seq',
        url: 'http://purl.obolibrary.org/obo/MMO_0000659',
      },
    ],
    name: 'Transcriptomic study reveals changes of lncRNAs in PBMCs from HIV-1 patients before and after ART',
    sample: {
      '@type': 'SampleCollection',
      aggregateElement: {
        sampleType: [
          {
            name: 'Peripheral blood monocytes',
          },
        ],
      },
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'samn35767764',
          additionalIdentifier: 'SRS17999087',
          identifier: 'SAMN35767764',
          name: 'H5',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767764',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767767',
          additionalIdentifier: 'SRS17999086',
          identifier: 'SAMN35767767',
          name: 'H2',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767767',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767766',
          additionalIdentifier: 'SRS17999085',
          identifier: 'SAMN35767766',
          name: 'H3',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767766',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767765',
          additionalIdentifier: 'SRS17999089',
          identifier: 'SAMN35767765',
          name: 'H4',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767765',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767763',
          additionalIdentifier: 'SRS17999088',
          identifier: 'SAMN35767763',
          name: 'H6',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767763',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767768',
          additionalIdentifier: 'SRS17999084',
          identifier: 'SAMN35767768',
          name: 'H1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767768',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767769',
          additionalIdentifier: 'SRS17999081',
          identifier: 'SAMN35767769',
          name: 'A6',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767769',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767770',
          additionalIdentifier: 'SRS17999078',
          identifier: 'SAMN35767770',
          name: 'A5',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767770',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767771',
          additionalIdentifier: 'SRS17999079',
          identifier: 'SAMN35767771',
          name: 'A4',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767771',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767772',
          additionalIdentifier: 'SRS17999083',
          identifier: 'SAMN35767772',
          name: 'A3',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767772',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767773',
          additionalIdentifier: 'SRS17999082',
          identifier: 'SAMN35767773',
          name: 'A2',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767773',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767774',
          additionalIdentifier: 'SRS17999077',
          identifier: 'SAMN35767774',
          name: 'A1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767774',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767775',
          additionalIdentifier: 'SRS17999080',
          identifier: 'SAMN35767775',
          name: 'B6',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767775',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767776',
          additionalIdentifier: 'SRS17999075',
          identifier: 'SAMN35767776',
          name: 'B5',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767776',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767777',
          additionalIdentifier: 'SRS17999073',
          identifier: 'SAMN35767777',
          name: 'B4',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767777',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767778',
          additionalIdentifier: 'SRS17999072',
          identifier: 'SAMN35767778',
          name: 'B3',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767778',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767779',
          additionalIdentifier: 'SRS17999076',
          identifier: 'SAMN35767779',
          name: 'B2',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767779',
        },
        {
          '@type': 'Sample',
          _id: 'samn35767780',
          additionalIdentifier: 'SRS17999074',
          identifier: 'SAMN35767780',
          name: 'B1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN35767780',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 18,
      },
    },
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/sra/SRP444331',
    id: 'ncbi_sra_srp444331',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    sdPublisher: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'ncbi_sra_erp146338',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.05,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 4,
        recommended_score_ratio: 0.19,
        required_max_score: 9,
        required_ratio: 0.78,
        required_score: 7,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 11,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['healthCondition'],
      recommended_fields: [
        'dateModified',
        'datePublished',
        'species',
        'isBasedOn',
      ],
      required_augmented_fields: [],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'measurementTechnique',
        'includedInDataCatalog',
        'date',
      ],
    },
    _score: 24.100685,
    author: [
      {
        identifier: null,
        type: null,
        name: 'UNIVERSITY OF CAPE TOWN',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    date: '2023-09-16',
    description:
      'This study investigated the presence of gene mutations implicated in innate immune control within a non-progressor paediatric cohort of HIV positive children, and their associated family members. The ICAM2 and TLR4 genes were reported to be potentially responsible for the innate immune control of Simian Immune Virus (SIV) infected Sooty Mangebey (C.atys). The SIV infected C.atys  phenotype is similar to the human HIV infected non-progressor phenotype and it was thought to have a similar genetic mechanism for innate immune control of HIV infection. Therefore, whole human genome sequencing was performed on the HIV infected non-progressor paediatric cohort and their associated family members, who either progressed to AIDS or were HIV positive adult non-progressors. The host genomes of n=31 families were sequenced at 30X and assessed for the presence of known mutations shown in the innate immune system genes. Whole Genomic sequencing analysis showed no significant variants found within the ICAM2 and TLR4 genes, that could be associated with the HIV non-progressor genotype. An expression analysis was performed to determine the mRNA expression level of these genes within the non-progressor vs progressor phenotypic profile of this paediatric cohort and family members. There was no significant pattern of differential expression between the HIV progressor and HIV non-progressor phenotype. Therefore, the inference that genomic variation within ICAM2 and TLR4 host genes of SIV infected Sooty Manageby is not responsible for  HIV infected humans with innate immune control.',
    healthCondition: [
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDS',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://www.ncbi.nlm.nih.gov/sra/ERP146338',
      name: 'NCBI SRA',
      url: 'https://www.ncbi.nlm.nih.gov/sra/',
      versionDate: '2026-04-02',
    },
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002117',
        inDefinedTermSet: 'OBI',
        isCurated: true,
        name: 'whole genome sequencing assay',
        originalName: 'WGS',
        url: 'http://purl.obolibrary.org/obo/OBI_0002117',
      },
    ],
    name: 'Genes associated with innate immune control in a South African Peadiatric HIV',
    sample: {
      '@type': 'SampleCollection',
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'samea113903780',
          additionalIdentifier: 'ERS15897949',
          identifier: 'SAMEA113903780',
          name: '207-80-0417-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903780',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903781',
          additionalIdentifier: 'ERS15897950',
          identifier: 'SAMEA113903781',
          name: '207-80-0417-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903781',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903778',
          additionalIdentifier: 'ERS15897947',
          identifier: 'SAMEA113903778',
          name: '207-80-0414-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903778',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903779',
          additionalIdentifier: 'ERS15897948',
          identifier: 'SAMEA113903779',
          name: '207-80-0414-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903779',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903794',
          additionalIdentifier: 'ERS15897963',
          identifier: 'SAMEA113903794',
          name: '207-80-0408-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903794',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903795',
          additionalIdentifier: 'ERS15897964',
          identifier: 'SAMEA113903795',
          name: '207-80-0408-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903795',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903776',
          additionalIdentifier: 'ERS15897945',
          identifier: 'SAMEA113903776',
          name: '207-80-0071-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903776',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903777',
          additionalIdentifier: 'ERS15897946',
          identifier: 'SAMEA113903777',
          name: '207-80-0071-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903777',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903774',
          additionalIdentifier: 'ERS15897943',
          identifier: 'SAMEA113903774',
          name: '207-80-0029-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903774',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903775',
          additionalIdentifier: 'ERS15897944',
          identifier: 'SAMEA113903775',
          name: '207-80-0029-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903775',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903792',
          additionalIdentifier: 'ERS15897961',
          identifier: 'SAMEA113903792',
          name: '207-70-8265-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903792',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903793',
          additionalIdentifier: 'ERS15897962',
          identifier: 'SAMEA113903793',
          name: '207-70-8265-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903793',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903790',
          additionalIdentifier: 'ERS15897959',
          identifier: 'SAMEA113903790',
          name: '207-70-0569-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903790',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903791',
          additionalIdentifier: 'ERS15897960',
          identifier: 'SAMEA113903791',
          name: '207-70-0569-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903791',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903788',
          additionalIdentifier: 'ERS15897957',
          identifier: 'SAMEA113903788',
          name: '207-60-4019-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903788',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903789',
          additionalIdentifier: 'ERS15897958',
          identifier: 'SAMEA113903789',
          name: '207-60-4019-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903789',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903786',
          additionalIdentifier: 'ERS15897955',
          identifier: 'SAMEA113903786',
          name: '207-50-2109-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903786',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903787',
          additionalIdentifier: 'ERS15897956',
          identifier: 'SAMEA113903787',
          name: '207-50-2109-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903787',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903796',
          additionalIdentifier: 'ERS15897965',
          identifier: 'SAMEA113903796',
          name: '207-50-2084-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903796',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903797',
          additionalIdentifier: 'ERS15897966',
          identifier: 'SAMEA113903797',
          name: '207-50-2084-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903797',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903784',
          additionalIdentifier: 'ERS15897953',
          identifier: 'SAMEA113903784',
          name: '207-50-1983-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903784',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903785',
          additionalIdentifier: 'ERS15897954',
          identifier: 'SAMEA113903785',
          name: '207-50-1938-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903785',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903782',
          additionalIdentifier: 'ERS15897951',
          identifier: 'SAMEA113903782',
          name: '207-50-0595-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903782',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903783',
          additionalIdentifier: 'ERS15897952',
          identifier: 'SAMEA113903783',
          name: '207-50-0595-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903783',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903772',
          additionalIdentifier: 'ERS15897941',
          identifier: 'SAMEA113903772',
          name: '203-33-4054-M',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903772',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903752',
          additionalIdentifier: 'ERS15897921',
          identifier: 'SAMEA113903752',
          name: '203-33-1001-F',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903752',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903771',
          additionalIdentifier: 'ERS15897940',
          identifier: 'SAMEA113903771',
          name: '203-33-0054-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903771',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903773',
          additionalIdentifier: 'ERS15897942',
          identifier: 'SAMEA113903773',
          name: '203-33-0054-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903773',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903749',
          additionalIdentifier: 'ERS15897918',
          identifier: 'SAMEA113903749',
          name: '203-33-0050-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903749',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903750',
          additionalIdentifier: 'ERS15897919',
          identifier: 'SAMEA113903750',
          name: '203-33-0050-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903750',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903765',
          additionalIdentifier: 'ERS15897934',
          identifier: 'SAMEA113903765',
          name: '203-33-0038-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903765',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903766',
          additionalIdentifier: 'ERS15897935',
          identifier: 'SAMEA113903766',
          name: '203-33-0038-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903766',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903746',
          additionalIdentifier: 'ERS15897915',
          identifier: 'SAMEA113903746',
          name: '203-33-0034-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903746',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903748',
          additionalIdentifier: 'ERS15897917',
          identifier: 'SAMEA113903748',
          name: '203-33-0034-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903748',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903747',
          additionalIdentifier: 'ERS15897916',
          identifier: 'SAMEA113903747',
          name: '203-33-0034-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903747',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903762',
          additionalIdentifier: 'ERS15897931',
          identifier: 'SAMEA113903762',
          name: '203-33-0024-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903762',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903763',
          additionalIdentifier: 'ERS15897932',
          identifier: 'SAMEA113903763',
          name: '203-33-0024-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903763',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903744',
          additionalIdentifier: 'ERS15897913',
          identifier: 'SAMEA113903744',
          name: '203-33-0022-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903744',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903743',
          additionalIdentifier: 'ERS15897912',
          identifier: 'SAMEA113903743',
          name: '203-33-0022-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903743',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903745',
          additionalIdentifier: 'ERS15897914',
          identifier: 'SAMEA113903745',
          name: '203-33-0022-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903745',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903764',
          additionalIdentifier: 'ERS15897933',
          identifier: 'SAMEA113903764',
          name: '203-33-0021-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903764',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903756',
          additionalIdentifier: 'ERS15897925',
          identifier: 'SAMEA113903756',
          name: '203-33-0020-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903756',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903757',
          additionalIdentifier: 'ERS15897926',
          identifier: 'SAMEA113903757',
          name: '203-33-0020-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903757',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903755',
          additionalIdentifier: 'ERS15897924',
          identifier: 'SAMEA113903755',
          name: '203-33-0020-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903755',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903769',
          additionalIdentifier: 'ERS15897938',
          identifier: 'SAMEA113903769',
          name: '203-33-0015-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903769',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903770',
          additionalIdentifier: 'ERS15897939',
          identifier: 'SAMEA113903770',
          name: '203-33-0015-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903770',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903760',
          additionalIdentifier: 'ERS15897929',
          identifier: 'SAMEA113903760',
          name: '203-33-0012-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903760',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903761',
          additionalIdentifier: 'ERS15897930',
          identifier: 'SAMEA113903761',
          name: '203-33-0012-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903761',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903759',
          additionalIdentifier: 'ERS15897928',
          identifier: 'SAMEA113903759',
          name: '203-33-0011-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903759',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903758',
          additionalIdentifier: 'ERS15897927',
          identifier: 'SAMEA113903758',
          name: '203-33-0011-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903758',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903754',
          additionalIdentifier: 'ERS15897923',
          identifier: 'SAMEA113903754',
          name: '203-33-0009-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903754',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903767',
          additionalIdentifier: 'ERS15897936',
          identifier: 'SAMEA113903767',
          name: '203-33-0008-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903767',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903768',
          additionalIdentifier: 'ERS15897937',
          identifier: 'SAMEA113903768',
          name: '203-33-0008-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903768',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903742',
          additionalIdentifier: 'ERS15897911',
          identifier: 'SAMEA113903742',
          name: '203-33-0007-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903742',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903740',
          additionalIdentifier: 'ERS15897909',
          identifier: 'SAMEA113903740',
          name: '203-33-0007-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903740',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903741',
          additionalIdentifier: 'ERS15897910',
          identifier: 'SAMEA113903741',
          name: '203-33-0007-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903741',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903739',
          additionalIdentifier: 'ERS15897908',
          identifier: 'SAMEA113903739',
          name: '203-33-0006-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903739',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903737',
          additionalIdentifier: 'ERS15897906',
          identifier: 'SAMEA113903737',
          name: '203-33-0006-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903737',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903738',
          additionalIdentifier: 'ERS15897907',
          identifier: 'SAMEA113903738',
          name: '203-33-0006-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903738',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903751',
          additionalIdentifier: 'ERS15897920',
          identifier: 'SAMEA113903751',
          name: '203-33-0001-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903751',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903753',
          additionalIdentifier: 'ERS15897922',
          identifier: 'SAMEA113903753',
          name: '203-33-0001-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903753',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903727',
          additionalIdentifier: 'ERS15897896',
          identifier: 'SAMEA113903727',
          name: '203-30-2003-M',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903727',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903734',
          additionalIdentifier: 'ERS15897903',
          identifier: 'SAMEA113903734',
          name: '203-30-1007-F',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903734',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903731',
          additionalIdentifier: 'ERS15897900',
          identifier: 'SAMEA113903731',
          name: '203-30-1006-F',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903731',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903726',
          additionalIdentifier: 'ERS15897895',
          identifier: 'SAMEA113903726',
          name: '203-30-1003-M',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903726',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903725',
          additionalIdentifier: 'ERS15897894',
          identifier: 'SAMEA113903725',
          name: '203-30-1003-F',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903725',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903736',
          additionalIdentifier: 'ERS15897905',
          identifier: 'SAMEA113903736',
          name: '203-30-0007-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903736',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903733',
          additionalIdentifier: 'ERS15897902',
          identifier: 'SAMEA113903733',
          name: '203-30-0007-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903733',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903735',
          additionalIdentifier: 'ERS15897904',
          identifier: 'SAMEA113903735',
          name: '203-30-0007-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903735',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903730',
          additionalIdentifier: 'ERS15897899',
          identifier: 'SAMEA113903730',
          name: '203-30-0006-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903730',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903732',
          additionalIdentifier: 'ERS15897901',
          identifier: 'SAMEA113903732',
          name: '203-30-0006-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903732',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903729',
          additionalIdentifier: 'ERS15897898',
          identifier: 'SAMEA113903729',
          name: '203-30-0003-A',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903729',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903724',
          additionalIdentifier: 'ERS15897893',
          identifier: 'SAMEA113903724',
          name: '203-30-0003-1',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903724',
        },
        {
          '@type': 'Sample',
          _id: 'samea113903728',
          additionalIdentifier: 'ERS15897897',
          identifier: 'SAMEA113903728',
          name: '203-30-0003-0',
          url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMEA113903728',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 74,
      },
    },
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/sra/ERP146338',
    id: 'ncbi_sra_erp146338',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    sdPublisher: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'gse18468',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.14,
        augmented_required_ratio: 0.11,
        recommended_max_score: 21,
        recommended_score: 6,
        recommended_score_ratio: 0.29,
        required_max_score: 9,
        required_ratio: 1,
        required_score: 9,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 15,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: [
        'healthCondition',
        'citation',
        'topicCategory',
      ],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'datePublished',
        'species',
        'sdPublisher',
        'identifier',
      ],
      required_augmented_fields: ['funding'],
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
    _score: 24.071877,
    author: [
      {
        identifier: null,
        type: 'Person',
        name: 'Joachim G Voss',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Adrian Dobra',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Caryn Morse',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Joseph Kovacs',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Lawrence D Adams',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Rahgavan Raju',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Marinos C Dalakas',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    date: '2013-05-02',
    description:
      'HIV-related fatigue is multi-causal in origin and potentially related to mitochondrial dysfunction caused by toxicity from nucleoside reverse transcriptase inhibitor (NRTI) antiretroviral therapy. CD14+ cells are undifferentiated macrophages, vulnerable to HIV infection, and easily accessible for gene expression experiments in a purified cell population. We utilized a novel mitochondrially-specific gene expression microarray to assess mitochondrial and nuclear genes in CD14+ cells of low- and high-fatigued, NRTI-treated HIV/AIDS patients (n=5 each). Novel Bayesian and liquid association network methods identified 33 genes predictive of low versus high fatigue and 32 genes predictive of healthy versus HIV infection. Sulfotransferase 2B1 (SULT2B1) is relevant to both the cholesterol and testosterone pathway, and like several inner mitochondrial membrane genes also identified, predictive of fatigue status, while outer mitochondrial membrane genes were predictive of HIV status. A surprising finding was that adenylate cyclase 2 (ADCY2) was a predictor of both HIV and fatigue; it had the highest Kendall’s Tau association value in the HIV group, but in reverse, the lowest Tau value in the fatigue group. Assaying CD14+ cells may provide an alternative to muscle biopsy and a minimally invasive procedure to evaluate patient mitochondrial function, and Bayesian and network tools are useful to identify the link between subjective symptom perceptions and underlying biologically pathways. Fatigue status in HIV patients treated with NRTIs was found to be linked to RNA expression differences related to mitochondrial function. Additional studies are needed to confirm the relevance of our findings in CD14+ cells in other tissues (e. g. skeletal muscle) and to understand the significance of key genes such as SULT2B and ADCY2 in fatigue and HIV disease. The design was a comparison of HIV high fatigue to HIV low fatigue. Low fatigue was determined as 3-7 on the Revised Piper Fatigue Score and High fatigue was a score of 7 or greater. Five HIV negative control samples were used to compare normal fatigue and non-disease status.',
    funding: [
      {
        endDate: '2008-07-31',
        funder: [
          {
            alternateName: [
              'NINR',
              'National Institute of Nursing Research National Institutes of Health',
            ],
            identifier: 'https://ror.org/01y3zfr79',
            name: 'National Institute of Nursing Research',
            parentOrganization: 'National Institutes of Health',
          },
        ],
        identifier: '1K22NR008672-01',
        name: 'Development of a Biomarker for Fatigue in HIV/AIDS',
        projectNumSplit: {
          activityCode: 'K22',
          applTypeCode: '1',
          fullSupportYear: '01',
          icCode: 'NR',
          serialNum: '008672',
          suffixCode: '',
          supportYear: '01',
        },
        startDate: '2006-09-22',
        url: 'https://reporter.nih.gov/project-details/6695361',
      },
      {
        '@type': 'MonetaryGrant',
        identifier: '1ZIACL001164-10',
        name: 'Functional Genomics Of Critical Illness',
        url: 'https://reporter.nih.gov/project-details/7966325',
      },
      {
        endDate: '2008-07-31',
        funder: [
          {
            alternateName: [
              'NINR',
              'National Institute of Nursing Research National Institutes of Health',
            ],
            identifier: 'https://ror.org/01y3zfr79',
            name: 'National Institute of Nursing Research',
            parentOrganization: 'National Institutes of Health',
          },
        ],
        identifier: '1K22NR008672-01',
        name: 'Development of a Biomarker for Fatigue in HIV/AIDS',
        projectNumSplit: {
          activityCode: 'K22',
          applTypeCode: '1',
          fullSupportYear: '01',
          icCode: 'NR',
          serialNum: '008672',
          suffixCode: '',
          supportYear: '01',
        },
        startDate: '2006-09-22',
        url: 'https://reporter.nih.gov/project-details/6695361',
      },
      {
        fromPMID: true,
        funder: {
          '@type': 'Organization',
          name: 'PHS HHS',
        },
        identifier: '05-CLINICALCENTER-0127',
      },
    ],
    healthCondition: [
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDs',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE18468',
      name: 'NCBI GEO',
      url: 'https://www.ncbi.nlm.nih.gov/geo/',
      versionDate: '2026-05-15',
    },
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000640',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'expression assay',
        originalName: 'Expression profiling by array',
        url: 'https://ontobee.org/ontology/MMO?iri=http://purl.obolibrary.org/obo/MMO_0000640',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002696',
        inDefinedTermSet: 'EFO',
        isCurated: true,
        name: 'assay by array',
        originalName: 'Expression profiling by array',
        url: 'http://www.ebi.ac.uk/efo/EFO_0002696',
      },
    ],
    name: 'Fatigue-related HIV disease gene-networks identified in CD14+ cells isolated from HIV-infected patients',
    sample: {
      '@type': 'SampleCollection',
      aggregateElement: {
        anatomicalStructure: {
          '@type': 'DefinedTerm',
          name: 'blood',
        },
        sampleType: {
          '@type': 'DefinedTerm',
          name: 'RNA',
        },
        url: [
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459924',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459925',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459926',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459927',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459928',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459929',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459930',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459931',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459932',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459933',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459934',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459935',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459936',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459937',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459938',
        ],
      },
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'gsm459924',
          identifier: 'GSM459924',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459924',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459925',
          identifier: 'GSM459925',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459925',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459926',
          identifier: 'GSM459926',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459926',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459927',
          identifier: 'GSM459927',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459927',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459928',
          identifier: 'GSM459928',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459928',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459929',
          identifier: 'GSM459929',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459929',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459930',
          identifier: 'GSM459930',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459930',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459931',
          identifier: 'GSM459931',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459931',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459932',
          identifier: 'GSM459932',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459932',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459933',
          identifier: 'GSM459933',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459933',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459934',
          identifier: 'GSM459934',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459934',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459935',
          identifier: 'GSM459935',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459935',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459936',
          identifier: 'GSM459936',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459936',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459937',
          identifier: 'GSM459937',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459937',
        },
        {
          '@type': 'Sample',
          _id: 'gsm459938',
          identifier: 'GSM459938',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM459938',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 15,
      },
    },
    sdPublisher: [
      {
        '@type': 'Organization',
        name: 'University of Washington',
      },
    ],
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    topicCategory: [
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_0091',
        inDefinedTermSet: 'EDAM',
        name: 'Bioinformatics',
        url: 'http://edamontology.org/topic_0091',
      },
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_0804',
        inDefinedTermSet: 'EDAM',
        name: 'Immunology',
        url: 'http://edamontology.org/topic_0804',
      },
      {
        '@type': 'DefinedTerm',
        curatedBy: {
          name: 'GPT-4o-mini',
          url: 'https://openai.com/index/chatgpt',
        },
        fromGPT: true,
        identifier: 'topic_3053',
        inDefinedTermSet: 'EDAM',
        name: 'Genetics',
        url: 'http://edamontology.org/topic_3053',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE18468',
    id: 'gse18468',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'pxd041255',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.05,
        augmented_required_ratio: 0,
        recommended_max_score: 21,
        recommended_score: 7,
        recommended_score_ratio: 0.33,
        required_max_score: 9,
        required_ratio: 0.89,
        required_score: 8,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 15,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['healthCondition'],
      recommended_fields: [
        'dateCreated',
        'datePublished',
        'species',
        'variableMeasured',
        'keywords',
        'sdPublisher',
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
        'date',
      ],
    },
    _score: 23.887392,
    author: [
      {
        identifier: 'https://orcid.org/0000-0002-8791-4635',
        type: 'Person',
        name: 'Animesh Sharma',
        affiliation: {
          name: 'Engineer at NTNU, Norway',
        },
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Mari Kaarbø',
        affiliation: {
          name: 'Group Leader, Department of Microbiology, Oslo University Hospital. Norway, Tel: +47 230 13906',
        },
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    conditionsOfAccess: 'Open',
    date: '2025-09-09',
    description:
      'Background: People living with HIV are called immunological non-responders (INR) when their CD4+ T cell count is not restored to immunocompetent levels, despite successful viral suppression. INR have increased risk of progression to AIDS, non-AIDS related morbidity, and death. Impaired mucosal barrier function is a prevailing hypothesis for why INR among people with HIV (PWH) have persistently low CD4+ T cell counts.Objective: To understand the molecular mechanisms behind incomplete immune recovery in INR, we analysed gene regulation and protein expression in gut tissues from INR, immunological responders (IR), and healthy controls (HC).',
    healthCondition: [
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'AIDS',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
    ],
    includedInDataCatalog: [
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://www.omicsdi.org/dataset/pride/PXD041255',
        name: 'Omics Discovery Index (OmicsDI)',
        url: 'https://www.omicsdi.org/',
        versionDate: '2026-04-01',
      },
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://www.ebi.ac.uk/pride/archive/projects/PXD041255',
        name: 'ProteomeXchange',
        url: 'https://www.proteomexchange.org/',
        versionDate: '2026-04-01',
      },
    ],
    license:
      'https://www.proteomexchange.org/pxcollaborativeagreement_2024.pdf',
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000',
        inDefinedTermSet: '',
        isCurated: true,
        name: 'DELETE',
        originalName: 'Not available',
        url: '',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000534',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'mass spectrometry',
        originalName: 'Mass Spectrometry',
        url: 'http://purl.obolibrary.org/obo/MMO_0000534',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000470',
        inDefinedTermSet: 'OBI',
        isCurated: true,
        name: 'mass spectrometry assay',
        originalName: 'Mass Spectrometry',
        url: 'http://purl.obolibrary.org/obo/OBI_0000470',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000428',
        inDefinedTermSet: 'PRIDE',
        isCurated: true,
        name: 'Bottom-up proteomics',
        originalName: 'Shotgun proteomics',
        url: 'http://purl.obolibrary.org/obo/PRIDE_0000428',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0003229',
        inDefinedTermSet: 'OBI',
        isCurated: true,
        name: 'plasma proteomics assay',
        originalName: 'Shotgun proteomics',
        url: 'http://purl.obolibrary.org/obo/OBI_0003229',
      },
    ],
    name: 'Transcriptomic and Proteomic Profiling Reveal Immune and Metabolic Dysregulation in the Colonic Mucosa of People with HIV with Incomplete Immune Recovery',
    sample: {
      instrument: [
        {
          name: 'Q Exactive HF',
        },
      ],
    },
    sdPublisher: [
      {
        '@type': 'Organization',
        name: 'Pride',
        url: 'https://www.omicsdi.org/dataset/pride/PXD041255',
      },
    ],
    species: [
      {
        alternateName: [
          'Homo sapients',
          'human',
          'Homo sapiens Linnaeus, 1758',
          'Homo sapians',
          'Homo sapien',
          'Homo sapian',
          'Homo spaiens',
          'Human',
          'Homo sapines',
          'Home sapiens',
          'Homo sapience',
          'Homo spiens',
          'Homo sapeins',
          'Homo sapiense',
          'Humo sapiens',
          'Homo sampiens',
        ],
        classification: 'host',
        commonName: 'Human',
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: false,
        name: 'Homo sapiens',
        originalName: 'Homo Sapiens (human)',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    topicCategory: [
      {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'EDAM',
        name: 'Proteomics',
        url: 'http://edamontology.org/topic_0121',
      },
      {
        '@type': 'DefinedTerm',
        inDefinedTermSet: 'EDAM',
        name: 'Protein properties',
        url: 'http://edamontology.org/topic_0123',
      },
    ],
    url: 'https://www.omicsdi.org/dataset/pride/PXD041255',
    usageInfo: {
      url: 'https://www.proteomexchange.org/docs/reprocessed_guidelines_px.pdf',
    },
    variableMeasured: [
      {
        name: 'Proteomics',
      },
    ],
    id: 'pxd041255',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    funding: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    version: null,
  },
  {
    '@type': 'Dataset',
    _id: 'gse235038',
    _ignored: ['all.keyword'],
    _meta: {
      completeness: {
        augmented_recommended_ratio: 0.1,
        augmented_required_ratio: 0.11,
        recommended_max_score: 21,
        recommended_score: 6,
        recommended_score_ratio: 0.29,
        required_max_score: 9,
        required_ratio: 0.89,
        required_score: 8,
        total_max_score: 30,
        total_recommended_augmented: 5,
        total_required_augmented: 2,
        total_score: 14,
      },
      lineage: [
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
          parent_taxon: 7711,
          taxon: 89593,
        },
        {
          parent_taxon: 1,
          taxon: 131567,
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
          parent_taxon: 117571,
          taxon: 8287,
        },
        {
          parent_taxon: 314146,
          taxon: 9443,
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
          parent_taxon: 89593,
          taxon: 7742,
        },
        {
          parent_taxon: 9604,
          taxon: 207598,
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
          parent_taxon: 207598,
          taxon: 9605,
        },
        {
          parent_taxon: 9605,
          taxon: 9606,
        },
      ],
      recommended_augmented_fields: ['healthCondition', 'citation'],
      recommended_fields: [
        'dateCreated',
        'dateModified',
        'datePublished',
        'species',
        'sdPublisher',
        'identifier',
      ],
      required_augmented_fields: ['funding'],
      required_fields: [
        'name',
        'description',
        'author',
        'url',
        'measurementTechnique',
        'includedInDataCatalog',
        'distribution',
        'date',
      ],
    },
    _score: 23.74217,
    author: [
      {
        identifier: null,
        type: 'Person',
        name: 'Yingying Zhou',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Yuqing Huang',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Xiaoping Chen',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Tielong Chen',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Wenjia Hu',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Wei Hou',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Qi Zhang',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
      {
        identifier: null,
        type: 'Person',
        name: 'Yong Xiong',
        affiliation: null,
        familyName: null,
        givenName: null,
        role: null,
        title: null,
        url: null,
        email: null,
      },
    ],
    date: '2024-06-27',
    description:
      'Background: Many studies have shown that long noncoding RNAs (lncRNAs) derived from the host and human immunodeficiency virus (HIV) itself play important roles in virus-host interactions and viral pathogenesis. It is unclear whether lncRNAs were involved in ART therapy of HIV/AIDS patients. Methods: Six HIV/acquired immunodeficiency syndrome (AIDS) subjects pre-HAART and post-HAART with effective control of plasma viremia (<20 HIV RNA copies/ml) and 6 healthy subjects were recruited in this study to perform RNA sequencing. The expression profiles of lncRNAs and mRNAs were obtained, to exploration of the potential roles of lncRNAs, trans- and cis-acting analysis was used. Then, Gene Ontology (GO) and Kyoto Encyclopedia of Genes and Genomes (KEGG) pathway enrichment analyses were performed to sort out functional categories of genes. Results: We identified a total of 974 lncRNAs whose expression levels were restored to normal after ART therapy. The results of the cis-acting analysis showed that only six lncRNAs have cis-regulated target genes, among which the target gene RP11-290F5.1, interferon regulatory factors 2 (IRF2), could promote HIV replication. We also identified lncRNA CTB-119C2.1, which regulates most mRNAs with differential expression between pre- and post-HAART, and the differences were significant. We selected lncRNA CTB-119C2.1 for qRT–PCR verification, and the results were consistent with those of RNA-seq. RAB3A and GADD45A, two of the lncRNA CTB-119C2.1-associated genes, have been shown to be associated with HIV infection. KEGG analysis of lncRNA CTB-119C2.1-associated genes revealed that most of the genes are involved in the p53 signaling pathway or pathways related to cell circulation and DNA replication. Conclusion: In this study, we used RNA-seq to systematically compare the expression profiles of lncRNAs in HIV subjects between untreated and treated time points. We successfully identified some lncRNAs with differential expression during certain periods (no HIV infection, HIV infection before treatment, and after treatment). Their expression is associated with HIV viral loads, and some of their regulating genes were found to be involved in HIV pathogenesis through bioinformatic analysis. These findings could help to reveal the underlying molecular mechanism of the progression of HIV infection. In order to reveal whether lncrna is involved in ART therapy for HIV/AIDS patients,six HIV/acquired immunodeficiency syndrome (AIDS) subjects pre-HAART and post-HAART with effective control of plasma viremia (<20 HIV RNA copies/ml) and 6 healthy subjects were recruited in this study to perform RNA sequencing. The expression profiles of lncRNAs and mRNAs were obtained, to exploration of the potential roles of lncRNAs, trans- and cis-acting analysis was used. Then, Gene Ontology (GO) and Kyoto Encyclopedia of Genes and Genomes (KEGG) pathway enrichment analyses were performed to sort out functional categories of genes.',
    funding: [
      {
        fromPMID: true,
        funder: {
          '@type': 'Organization',
          name: 'the Translational Medicine and Interdisciplinary Research Joint Fund of Zhongnan Hospital of Wuhan University',
        },
        identifier: 'ZNLH201905',
      },
      {
        fromPMID: true,
        funder: {
          '@type': 'Organization',
          name: 'the National Key Research and Development Program of China',
        },
        identifier: '2018YFE0204503',
      },
      {
        fromPMID: true,
        funder: {
          '@type': 'Organization',
          name: 'Natural Science Foundation of China',
        },
        identifier: '81871251',
      },
      {
        fromPMID: true,
        funder: {
          '@type': 'Organization',
          name: 'the Medical Science Advancement Program (Basical Medical Sciences) of Wuhan University',
        },
        identifier: 'TFJC2018002',
      },
    ],
    healthCondition: [
      {
        alternateName: [
          'acquired immunodeficiency disease',
          'AIDS',
          'acquired immunodeficiency syndrome, AIDS',
          'acquired immune deficiency',
          'AIDS, acquired immunodeficiency syndrome',
        ],
        curatedBy: {
          dateModified: '2024-11-26',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0012268',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'AIDS',
        originalName: 'acquired immunodeficiency syndrome',
        url: 'http://purl.obolibrary.org/obo/MONDO_0012268',
      },
      {
        alternateName: [
          'Human immunodeficiency virus disease or disorder',
          'Human immunodeficiency virus infectious disease',
          'HIV infection',
          'Human immunodeficiency virus caused disease or disorder',
        ],
        curatedBy: {
          dateModified: '2025-01-15',
          name: 'Biothings API',
          url: 'https://biothings.io/',
        },
        fromEXTRACT: true,
        identifier: '0005109',
        inDefinedTermSet: 'MONDO',
        isCurated: true,
        name: 'HIV infectious disease',
        originalName: 'HIV infection',
        url: 'http://purl.obolibrary.org/obo/MONDO_0005109',
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      archivedAt:
        'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE235038',
      name: 'NCBI GEO',
      url: 'https://www.ncbi.nlm.nih.gov/geo/',
      versionDate: '2026-05-15',
    },
    measurementTechnique: [
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0000644',
        inDefinedTermSet: 'MMO',
        isCurated: true,
        name: 'high-throughput expression assay',
        originalName: 'Expression profiling by high throughput sequencing',
        url: 'https://ontobee.org/ontology/MMO?iri=http://purl.obolibrary.org/obo/MMO_0000644',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002697',
        inDefinedTermSet: 'EFO',
        isCurated: true,
        name: 'assay by high throughput sequencer',
        originalName: 'Expression profiling by high throughput sequencing',
        url: 'http://www.ebi.ac.uk/efo/EFO_0002697',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: 'C172858',
        inDefinedTermSet: 'NCIT',
        isCurated: true,
        name: 'Non-Coding RNA Sequencing',
        originalName: 'Non-coding RNA profiling by high throughput sequencing',
        url: 'https://ontobee.org/ontology/NCIT?iri=http://purl.obolibrary.org/obo/NCIT_C172858',
      },
      {
        '@type': 'DefinedTerm',
        field: 'measurementTechnique',
        identifier: '0002697',
        inDefinedTermSet: 'EFO',
        isCurated: true,
        name: 'assay by high throughput sequencer',
        originalName: 'Non-coding RNA profiling by high throughput sequencing',
        url: 'http://www.ebi.ac.uk/efo/EFO_0002697',
      },
    ],
    name: 'Transcriptomic study reveals changes of lncRNAs in PBMCs from HIV-1 patients before and after ART',
    sample: {
      '@type': 'SampleCollection',
      aggregateElement: {
        anatomicalStructure: {
          '@type': 'DefinedTerm',
          name: 'Peripheral blood monocytes',
        },
        sampleType: [
          {
            '@type': 'DefinedTerm',
            name: 'SRA',
          },
          {
            '@type': 'DefinedTerm',
            name: 'transcriptomic',
          },
        ],
        url: [
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493550',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493551',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493552',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493553',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493554',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493555',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493556',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493557',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493558',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493559',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493560',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493561',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493562',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493563',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493564',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493565',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493566',
          'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493567',
        ],
      },
      itemListElement: [
        {
          '@type': 'Sample',
          _id: 'gsm7493550',
          identifier: 'GSM7493550',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493550',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493551',
          identifier: 'GSM7493551',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493551',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493552',
          identifier: 'GSM7493552',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493552',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493553',
          identifier: 'GSM7493553',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493553',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493554',
          identifier: 'GSM7493554',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493554',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493555',
          identifier: 'GSM7493555',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493555',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493556',
          identifier: 'GSM7493556',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493556',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493557',
          identifier: 'GSM7493557',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493557',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493558',
          identifier: 'GSM7493558',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493558',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493559',
          identifier: 'GSM7493559',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493559',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493560',
          identifier: 'GSM7493560',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493560',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493561',
          identifier: 'GSM7493561',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493561',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493562',
          identifier: 'GSM7493562',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493562',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493563',
          identifier: 'GSM7493563',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493563',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493564',
          identifier: 'GSM7493564',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493564',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493565',
          identifier: 'GSM7493565',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493565',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493566',
          identifier: 'GSM7493566',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493566',
        },
        {
          '@type': 'Sample',
          _id: 'gsm7493567',
          identifier: 'GSM7493567',
          url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM7493567',
        },
      ],
      numberOfItems: {
        unitText: 'sample',
        value: 18,
      },
    },
    sdPublisher: [
      {
        '@type': 'Organization',
        name: 'Zhongnan Hospital of Wuhan university',
      },
    ],
    species: [
      {
        alternateName: [
          'Human',
          'Homo sapiens Linnaeus, 1758',
          'human',
          'Home sapiens',
          'Homo sampiens',
          'Homo sapeins',
          'Homo sapian',
          'Homo sapians',
          'Homo sapien',
          'Homo sapience',
          'Homo sapiense',
          'Homo sapients',
          'Homo sapines',
          'Homo spaiens',
          'Homo spiens',
          'Humo sapiens',
        ],
        classification: 'host',
        commonName: 'Human',
        curatedBy: {
          dateModified: '2023-10-05',
          name: 'PubTator',
          url: 'https://www.ncbi.nlm.nih.gov/research/pubtator/api.html',
        },
        displayName: 'Human | Homo sapiens',
        identifier: '9606',
        inDefinedTermSet: 'UniProt',
        isCurated: true,
        name: 'Homo sapiens',
        originalName: 'homo sapiens',
        url: 'https://www.uniprot.org/taxonomy/9606',
      },
    ],
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE235038',
    id: 'gse235038',
    aggregateRating: null,
    applicationCategory: null,
    applicationSubCategory: null,
    applicationSuite: null,
    availableOnDevice: null,
    citation: null,
    citedBy: null,
    codeRepository: null,
    collectionSize: null,
    condition: null,
    conditionsOfAccess: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    discussionUrl: null,
    disease: null,
    distribution: null,
    doi: null,
    downloadUrl: null,
    genre: null,
    hasPart: null,
    infectiousAgent: null,
    input: null,
    interactionStatistics: null,
    isAccessibleForFree: null,
    isBasedOn: null,
    isBasisFor: null,
    isPartOf: null,
    isRelatedTo: null,
    keywords: null,
    inLanguage: null,
    license: null,
    mainEntityOfPage: null,
    nctid: null,
    output: null,
    processorRequirements: null,
    programmingLanguage: null,
    publisher: null,
    sameAs: null,
    softwareAddOn: null,
    softwareHelp: null,
    softwareRequirements: null,
    softwareVersion: null,
    sourceOrganization: null,
    spatialCoverage: null,
    temporalCoverage: null,
    topicCategory: null,
    usageInfo: null,
    variableMeasured: null,
    version: null,
  },
];

// A stable, unique, ASCII-only title from the fixture above — used as the wait
// target so the populated scan only runs once the real card list has rendered.
// (Two fixture records share the lncRNAs/PBMCs title, so it would be ambiguous;
// this one is unique.)
const DATASET_NAME =
  'HIV-Tocky system to visualize proviral expression dynamics';

// Raw NDE /query response for the populated state. fetchSearchResults reads
// `hits`, `total`, and `facets`, so the fixture mirrors that shape: the page of
// Dataset hits above plus a matching `@type` facet count, which puts the default
// ("d") tab into its populated, card-rendering state.
const POPULATED_FIXTURE = {
  total: POPULATED_HITS.length,
  hits: POPULATED_HITS,
  facets: {
    '@type': {
      _type: 'terms',
      terms: [{ term: 'Dataset', count: POPULATED_HITS.length }],
      total: POPULATED_HITS.length,
      other: 0,
      missing: 0,
    },
  },
};

const EMPTY_FIXTURE = {
  total: 0,
  hits: [],
  facets: {
    '@type': {
      _type: 'terms',
      terms: [],
      total: 0,
      other: 0,
      missing: 0,
    },
  },
};

// --- Shared checks run in every state ---------------------------------------

/**
 * The axe scans every state runs: a full WCAG A/AA scan, a focused
 * color-contrast scan, and a focused button/link-name scan, each reported
 * separately, plus a screenshot. Split out from runSharedChecks so the
 * interaction states (open menus/dropdowns/popovers) can run the same scans
 * without the resting-layout structure/form assertions, which can flake when a
 * portal is covering the page chrome.
 */
async function runAxeScans(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. The helper's tag set (WCAG_AA_TAGS) already
  // includes color-contrast and the landmark/heading-order best-practice
  // rules, so this single scan is the backbone of the check.
  const results = await analyzeA11y(page);
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

async function runSharedChecks(page: Page, testInfo: TestInfo, state: string) {
  // Structural sanity — also proves the page rendered the intended chrome. The
  // search results header renders the page's single h1 ("Showing all results")
  // in every state, above the results region that varies by state.
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: /showing all results/i }),
  ).toBeVisible();

  // Forms: the site-wide search bar is rendered on this route
  // (`includeSearchBar`) and its control must be programmatically labelled.
  const search = page.getByRole('textbox', { name: /search for resources/i });
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();

  await runAxeScans(page, testInfo, state);
}

// --- Loading -----------------------------------------------------------------

test.describe('a11y: Search — loading', () => {
  test('passes axe while loading', async ({ page }, testInfo) => {
    // Keep every request pending so the loading UI stays on screen.
    for (const glob of API_GLOBS) {
      await page.route(glob, () => new Promise<void>(() => {}));
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // The header h1 renders immediately; the results cards render skeletons
    // through src/components/skeleton with the `.custom-skeleton-loading`
    // class — a CSS selector is acceptable here only because skeletons have no
    // accessible surface to target.
    await expect(
      page.getByRole('heading', { level: 1, name: /showing all results/i }),
    ).toBeVisible();
    await expect(
      page.locator('.custom-skeleton-loading').first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'loading');
  });
});

// --- Empty -------------------------------------------------------------------

test.describe('a11y: Search — empty', () => {
  test('passes axe with no results', async ({ page }, testInfo) => {
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_FIXTURE),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
      }),
    );
    await page.route('**/api/diseases*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the user-facing empty-state message rendered by EmptyState.
    // The default tab renders an EmptyState for both the "Other Resources" and
    // the "Datasets" sections; only the Datasets accordion is expanded by
    // default, so its (last) empty message is the visible one.
    await expect(
      page.getByText('No results found. Please try again.').last(),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    await runSharedChecks(page, testInfo, 'empty');
  });
});

// --- Populated ---------------------------------------------------------------

/**
 * The result card lazy-renders its body — author, date, description, the
 * completeness badge, source logos, and the action buttons — only after the card
 * scrolls into the viewport (`useInView({ once: true })` in
 * src/views/search/components/results-list/components/card). Until then only the
 * CardHeader (the title link) is in the DOM, so a resting scan/screenshot sees
 * title-only shells. Step-scroll the page so every card's IntersectionObserver
 * fires (once: true keeps them rendered after we scroll back), then return to the
 * top so the full-page screenshot is captured from a stable position. The caller
 * waits for the body content before scanning.
 */
async function revealAllCards(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>(resolve => {
        let y = 0;
        const step = () => {
          window.scrollBy(0, Math.round(window.innerHeight * 0.8));
          y += Math.round(window.innerHeight * 0.8);
          if (y < document.body.scrollHeight) {
            setTimeout(step, 120);
          } else {
            window.scrollTo(0, 0);
            // Give the observers a tick to settle at the top before resolving.
            setTimeout(resolve, 120);
          }
        };
        step();
      }),
  );
}

test.describe('a11y: Search — populated', () => {
  test('passes axe with representative data', async ({ page }, testInfo) => {
    await page.route('**/query*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(POPULATED_FIXTURE),
      }),
    );
    await page.route('**/metadata*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
      }),
    );
    await page.route('**/api/diseases*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the fixture's result card to render — its title link only exists
    // once the populated data resolves — so we know we're scanning the
    // populated DOM and not the loading or empty state.
    await expect(
      page.getByRole('link', { name: new RegExp(DATASET_NAME, 'i') }).first(),
    ).toBeVisible();
    await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);

    // Scroll every card into view so each lazily renders its full body, then
    // wait for the in-view-only action ("View resource" renders once per card
    // with an id, inside the useInView gate). This proves the cards are fully
    // populated from the fixture — not title-only shells — before we scan.
    await revealAllCards(page);
    await expect(page.getByText('View resource')).toHaveCount(
      POPULATED_HITS.length,
    );

    await runSharedChecks(page, testInfo, 'populated');
  });
});

// --- Error -------------------------------------------------------------------

test.describe('a11y: Search — error', () => {
  test('passes axe in the error state', async ({ page }, testInfo) => {
    // Abort every data request so the results query rejects and the route
    // renders its ErrorMessage UI, matching a production network failure.
    for (const glob of API_GLOBS) {
      await page.route(glob, route => route.abort());
    }
    await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });

    // Wait for the error UI: the ErrorMessage's heading and Retry control.
    await expect(
      page.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /retry/i }).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'error');
  });
});

// --- Interaction states ------------------------------------------------------
//
// The states above scan the page at rest. These scan distinct markup that only
// exists after a user action — surfaces axe never sees in a resting scan because
// they're mounted-on-open (portals) and axe skips hidden nodes. We scan each
// once via runAxeScans (no resting-layout asserts — an open portal can cover the
// page chrome). We deliberately DON'T re-scan "more of the same" surfaces: the
// predictive-search dropdown (same InputWithDropdown already scanned in
// advanced-search.spec.ts) or sibling result tabs (re-render the same card
// list). The Customize Columns popover lives only on the Samples/DataCollections
// table tabs (feature-gated) — covered by the repository-matcher spec's table
// popover, the same SelectAndSortPopover component.

/** Put the page into the populated, results-rendered state used by the
 * interaction scans below (mirrors the populated describe block). */
async function gotoPopulated(page: Page) {
  await page.route('**/query*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(POPULATED_FIXTURE),
    }),
  );
  await page.route('**/metadata*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
    }),
  );
  await page.route('**/api/diseases*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  // Results rendered — the toolbar (Download Metadata) and search bar are present.
  await expect(
    page.getByRole('link', { name: new RegExp(DATASET_NAME, 'i') }).first(),
  ).toBeVisible();
}

// --- Search bar "Type" options menu (CheckboxList popover) --------------------

test.describe('a11y: Search — type options menu', () => {
  test('passes axe with the search-bar type popover open', async ({
    page,
  }, testInfo) => {
    await gotoPopulated(page);

    // The search bar renders a "Type" options menu (src/components/checkbox-list
    // → Chakra Popover). Exact name avoids matching filter sections like "Data
    // Type". Opening it reveals a checkbox group that doesn't exist until open.
    await page.getByRole('button', { name: 'Type', exact: true }).click();
    await expect(
      page.getByRole('checkbox', { name: /dataset repository/i }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'type-options-menu');
  });
});

// --- Download Metadata format menu -------------------------------------------

test.describe('a11y: Search — download metadata menu', () => {
  test('passes axe with the download format list open', async ({
    page,
  }, testInfo) => {
    await gotoPopulated(page);

    // The Download Metadata button (results toolbar) toggles a Collapse list of
    // JSON/CSV options that isn't in the DOM until opened. Just toggling fires
    // no request (the download query is enabled only once a format is chosen).
    await page
      .getByRole('button', { name: /download metadata/i })
      .first()
      .click();
    await expect(page.getByText(/json format/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'download-metadata-menu');
  });
});

// --- Per-card "Show metadata" accordion --------------------------------------

test.describe('a11y: Search — show metadata accordion', () => {
  test('passes axe with a card metadata panel expanded', async ({
    page,
  }, testInfo) => {
    await gotoPopulated(page);

    // The "Show metadata" accordion button lives in the card body, which only
    // mounts once the card scrolls into view (useInView). Reveal every card so
    // the buttons render, then operate on the first card's accordion.
    await revealAllCards(page);

    const showMetadata = page
      .getByRole('button', { name: /show metadata/i })
      .first();
    await expect(showMetadata).toBeVisible();
    await showMetadata.scrollIntoViewIfNeeded();

    // Expanding renders the AccordionPanel's metadata grid (dynamically imported
    // MetadataBlock/MetadataContent) — markup that doesn't exist in the DOM until
    // open. Wait for a populated metadata value: every fixture record lists the
    // "Homo sapiens" species, which the expanded panel renders as the Species
    // block's value. The collapsed button only carries the short "Species" tag
    // label (no value), and the other cards' panels stay collapsed, so this
    // string proves THIS panel is genuinely open before we scan.
    await showMetadata.click();
    await expect(showMetadata).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Homo sapiens').first()).toBeVisible();

    await runAxeScans(page, testInfo, 'show-metadata-accordion');
  });
});

// --- Resource Catalog carousel -----------------------------------------------
//
// ResourceCatalog results don't render as the normal stacked result Card. In the
// default ("d") tab they appear in the "Other Resources / Resource Catalogs"
// accordion as a horizontal Carousel of compact ResourceCatalogCards
// (src/views/search/components/results-list/components/carousel-compact-card/
// resource-catalog-card). That card is where creativeWorkStatus is surfaced — a
// red "Retired" badge (src/components/badges CreativeWorkStatus) renders only for
// "Retired"; every other status (or none) renders no badge. The fixture below
// mixes one Retired record (HMP) with three non-retired ones so the scan covers
// both the badge and its absence, plus the ConditionsOfAccess (Open/Registered)
// and HasAPI badges.
//
// Data flow the mock has to satisfy (all client-side `**/query*` calls):
//   1. the facet query (size 0) must report ResourceCatalog in the `@type` facet
//      so the carousel is enabled and the default tab is selected;
//   2. the carousel query (filtered to `@type: ['ResourceCatalog']`, so its URL
//      contains "ResourceCatalog") must return the catalog hits.
// We branch the `**/query*` handler on that substring: the catalog query gets the
// hits; every other query (facet, Dataset section, bioSample agg) gets the same
// ResourceCatalog facet count but no hits, leaving the Datasets section empty and
// keeping the focus on the carousel.

// The Retired catalog record. Kept separate from the non-retired set because the
// Retired card renders on a gray `page.alt` background, which is where the
// contrast regression lives — see the "resource catalog (retired)" describe.
const RETIRED_RESOURCE_CATALOG_HIT = {
  '@type': 'ResourceCatalog',
  _id: 'dde_aa7c754e5e4abe84',
  id: 'dde_aa7c754e5e4abe84',
  alternateName: 'HMP',
  conditionsOfAccess: 'Open',
  creativeWorkStatus: 'Retired',
  date: '2026-04-14',
  hasAPI: true,
  name: 'Human Microbiome Project Portal',
  description:
    'The overall mission of the HMP was to generate resources to facilitate characterization of the human microbiota to further our understanding of how the microbiome impacts human health and disease.',
  about: [
    {
      '@type': 'DefinedTerm',
      displayName: 'Experiment',
      name: 'Experiment',
      url: 'http://purl.obolibrary.org/obo/NCIT_C42790',
    },
    {
      '@type': 'DefinedTerm',
      displayName: 'Molecular Entity',
      name: 'MolecularEntity',
      url: 'https://schema.org/MolecularEntity',
    },
    {
      '@type': 'DefinedTerm',
      displayName: 'Sample',
      name: 'Sample',
      url: 'http://www.w3.org/ns/sosa/Sample',
    },
  ],
  includedInDataCatalog: [
    {
      '@type': 'DataCatalog',
      archivedAt: 'https://discovery.biothings.io/resource/aa7c754e5e4abe84',
      name: 'Data Discovery Engine',
      url: 'https://discovery.biothings.io/',
      versionDate: '2026-06-13',
    },
  ],
};

// Three non-retired catalog records (white card background) — these get real
// passing coverage of the compact ResourceCatalogCard and its badges.
const RESOURCE_CATALOG_HITS = [
  {
    '@type': 'ResourceCatalog',
    _id: 'dde_9e34e9698fb412c3',
    id: 'dde_9e34e9698fb412c3',
    alternateName: 'IEDB',
    conditionsOfAccess: 'Open',
    date: '2025-05-14',
    hasAPI: true,
    name: 'Immune Epitope Database',
    description:
      'The Immune Epitope Database (IEDB) is a freely available resource funded by NIAID. It catalogs experimental data on antibody and T cell epitopes studied in humans and other animal species in the context of infectious disease, allergy, autoimmunity and transplantation.',
    about: [
      {
        '@type': 'DefinedTerm',
        displayName: 'Experiment',
        name: 'Experiment',
        url: 'http://purl.obolibrary.org/obo/NCIT_C42790',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Epitope',
        name: 'Epitope',
        url: 'http://purl.obolibrary.org/obo/NCIT_C13189',
      },
    ],
    includedInDataCatalog: [
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://discovery.biothings.io/resource/9e34e9698fb412c3',
        name: 'Data Discovery Engine',
        url: 'https://discovery.biothings.io/',
        versionDate: '2026-06-13',
      },
    ],
  },
  {
    '@type': 'ResourceCatalog',
    _id: 'dde_39de363a93dfc491',
    id: 'dde_39de363a93dfc491',
    alternateName: 'ITN TrialShare',
    conditionsOfAccess: 'Registered',
    date: '2025-05-14',
    hasAPI: false,
    name: 'Immune Tolerance Network TrialShare Clinical Trials Research Portal',
    description:
      "ITN TrialShare shares information about ITN's clinical studies and specimen bio-repository. Data and analysis code underlying ITN-published manuscripts are publicly available with the goal of promoting transparency, reproducibility, and scientific collaboration.",
    about: [
      {
        '@type': 'DefinedTerm',
        displayName: 'Sample',
        name: 'Sample',
        url: 'http://www.w3.org/ns/sosa/Sample',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Clinical Study',
        name: 'ClinicalStudy',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15206',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Dataset',
        name: 'Dataset',
        url: 'http://purl.obolibrary.org/obo/NCIT_C47824',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Publication',
        name: 'Publication',
        url: 'http://purl.obolibrary.org/obo/NCIT_C19026',
      },
    ],
    includedInDataCatalog: [
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://discovery.biothings.io/resource/39de363a93dfc491',
        name: 'Data Discovery Engine',
        url: 'https://discovery.biothings.io/',
        versionDate: '2026-06-13',
      },
    ],
  },
  {
    '@type': 'ResourceCatalog',
    _id: 'dde_8b9a4aa0d78d0659',
    id: 'dde_8b9a4aa0d78d0659',
    alternateName: 'ITN TrialShare',
    conditionsOfAccess: 'Registered',
    date: '2025-05-14',
    hasAPI: false,
    name: 'ImmuneSpace',
    description:
      'The Human Immunology Project Consortium (HIPC) program was established in 2010, and renewed in 2015 and in 2022, by the NIAID Division of Allergy, Immunology, and Transplantation as part of the overall NIAID focus on human immunology.',
    about: [
      {
        '@type': 'DefinedTerm',
        displayName: 'Sample',
        name: 'Sample',
        url: 'http://www.w3.org/ns/sosa/Sample',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Experiment',
        name: 'Experiment',
        url: 'http://purl.obolibrary.org/obo/NCIT_C42790',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Clinical Study',
        name: 'ClinicalStudy',
        url: 'http://purl.obolibrary.org/obo/NCIT_C15206',
      },
      {
        '@type': 'DefinedTerm',
        displayName: 'Patient',
        name: 'Patient',
        url: 'http://purl.obolibrary.org/obo/NCIT_C16960',
      },
    ],
    includedInDataCatalog: [
      {
        '@type': 'DataCatalog',
        archivedAt: 'https://discovery.biothings.io/resource/8b9a4aa0d78d0659',
        name: 'Data Discovery Engine',
        url: 'https://discovery.biothings.io/',
        versionDate: '2026-06-13',
      },
    ],
  },
];

// Build the `@type` facet block for a given catalog hit count.
const resourceCatalogFacets = (count: number) => ({
  '@type': {
    _type: 'terms',
    terms: [{ term: 'ResourceCatalog', count }],
    total: count,
    other: 0,
    missing: 0,
  },
});

// Put the default tab into its Resource Catalogs carousel state with the given
// catalog hits: every query reports ResourceCatalog in the `@type` facet (so the
// carousel mounts and the default tab is chosen), and the catalog-filtered query
// (its URL contains "ResourceCatalog") returns the hits. Waits for `waitFor`.
async function gotoResourceCatalog(
  page: Page,
  hits: unknown[],
  waitFor: string,
) {
  const facets = resourceCatalogFacets(hits.length);
  await page.route('**/query*', route => {
    const isCatalogQuery = decodeURIComponent(route.request().url()).includes(
      'ResourceCatalog',
    );
    const body = isCatalogQuery
      ? { total: hits.length, hits, facets }
      : { total: 0, hits: [], facets };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  await page.route('**/metadata*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ build_date: '2026-06-17T00:00:00Z', src: {} }),
    }),
  );
  await page.route('**/api/diseases*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('link', { name: new RegExp(waitFor, 'i') }).first(),
  ).toBeVisible();
  await expect(page.locator('.custom-skeleton-loading')).toHaveCount(0);
}

test.describe('a11y: Search — resource catalog carousel', () => {
  test('passes axe with non-retired catalog cards', async ({
    page,
  }, testInfo) => {
    await gotoResourceCatalog(
      page,
      RESOURCE_CATALOG_HITS,
      'Immune Epitope Database',
    );

    // The carousel renders every catalog card in the DOM (off-screen items are
    // translated, not unmounted), so one scan covers all three cards, their
    // ConditionsOfAccess (Open/Registered) and HasAPI badges, dates, and the
    // content-types lists.
    await expect(
      page.getByRole('link', { name: /immunespace/i }).first(),
    ).toBeVisible();

    await runSharedChecks(page, testInfo, 'resource-catalog-carousel');
  });
});

test.describe('a11y: Search — resource catalog content types', () => {
  test('passes axe with a card content-types list expanded', async ({
    page,
  }, testInfo) => {
    await gotoResourceCatalog(
      page,
      RESOURCE_CATALOG_HITS,
      'Immune Epitope Database',
    );

    // Each compact card caps its "Content Types" (the `about` terms) at two and
    // exposes a "Show more types" toggle (SearchableItems). The first card with
    // >2 types (ITN TrialShare) gets toggled; expanding reveals the remaining
    // terms and swaps the description for a "See description" button — markup
    // absent on first paint. Wait for that button before scanning.
    const showMore = page
      .getByRole('button', { name: /show more types/i })
      .first();
    await expect(showMore).toBeVisible();
    await showMore.scrollIntoViewIfNeeded();
    await showMore.click();
    await expect(
      page.getByRole('button', { name: /see description/i }).first(),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'resource-catalog-content-types');
  });
});

// --- Retired resource catalog card -------------------------------------------
//
// FIXME: the Retired ResourceCatalog card surfaces a REAL serious color-contrast
// violation. The card applies a gray treatment (bg `page.alt`, #f5f6fa) to signal
// retirement (resource-catalog-card/index.tsx `cardBg = isRetired ? 'page.alt'
// : 'white'`), but its interactive text stays teal #0b8484 (the SearchableItems
// "Show more types" toggle and the content-type item links, colorScheme
// 'primary'). That teal clears 4.5:1 on the white background of non-retired cards
// (~4.57) but drops to 4.18:1 on the gray Retired background — below AA for
// <18px normal text. The red "Retired" badge itself is fine; the regression is
// the gray card background lowering the teal text's contrast. This is a theme/
// design decision (darken the primary teal, or don't tint the Retired card
// background), out of scope for adding this spec, so the scan is parked as
// test.fixme (not loosened). To re-enable: fix the contrast, then change
// `test.fixme` back to `test`.

test.describe('a11y: Search — resource catalog (retired)', () => {
  test.fixme(
    'passes axe with a Retired catalog card',
    async ({ page }, testInfo) => {
      await gotoResourceCatalog(
        page,
        [RETIRED_RESOURCE_CATALOG_HIT],
        'Human Microbiome Project Portal',
      );

      // Prove the Retired badge rendered before scanning.
      await expect(page.getByText('Retired').first()).toBeVisible();

      await runSharedChecks(page, testInfo, 'resource-catalog-retired');
    },
  );
});
