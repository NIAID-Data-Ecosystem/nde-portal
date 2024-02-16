// Type of resource.
export type APIResourceType = 'Dataset' | 'ResourceCatalog';
// | 'ComputationalTool'
// | 'Software'
// | 'ScholarlyArticle'
// | 'Other';
export type DisplayResourceType =
  | 'Dataset'
  | 'Resource Catalog'
  | 'Computational Tool'
  | 'Software'
  | 'Scholarly Article'
  | 'Other';

// Format the resource type for display.
export const formatResourceTypeForDisplay = (
  str: APIResourceType,
): DisplayResourceType => {
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

// Format the dataset type(if changed for display) to the @type accepted in the API.
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
  } else {
    return str;
  }
};
