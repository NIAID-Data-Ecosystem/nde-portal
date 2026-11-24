/**
 * Repository matcher fixtures for layout specs: realistic, deliberately mixed
 * content (short and long names, prose, many and few tags, long unbreakable
 * URLs, missing values) so column sizing is tested against the kinds of data
 * production serves, without the 2.5 MB live payload.
 */

const LONG_DESCRIPTION =
  'A curated repository of host-pathogen interaction data spanning genomic, transcriptomic and proteomic studies. Records are deposited by investigators and reviewed by curators before release, and each dataset is linked to standardized ontology terms for pathogens, hosts and measurement techniques so that it can be discovered alongside related studies across the ecosystem. Bulk download and programmatic access are available.';

const SHORT_DESCRIPTION = 'Sequence read archive.';

const LONG_LICENSE =
  'https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en/with/an/unusually/long/path/segment';

const term = (name: string) => ({ '@type': 'DefinedTerm', name });

const MANY_SPECIES = [
  'Homo sapiens',
  'Mus musculus',
  'Escherichia coli (strain B / BL21-DE3)',
  'Rattus norvegicus',
  'Macaca mulatta',
  'Danio rerio',
  'Drosophila melanogaster',
  'Saccharomyces cerevisiae S288C',
  'Arabidopsis thaliana',
  'Caenorhabditis elegans',
  'Sus scrofa',
  'Gallus gallus',
  'Bos taurus',
  'Canis lupus familiaris',
  'Mustela putorius furo',
  'Plasmodium falciparum 3D7',
  'Mycobacterium tuberculosis H37Rv',
  'Staphylococcus aureus subsp. aureus NCTC 8325',
  'Influenza A virus (A/Puerto Rico/8/1934(H1N1))',
  'Severe acute respiratory syndrome coronavirus 2',
];

const NAMES = [
  'GEO',
  'Immunology Database and Analysis Portal (ImmPort)',
  'AccessClinicalData@NIAID (ACD@NIAID)',
  'BV-BRC',
  'The Very Long Name Of A Repository That Wraps Onto Several Lines In Most Layouts',
];

/** A ResourceCatalog hit, as served by `**​/query*`. */
const catalog = (i: number) => ({
  _id: `layout-catalog-${i}`,
  '@type': 'ResourceCatalog',
  name: `${NAMES[i % NAMES.length]} ${i}`,
  description: i % 3 === 0 ? SHORT_DESCRIPTION : LONG_DESCRIPTION,
  url: `/resources/layout-catalog-${i}`,
  creativeWorkStatus: 'Accepting Data',
  genre: i % 2 ? ['IID'] : ['Generalist', 'IID'],
  conditionsOfAccess: ['Open', 'Controlled', 'Registered'][i % 3],
  healthCondition: i % 4 === 0 ? [] : [term('Influenza'), term('COVID-19')],
  infectiousAgent: [term('Influenza A virus'), term('SARS-CoV-2')],
  species: i % 5 === 0 ? MANY_SPECIES.map(term) : [term('Homo sapiens')],
  measurementTechnique: [term('Sequencing'), term('Mass spectrometry')],
  topicCategory: i % 6 === 0 ? [] : [term('Genomics'), term('Immunology')],
  temporalCoverage:
    i % 2
      ? [{ startDate: '2020-01-01', endDate: '2024-12-31' }]
      : [{ name: 'Current' }],
  license: i % 3 === 0 ? LONG_LICENSE : i % 3 === 1 ? 'CC-BY-4.0' : undefined,
});

export const ROW_COUNT = 40;

export const QUERY_RESPONSE = {
  hits: Array.from({ length: ROW_COUNT }, (_, i) => catalog(i)),
  total: ROW_COUNT,
  facets: null,
};

export const METADATA_RESPONSE = {
  build_date: '2026-06-17T00:00:00Z',
  src: {},
};
