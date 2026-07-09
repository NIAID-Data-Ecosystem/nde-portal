import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata, MetadataSource } from './types';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';
import {
  OR_FILTER_KEY,
  queryFilterObject2String,
} from 'src/views/search/components/filters';

export type SourceType =
  | 'Dataset Repository'
  | 'Computational Tool Repository'
  | 'Sample Repository'
  | 'Data Repository'
  | 'Resource Catalog';

export type Source = Omit<MetadataSource['sourceInfo'], 'type'> & {
  type: SourceType[];
  /** Identifier of the associated resource catalog, parsed from `sameAs`. */
  resourceCatalogIdentifier?: string;
  /** Link to a `/search` scoped to this source's resources. */
  searchURL?: string;
};

/**
 * Parse the `resourceCatalogIdentifier` from a `sameAs` value that points to a
 * resource catalog, e.g. `https://data.niaid.nih.gov/resources?id=dde_8b9a4aa0d78d0659`
 * returns `dde_8b9a4aa0d78d0659`. Only the `id` query param is used, so the base
 * URL is free to change. Accepts a string or an array of `sameAs` values.
 */
const getResourceCatalogIdentifier = (
  sameAs?: string | string[],
): string | undefined => {
  if (!sameAs) return undefined;
  const values = Array.isArray(sameAs) ? sameAs : [sameAs];
  for (const value of values) {
    if (!value) continue;
    try {
      const id = new URL(value).searchParams.get('id');
      if (id) return id;
    } catch {
      // Not a fully-qualified URL — fall back to matching the `id` query param.
      const match = value.match(/[?&]id=([^&#]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
  }
  return undefined;
};

export function useSourcesList(options: any = {}) {
  return useQuery<Metadata | undefined, Error, Source[]>({
    queryKey: ['metadata'],
    queryFn: async () => await fetchMetadata(),
    select: (data: Metadata | undefined) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources)
        .filter(
          source =>
            source?.sourceInfo &&
            !Array.isArray(source.sourceInfo) &&
            source.sourceInfo.identifier,
        )
        .map(({ sourceInfo }) => {
          const {
            identifier,
            name,
            collectionType,
            sameAs,
            type: sourceInfoType,
          } = sourceInfo || {};
          const sourceType = sourceInfoType || collectionType;
          if (identifier !== name) {
            console.log('id', identifier, 'name,', name);
          }
          // use type if available, otherwise fallback to collectionType
          const type = (
            Array.isArray(sourceType)
              ? sourceType
              : sourceType
              ? [sourceType]
              : []
          ).sort((a, b) => a.localeCompare(b));

          const resourceName = name || identifier || '';

          // A `sameAs` link pointing to a resource catalog marks this source as
          // being available in a catalog.
          const resourceCatalogIdentifier =
            getResourceCatalogIdentifier(sameAs);
          if (resourceCatalogIdentifier && !type.includes('Resource Catalog')) {
            type.push('Resource Catalog');
          }

          const source = {
            ...sourceInfo,
            type: type as SourceType[],
            _id: `${identifier}-${name}-${type.join(',')}`,
            name: resourceName,
            resourceCatalogIdentifier,
          } as Source;

          // Link to a `/search` scoped to this source's resources.
          return { ...source, searchURL: buildSearchURL(source) };
        });

      return repositories as Source[];
    },
    ...options,
  });
}

/**
 * Build a `/search` link scoped to a source's resources.
 *
 * Resources are matched by `includedInDataCatalog.name` (the source
 * identifier). When the source maps to a resource catalog, the catalog record
 * itself is OR-ed in by `_id`, mirroring the API `extra_filter`:
 *   includedInDataCatalog.name:"accessclinicaldata@NIAID" OR _id:dde_42e839db86d4166d
 * The matching tab is preselected from the source's repository type.
 */
export const buildSearchURL = (item: Source): string => {
  // `includedInDataCatalog.name` is stored as the source identifier
  // (e.g. "accessclinicaldata@NIAID"), falling back to the display name.
  const catalogName = item.identifier || item.name || '';
  if (!catalogName) return '';
  const types = item.type || [];

  // When the source maps to a resource catalog, OR-in the catalog record by
  // `_id` via an `_or` group (a cross-field OR the filter helpers round-trip);
  // otherwise just scope by catalog name.
  const filters = item.resourceCatalogIdentifier
    ? queryFilterObject2String({
        [OR_FILTER_KEY]: [
          { 'includedInDataCatalog.name': [catalogName] },
          { _id: [item.resourceCatalogIdentifier] },
        ],
      })
    : queryFilterObject2String({ 'includedInDataCatalog.name': [catalogName] });

  const params = new URLSearchParams();
  params.set('q', '');
  if (filters) params.set('filters', filters);
  params.set('applyDefaultDate', 'false');

  // Preselect the tab based on the source's repository type.
  if (types.includes('Computational Tool Repository')) {
    const tab = getTabIdFromTypeLabel('ComputationalTool');
    if (tab) params.set('tab', tab);
  } else if (types.includes('Sample Repository')) {
    const tab = getTabIdFromTypeLabel('Sample');
    if (tab) params.set('tab', tab);
  }

  return `/search?${params.toString()}`;
};
