import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';

// Helper function to get repository image path based on repository name
export const getSourceImagePath = (
  name: FormattedResource['IncludedInDataCatalog']['name'],
) => {
  if (!name) {
    return null;
  }
  const path = '/assets/resources/';
  const identifier = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '');

  return path + identifier + '.png';
};

// Take one or more catalog sources and return them with their resolved image/logo path included.
export const formatSourcesWithLogos = (
  sources: FormattedResource['includedInDataCatalog'],
) => {
  const sources2Array = sources
    ? Array.isArray(sources)
      ? sources
      : [sources]
    : [];
  return sources2Array.map(source => ({
    ...source,
    logo: getSourceImagePath(source.name),
  }));
};

// Get link out URL for source logo
export const getSourceLogoLinkOut = (source: IncludedInDataCatalog) => {
  return (
    (Array.isArray(source?.archivedAt)
      ? source?.archivedAt[0]
      : source?.archivedAt) ?? ''
  );
};

// If resource is part of a catalog, only show DDE as source
export const getDDECatalog = (
  catalog: FormattedResource['includedInDataCatalog'],
) => {
  if (Array.isArray(catalog)) {
    return catalog.find(src => src.name === 'Data Discovery Engine') || null;
  }
  return catalog?.name === 'Data Discovery Engine' ? catalog : null;
};
