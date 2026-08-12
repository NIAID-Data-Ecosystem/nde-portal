import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';

/** Extra fields hydrated for each saved resource, keyed by `_id`. */
export interface SavedResourceAdditionalMetadata {
  /** `@type` values, e.g. 'Dataset'. */
  type?: APIResourceType;
  /** `includedInDataCatalog.name` values (the resource's source(s)). */
  source?: string[];
  /** ISO `dateModified` timestamp. */
  dateModified?: string;
}

const FIELDS = ['_id', '@type', 'includedInDataCatalog.name', 'dateModified'];

const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

// Pull catalog names out of either the nested (`includedInDataCatalog: {name}`)
// or dotfield (`'includedInDataCatalog.name'`) shapes the API may return.
const getSourceNames = (hit: any): string[] => {
  const catalogs = toArray(
    hit?.includedInDataCatalog ?? hit?.['includedInDataCatalog.name'],
  );
  return catalogs
    .map((catalog: any) =>
      typeof catalog === 'string' ? catalog : catalog?.name,
    )
    .filter(Boolean);
};

/** Reduce the bulk-query hits into a map of `_id` -> metadata. */
const formatMetadata = (
  hits: any[],
): Record<string, SavedResourceAdditionalMetadata> => {
  const map: Record<string, SavedResourceAdditionalMetadata> = {};
  hits.forEach(hit => {
    if (!hit || hit.notfound || !hit._id) return;
    map[hit._id] = {
      type: hit['@type'],
      source: getSourceNames(hit),
      dateModified: hit.dateModified || '',
    };
  });
  return map;
};

/**
 * Fetches type / source / dateModified for a list of saved resource ids in a
 * single bulk `_id` query, returning a map keyed by id.
 */
export function useBatchResourcesData(ids: string[]) {
  // Sort so the query key (and request) is stable regardless of saved order.
  const sortedIds = [...ids].sort();
  return useQuery<Record<string, SavedResourceAdditionalMetadata>, Error>({
    queryKey: ['saved-resources-metadata', sortedIds],
    queryFn: async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('API url undefined');
      }
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        {
          q: sortedIds.join(','),
          scopes: '_id',
          fields: FIELDS.join(','),
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      return formatMetadata(Array.isArray(data) ? data : data?.hits ?? []);
    },
    enabled: sortedIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
