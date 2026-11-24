import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { FormattedResource, SourceOrganization } from 'src/utils/api/types';
import { SHOW_PROGRAM_RESOURCE_UI } from 'src/utils/feature-flags';

import { ProgramVariant } from './types';

export const PROGRAM_VARIANT_LABELS: Record<ProgramVariant, string> = {
  resource: 'Program Resource',
  'info-and-resource': 'Program Info and Resource',
  info: 'Program Info',
};

export const PROGRAM_COLLECTIONS_SAMEAS_STUB =
  'https://data.niaid.nih.gov/program-collections#';

// Determines whether a record's sourceOrganization should be treated as
// "present" for the Program Resource banner override (i.e. not null/undefined
// and, if an array, non-empty).
export const hasSourceOrganization = (
  sourceOrganization?: SourceOrganization[] | SourceOrganization | null,
): boolean => {
  if (sourceOrganization == null) return false;
  if (Array.isArray(sourceOrganization)) {
    return sourceOrganization.length > 0;
  }
  return true;
};

// Returns the program banner variant for a ResourceCatalog with a
// sourceOrganization, or undefined when the default treatment applies.
export const getProgramResourceVariant = (
  resource?: Partial<
    Pick<FormattedResource, '@type' | 'sourceOrganization'>
  > & { sameAs?: string | string[] | null },
): ProgramVariant | undefined => {
  if (
    !SHOW_PROGRAM_RESOURCE_UI ||
    resource?.['@type'] !== 'ResourceCatalog' ||
    !hasSourceOrganization(resource.sourceOrganization)
  ) {
    return undefined;
  }
  // sameAs comes from upstream metadata, so it may be a single value or a list.
  const sameAs = resource.sameAs == null ? [] : [resource.sameAs].flat();
  const linksToProgramCollection = sameAs.some(
    url =>
      typeof url === 'string' &&
      url.startsWith(PROGRAM_COLLECTIONS_SAMEAS_STUB),
  );
  return linksToProgramCollection ? 'info-and-resource' : 'resource';
};

// `label` fills the skewed type label; `banner` is the strip behind it.
export const getTypeColors = (
  type?: string,
  { isRetired = false, isProgram = false } = {},
) => {
  // Retired catalogs and program resources override the per-type colours.
  if (isRetired) return { label: 'gray.600', banner: 'gray.300' };
  if (isProgram) return { label: 'cyan.900', banner: 'cyan.600' };

  const t = type?.toLowerCase() ?? '';
  if (t === 'dataset') return { label: 'info', banner: 'niaid.500' };
  if (t === 'resourcecatalog') {
    return { label: 'primary.500', banner: 'primary.700' };
  }
  if (t.includes('tool') || t.includes('software')) {
    return { label: 'primary.800', banner: 'niaid.500' };
  }
  if (t === 'datacollection') return { label: 'blue.800', banner: 'blue.300' };
  if (t === 'disease') return { label: 'purple.600', banner: 'purple.800' };
  return { label: 'niaid.500', banner: 'niaid.500' };
};

const { abstract, description } = SCHEMA_DEFINITIONS['@type'] as {
  abstract?: Record<string, string>;
  description?: Record<string, string>;
};

// Tooltip copy for a resource type, if the schema defines any.
export const getTypeDefinition = (type?: string) =>
  type ? abstract?.[type] || description?.[type] : undefined;
