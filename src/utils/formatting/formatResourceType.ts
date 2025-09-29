export type APIResourceType =
  | 'Dataset'
  | 'ResourceCatalog'
  | 'ComputationalTool';

export type CollectionType =
  | 'Knowledge Base'
  | 'Ontology'
  | 'Terminology'
  | 'Database'
  | 'Dataset'
  | 'Metadata Catalog'
  | 'Archive'
  | 'Cloud Ecosystem'
  | 'Corpus'
  | 'Repository'
  | 'Controlled Vocabulary'
  | 'Registry'
  | 'Data Dictionary'
  | 'Data Mart'
  | 'Data Warehouse'
  | 'Data Store'
  | 'Data Collection'
  | 'Portal';

// Combined type for all possible resource types in the UI
export type AllResourceType = APIResourceType;

export type DisplayResourceType =
  | 'Dataset'
  | 'Resource Catalog'
  | 'Computational Tool'
  | 'Software'
  | 'Scholarly Article'
  | 'Other';

// Format API resource types for display
export const formatAPIResourceTypeForDisplay = (
  str: APIResourceType | undefined,
): DisplayResourceType => {
  if (!str) {
    return 'Other';
  }

  if (str.toLowerCase() === 'dataset') {
    return 'Dataset';
  } else if (str.toLowerCase() === 'resourcecatalog') {
    return 'Resource Catalog';
  } else if (str.toLowerCase() === 'computationaltool') {
    return 'Computational Tool';
  } else {
    return 'Other';
  }
};

// Format the dataset type (if changed for display) to the @type accepted in the API
export const formatResourceTypeForAPI = (
  str: string,
): APIResourceType | string => {
  if (str.toLowerCase() === 'dataset') {
    return 'Dataset';
  } else if (
    str.toLowerCase() === 'resourcecatalog' ||
    str.toLowerCase() === 'resource catalog'
  ) {
    return 'ResourceCatalog';
  } else if (
    str.toLowerCase() === 'computationaltool' ||
    str.toLowerCase() === 'computational tool'
  ) {
    return 'ComputationalTool';
  } else {
    return str;
  }
};

// Type guard to check if a type is an API resource type
export const isAPIResourceType = (type: string): type is APIResourceType => {
  return ['Dataset', 'ResourceCatalog', 'ComputationalTool'].includes(type);
};
