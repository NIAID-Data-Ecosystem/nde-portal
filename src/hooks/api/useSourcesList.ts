import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  SHOW_DATA_COLLECTIONS_TAB,
  SHOW_SAMPLES_TAB,
} from 'src/utils/feature-flags';
import { getFundedByNIAID } from 'src/utils/helpers';
import {
  OR_FILTER_KEY,
  queryFilterObject2String,
} from 'src/views/search/components/filters';
import { getTabIdFromResourceType } from 'src/views/search/config/tabs';

import { fetchMetadata } from './helpers';
import { Metadata, MetadataSource } from './types';
import { useResourceCatalogs } from './useResourceCatalogs';

/**
 * Default fields fetched for standalone resource catalogs so they render
 * alongside the metadata-derived sources in the sources list/table. Callers can
 * request additional fields via `useSourcesList`'s `resourceCatalogFields` arg.
 */
const RESOURCE_CATALOG_FIELDS = [
  '_id',
  '@type',
  'abstract',
  'collectionType',
  'conditionsOfAccess',
  'description',
  'genre',
  'name',
  'url',
];

export type SourceType =
  | 'Dataset Repository'
  | 'Computational Tool Repository'
  | 'Sample Repository'
  | 'Data Repository'
  | 'Resource Catalog';

export const getTabIdFromSourceType = (
  sourceType: SourceType,
): string | undefined => {
  switch (sourceType) {
    case 'Dataset Repository':
      return getTabIdFromResourceType('Dataset');
    case 'Computational Tool Repository':
      return getTabIdFromResourceType('ComputationalTool');
    case 'Sample Repository':
      return getTabIdFromResourceType('Sample');
    case 'Data Repository':
      return getTabIdFromResourceType('DataCollection');
    case 'Resource Catalog':
      return undefined; // No specific tab for resource catalogs
    default:
      return undefined;
  }
};

export type Source = Omit<MetadataSource['sourceInfo'], 'type'> & {
  type: SourceType[];
  /** Identifier of the associated resource catalog, parsed from `sameAs`. */
  resourceCatalogIdentifier?: string;
  /** Link to a `/search` scoped to this source's resources. */
  searchURL?: string;
  /**
   * Number of resources harvested from this source (`MetadataSource.stats`).
   * Absent for resource catalogs, which carry no harvest stats.
   */
  numberOfRecords?: number;
  /** Whether the source is funded by NIAID (derived from its name). */
  isNiaidFunded?: boolean;
  /**
   * Latest release date, normalized to ISO from `MetadataSource.version`.
   * Absent for resource catalogs.
   */
  dateModified?: string;
};

/**
 * A "Data Repository" / "Sample Repository" source is hidden unless its
 * corresponding search tab is enabled via feature flag.
 */
const isHiddenSourceType = (source: Source): boolean =>
  (!SHOW_DATA_COLLECTIONS_TAB && source.type.includes('Data Repository')) ||
  (!SHOW_SAMPLES_TAB && source.type.includes('Sample Repository'));

/**
 * The portal pathname that renders a single resource catalog record, e.g.
 * `/resources?id=dde_8b9a4aa0d78d0659` (see `src/pages/resources.tsx`).
 */
const RESOURCE_CATALOG_PATHNAME = '/resources';

/**
 * Whether a pathname is the resource catalog page.
 */
const isResourceCatalogPathname = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '').toLowerCase() === RESOURCE_CATALOG_PATHNAME;

/**
 * Every hostname this portal is deployed under (see the `BASE_URL` in each
 * `.env.*` file).
 */
const KNOWN_PORTAL_HOSTNAMES = [
  'data.niaid.nih.gov', // production
  'data-staging.niaid.nih.gov', // staging
  'nde-dev.biothings.io', // dev
];

/**
 * `KNOWN_PORTAL_HOSTNAMES` plus the running deployment's own hostname, from
 * `NEXT_PUBLIC_BASE_URL`.
 */
const PORTAL_HOSTNAMES = new Set(
  [
    ...KNOWN_PORTAL_HOSTNAMES,
    (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_BASE_URL || '').hostname;
      } catch {
        return undefined;
      }
    })(),
  ]
    .filter((hostname): hostname is string => !!hostname)
    .map(hostname => hostname.toLowerCase()),
);

/**
 * Parse the `resourceCatalogIdentifier` from a `sameAs` value that points to a
 * resource catalog, e.g. `https://data.niaid.nih.gov/resources?id=dde_8b9a4aa0d78d0659`
 * returns `dde_8b9a4aa0d78d0659`. Accepts a string or an array of `sameAs`
 * values and returns the first identifier found.
 *
 * `sameAs` is free-form, source-supplied data, so an unrelated link that merely
 * carries an `id` query param must not be mistaken for a catalog link. A value
 * qualifies only in these two forms:
 *   - a root-relative catalog link — `/resources?id=…`
 *   - an absolute catalog link on one of the portal's own hostnames
 *     (`PORTAL_HOSTNAMES`) — `https://data.niaid.nih.gov/resources?id=…`
 * The `/resources` pathname is required either way: a portal hostname alone is
 * not enough, so `https://data.niaid.nih.gov/other?id=x` does not qualify.
 */
export const getResourceCatalogIdentifier = (
  sameAs?: string | string[],
): string | undefined => {
  if (!sameAs) return undefined;
  const values = Array.isArray(sameAs) ? sameAs : [sameAs];

  for (const value of values) {
    // Guard each element: `sameAs` comes from upstream metadata, so an array
    // can hold `null`/non-strings despite the declared `string[]`.
    if (typeof value !== 'string' || !value.trim()) continue;

    const href = value.trim();
    let searchParams: URLSearchParams;

    // One leading slash means root-relative, which is ours by definition.
    if (href.startsWith('/') && !href.startsWith('//')) {
      // Split the path off the query
      const pathAndQuery = href.split('#')[0];
      const queryIndex = pathAndQuery.indexOf('?');
      const pathname =
        queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);

      // Relative values still have to point at the catalog page.
      if (!isResourceCatalogPathname(pathname)) continue;
      searchParams = new URLSearchParams(
        queryIndex === -1 ? '' : pathAndQuery.slice(queryIndex + 1),
      );
    } else {
      let url: URL;
      try {
        url = new URL(href);
      } catch {
        continue; // Neither an absolute URL nor a root-relative path.
      }

      // Compare hostnames.
      if (!PORTAL_HOSTNAMES.has(url.hostname.toLowerCase())) continue;

      // The path is required here too. Matching the whole pathname rather than
      // a substring is what keeps `https://x.org/human-resources?id=1` and
      // `https://x.org/a?q=resources&id=1` out.
      if (!isResourceCatalogPathname(url.pathname)) continue;
      searchParams = url.searchParams;
    }

    // `URLSearchParams` percent-decodes for us; ignore a present-but-empty `id`.
    const id = searchParams.get('id')?.trim();
    if (id) return id;
  }
  return undefined;
};

/**
 * Normalize a `MetadataSource.version` into an ISO date string. The version is
 * either already ISO (contains `T`), a `YYYYMMDD` integer string, or absent.
 * Returns `''` when it can't be interpreted as a date.
 */
const normalizeDateModified = (version?: string): string => {
  if (!version) return '';
  if (version.includes('T')) return version;
  if (/^\d+$/.test(version)) {
    return `${version.substring(0, 4)}-${version.substring(
      4,
      6,
    )}-${version.substring(6, 8)}T00:00:00`;
  }
  return '';
};

export function useSourcesList(
  options: any = {},
  resourceCatalogFields: string[] = [], // [TO DO]: Remove once resource catalogs are served from the metadata endpoint
) {
  const metadataQuery = useQuery<Metadata | undefined, Error, Source[]>({
    queryKey: ['metadata'],
    queryFn: async () => await fetchMetadata(),
    select: (data: Metadata | undefined) => {
      const sources = data?.src || {};
      const repositories = Object.entries(sources)
        .filter(
          ([, source]) =>
            source?.sourceInfo &&
            !Array.isArray(source.sourceInfo) &&
            source.sourceInfo.identifier,
        )
        .map(([srcKey, metadataSource]) => {
          const { sourceInfo, stats, version } = metadataSource;
          const {
            _id,
            identifier,
            name,
            collectionType,
            sameAs,
            type: sourceInfoType,
          } = sourceInfo || {};
          // use type if available, otherwise fallback to collectionType
          const sourceType = sourceInfoType || collectionType;

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

          // `stats` is keyed by the source's src key; fall back to the single
          // value it usually holds.
          const numberOfRecords =
            stats?.[srcKey] ?? Object.values(stats ?? {})[0];

          const source = {
            ...sourceInfo,
            // Use the resource catalog identifier as the source `_id` if present,
            // otherwise fall back to the metadata `_id` or the `identifier`.
            _id: resourceCatalogIdentifier || _id || '',
            identifier,
            key: `${identifier}-${name}-${type.join(',')}`,
            type: type as SourceType[],
            name: resourceName,
            resourceCatalogIdentifier,
            numberOfRecords,
            isNiaidFunded: getFundedByNIAID(name || ''),
            dateModified: normalizeDateModified(version),
          } as Source;

          // Link to a `/search` scoped to this source's resources.
          return { ...source, searchURL: buildSearchURL(source) };
        });

      return repositories as Source[];
    },
    ...options,
  });

  // [TO DO] TEMPORARY: sources and resource catalogs live on separate endpoints. Until
  // they are consolidated onto the metadata endpoint `fetchMetadata` uses, fetch
  // resource catalogs separately and merge in any the metadata sources list
  // doesn't already represent (via `resourceCatalogIdentifier`). When the data
  // is consolidated this whole block — and the `useResourceCatalogs` call — can
  // be removed and `metadataQuery` returned directly.
  const resourceCatalogsQuery = useResourceCatalogs({
    // Callers can request extra fields (e.g. `creativeWorkStatus`) on top of
    // the defaults; dedupe so a repeated field isn't fetched twice.
    fields: Array.from(
      new Set([...RESOURCE_CATALOG_FIELDS, ...resourceCatalogFields]),
    ),
  });

  const data = useMemo<Source[]>(() => {
    const sources = metadataQuery.data || [];
    const catalogs = resourceCatalogsQuery.data || [];

    // Catalog identifiers already represented by a metadata source.
    const existingCatalogIds = new Set(
      sources
        .map(source => source.resourceCatalogIdentifier)
        .filter((id): id is string => !!id),
    );

    const additions = catalogs
      .filter(catalog => catalog._id && !existingCatalogIds.has(catalog._id))
      .map(resourceCatalogToSource);

    return [...sources, ...additions].filter(
      source => !isHiddenSourceType(source),
    );
  }, [metadataQuery.data, resourceCatalogsQuery.data]);

  return {
    ...metadataQuery,
    data,
    isLoading: metadataQuery.isLoading || resourceCatalogsQuery.isLoading,
    error: metadataQuery.error || resourceCatalogsQuery.error,
  };
}

/**
 * Map a resource catalog record (from the search API) into a `Source` so it can
 * sit alongside the metadata-derived sources. TEMPORARY: only needed until
 * resource catalogs are served from the metadata endpoint.
 */
const resourceCatalogToSource = (catalog: FormattedResource): Source => {
  const id = catalog._id || '';
  return {
    ...catalog,
    _id: id,
    identifier: id,
    name: catalog.name || id,
    type: ['Resource Catalog'],
    isNiaidFunded: getFundedByNIAID(catalog.name || ''),
    // A standalone catalog is its own record, so scope search to it by `_id`.
    searchURL: buildResourceCatalogSearchURL(id),
    // A search-API catalog record has no `schema`/`metadata_completeness`/`stats`
    // that the metadata `Source` shape carries (so `numberOfRecords` and
    // `dateModified` stay undefined here), hence the widening cast.
  } as unknown as Source;
};

/**
 * Build a `/search` link scoped to a single resource catalog record by `_id`,
 * e.g. `/search?q=&filters=(_id:("dde_42e839db86d4166d"))&applyDefaultDate=false`.
 */
export const buildResourceCatalogSearchURL = (id: string): string => {
  if (!id) return '';
  const filters = queryFilterObject2String({ _id: [id] });
  const params = new URLSearchParams();
  params.set('q', '');
  if (filters) params.set('filters', filters);
  params.set('applyDefaultDate', 'false');
  return `/search?${params.toString()}`;
};

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
  const tabId = getTabIdFromSourceType(types[0]);
  if (tabId) params.set('tab', tabId);

  return `/search?${params.toString()}`;
};
