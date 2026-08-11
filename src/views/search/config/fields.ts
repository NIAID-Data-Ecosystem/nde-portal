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

// Field list for the DataCollection tab, covering both its table and its card
// view. Kept as a single array on purpose: an identical field list means the
// query key does not change between view modes, so toggling Table <-> Card
// never triggers a refetch and always matches the tabs-controller prefetch.
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
  // Card header and access badges
  'alternateName',
  'author',
  'isAccessibleForFree',
  // Card metadata pills, in addition to the column fields above
  'funding',
  'license',
  'measurementTechnique',
  'usageInfo',
  'variableMeasured',
];
