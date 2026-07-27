// Fields requested from the API for each tab type.
//
// Kept in a shared config so that both the results-list (which uses them for
// live queries) and the search-results-tabs-controller (which uses them to
// build prefetch query keys) always reference the same arrays.

// Fields required by the Dataset / ComputationalTool card view.
export const RESULT_FIELDS = [
  '_meta',
  '@type',
  'alternateName',
  'applicationCategory',
  'author',
  'availableOnDevice',
  'conditionsOfAccess',
  'date',
  'description',
  'doi',
  'featureList',
  'funding',
  'healthCondition',
  'includedInDataCatalog',
  'infectiousAgent',
  'input',
  'isAccessibleForFree',
  'license',
  'measurementTechnique',
  'name',
  'operatingSystem',
  'output',
  'programmingLanguage',
  'sample',
  'sdPublisher',
  'softwareHelp',
  'softwareRequirements',
  'softwareVersion',
  'species',
  'topicCategory',
  'url',
  'usageInfo',
  'variableMeasured',
];

// Minimal field list for the Sample table.
export const SAMPLE_FIELDS = [
  // Used by toRow() for identifier resolution and catalog URL
  '_meta',
  '@type',
  '_id',
  'url',
  'includedInDataCatalog',
  'funding',
  // Column fields
  'identifier',
  'alternateIdentifier',
  'name',
  'date',
  'description',
  'conditionsOfAccess',
  'creativeWorkStatus',
  'healthCondition',
  'infectiousAgent',
  'species',
  'variableMeasured',
  'measurementTechnique',
  'anatomicalStructure',
  'anatomicalSystem',
  'sampleType',
  'sampleAvailability',
  'sampleQuantity',
  'instrument',
  'sex',
  'developmentalStage',
  'associatedGenotype',
  'associatedPhenotype',
  'cellType',
  'locationOfOrigin',
  'itemLocation',
];

// Field list for the DataCollection tab.
//
// This is a superset serving BOTH the DataCollection table and the
// DataCollection card view. Keeping a single array means the fetch/prefetch
// cache key is identical across view modes, so toggling Table <-> Card does
// not trigger a refetch and stays in sync with the tabs-controller prefetch
// (which imports this same constant).
export const DATA_COLLECTION_FIELDS = [
  // Used by toRow() for catalog URL
  '_meta',
  '@type',
  'url',
  'includedInDataCatalog',
  // Table column fields
  'name',
  'about',
  'conditionsOfAccess',
  'date',
  'description',
  'healthCondition',
  'infectiousAgent',
  'species',
  'topicCategory',
  'isBasedOn',
  'collectionSize',
  'exampleOfWork',
  // Card-only fields (header, badges, category pills)
  'alternateName',
  'author',
  'isAccessibleForFree',
  'operatingSystem',
  'applicationCategory',
  'programmingLanguage',
  // Card-only fields (MetadataAccordion parity)
  'funding',
  'license',
  'measurementTechnique',
  'variableMeasured',
  'usageInfo',
  'featureList',
  'availableOnDevice',
  'input',
  'output',
  'softwareHelp',
  'softwareRequirements',
  'softwareVersion',
];
