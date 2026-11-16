/**
 * Mocked NDE `/query` responses for the Search tables (table view of the
 * Datasets, Computational Tools and Data Collections tabs; the Samples tab).
 * Shared by e2e/accessibility/search.spec.ts and
 * e2e/layout/search-tables.spec.ts.
 *
 * Every tab gets a few records exercising each kind of cell: links, link lists,
 * term lists long enough for "Show N More", the access badge, a clamped
 * description, and a sparse record whose missing values show "No data". The
 * `@type` facet gives every tab a count, so each tab has results.
 */

const LONG_DESCRIPTION =
  'A longitudinal study of immune responses to seasonal influenza vaccination ' +
  'across several cohorts, with serology, cytokine panels and transcriptomic ' +
  'profiles collected before and after vaccination. Samples were collected at ' +
  'baseline and at four follow-up visits, and the data were harmonized across ' +
  'sites to support pooled analyses of vaccine response.';

const SPECIES = [
  {
    name: 'Homo sapiens',
    url: 'http://purl.obolibrary.org/obo/NCBITaxon_9606',
  },
  {
    name: 'Mus musculus',
    url: 'http://purl.obolibrary.org/obo/NCBITaxon_10090',
  },
];

const PATHOGENS = [
  'influenza A virus',
  'influenza B virus',
  'SARS-CoV-2',
  'respiratory syncytial virus',
  'human metapneumovirus',
  'rhinovirus',
  'adenovirus',
].map(name => ({ name }));

const FUNDING = [
  {
    identifier: 'R01AI000001',
    url: 'https://reporter.nih.gov/project-details/R01AI000001',
    funder: [
      {
        name: 'National Institute of Allergy and Infectious Diseases',
        identifier: 'https://ror.org/043z4tv69',
      },
    ],
  },
];

const IMMPORT = { name: 'ImmPort', url: 'https://www.immport.org' };

/** A full Dataset record; `index` keeps ids and names unique. */
export const datasetHit = (index: number) => ({
  '@type': 'Dataset',
  _id: `e2e-dataset-${index}`,
  id: `e2e-dataset-${index}`,
  name: `Influenza vaccine response cohort ${index + 1}`,
  date: `2024-0${(index % 9) + 1}-15`,
  author: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }],
  conditionsOfAccess: index % 2 ? 'Controlled' : 'Open',
  description: LONG_DESCRIPTION,
  includedInDataCatalog: IMMPORT,
  infectiousAgent: PATHOGENS,
  species: SPECIES,
  healthCondition: [{ name: 'influenza' }],
  measurementTechnique: [{ name: 'flow cytometry' }],
  funding: FUNDING,
  license: 'https://creativecommons.org/licenses/by/4.0/',
  usageInfo: { name: 'Data use agreement', url: 'https://example.org/dua' },
  topicCategory: [{ name: 'Immunology' }, { name: 'Vaccinology' }],
});

/** A Dataset with nothing but a name: every other cell shows "No data". */
export const SPARSE_DATASET = {
  '@type': 'Dataset',
  _id: 'e2e-dataset-sparse',
  id: 'e2e-dataset-sparse',
  name: 'Sparse dataset record',
};

export const COMPUTATIONAL_TOOL_HIT = {
  '@type': 'ComputationalTool',
  _id: 'e2e-tool-1',
  id: 'e2e-tool-1',
  name: 'Flow cytometry gating toolkit',
  date: '2023-11-02',
  conditionsOfAccess: 'Open',
  description: 'Automated gating for high-dimensional cytometry data.',
  includedInDataCatalog: { name: 'bio.tools', url: 'https://bio.tools' },
  applicationCategory: ['command-line tool', 'library'],
  programmingLanguage: ['python', 'R'],
  operatingSystem: ['Linux', 'Mac', 'Windows'],
  softwareHelp: [{ name: ['Documentation'], url: 'https://example.org/docs' }],
  softwareVersion: ['2.1.0'],
  license: 'https://opensource.org/licenses/MIT',
};

export const SAMPLE_HIT = {
  '@type': 'Sample',
  _id: '_e2e-sample-1',
  id: 'e2e-sample-1',
  identifier: 'SAMN00000001',
  url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN00000001',
  name: 'peripheral blood sample, donor 12',
  date: '2022-05-20',
  conditionsOfAccess: 'Open',
  includedInDataCatalog: [
    { name: 'NCBI BioSample', url: 'https://www.ncbi.nlm.nih.gov/biosample' },
    IMMPORT,
  ],
  sex: 'female',
  species: [SPECIES[0]],
  funding: FUNDING,
};

export const DATA_COLLECTION_HIT = {
  '@type': 'DataCollection',
  _id: 'e2e-collection-1',
  id: 'e2e-collection-1',
  name: 'Influenza imaging collection',
  date: '2025-01-10',
  conditionsOfAccess: 'Open',
  description: 'Electron micrographs and tomograms of influenza virions.',
  includedInDataCatalog: {
    name: 'EMPIAR',
    url: 'https://www.ebi.ac.uk/empiar',
  },
  about: [
    { name: 'tomogram', url: 'http://edamontology.org/data_3016' },
    { name: 'electron micrograph' },
  ],
  isBasedOn: [{ '@type': 'Action', name: 'Cryo-electron tomography' }],
  collectionSize: [{ minValue: 1000, unitText: 'IMAGES' }],
};

/** Enough Dataset rows to overflow the table's 70vh cap. */
export const DATASET_ROW_COUNT = 30;

const HITS = [
  ...Array.from({ length: DATASET_ROW_COUNT - 1 }, (_, i) => datasetHit(i)),
  SPARSE_DATASET,
  COMPUTATIONAL_TOOL_HIT,
  SAMPLE_HIT,
  DATA_COLLECTION_HIT,
];

const typeCount = (type: string) =>
  HITS.filter(hit => hit['@type'] === type).length;

/** The `/query` response: every tab's records plus the `@type` facet. */
export const SEARCH_TABLES_RESPONSE = {
  total: HITS.length,
  hits: HITS,
  facets: {
    '@type': {
      _type: 'terms',
      terms: ['Dataset', 'ComputationalTool', 'Sample', 'DataCollection'].map(
        term => ({ term, count: typeCount(term) }),
      ),
      total: HITS.length,
      other: 0,
      missing: 0,
    },
  },
};

export const METADATA_RESPONSE = {
  build_date: '2026-06-17T00:00:00Z',
  src: {},
};

/** Each tab's table: how to reach it, and its accessible name. */
export const SEARCH_TABLE_TABS = [
  {
    id: 'd',
    tab: /^Datasets/,
    viewMode: true,
    label: 'Dataset search results',
  },
  {
    id: 'ct',
    tab: /^Tools/,
    viewMode: true,
    label: 'Computational tool search results',
  },
  {
    id: 's',
    tab: /^Samples/,
    viewMode: false,
    label: 'Sample search results',
  },
  {
    id: 'dc',
    tab: /^Data Collections/,
    viewMode: true,
    label: 'Data collection search results',
  },
] as const;
