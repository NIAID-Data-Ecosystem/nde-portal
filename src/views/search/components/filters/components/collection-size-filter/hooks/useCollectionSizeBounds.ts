import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { CollectionSize, FormattedResource } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import {
  COLLECTION_SIZE_UNIT_FIELD,
  COLLECTION_SIZE_VALUE_FIELD,
} from 'src/views/search/config/collection-size';
import { queryFilterObject2String } from '../../../utils/query-string';
import { CollectionSizeBounds, withoutRangeFilter } from '../utils';

export interface UseCollectionSizeBoundsParams {
  q: string;
  extra_filter?: string;
  use_ai_search?: string;
  advancedSearch?: string;
  /** Indexed spellings of the selected unit, if any. */
  unitTerms?: string[];
}

/** Only records carrying a numeric collection size can bound the range. */
const HAS_VALUE_FILTER = `_exists_:${COLLECTION_SIZE_VALUE_FIELD}`;

/** Every `minValue` on a record, which may hold several collection sizes. */
const collectionSizeValues = (resource?: FormattedResource): number[] => {
  const collectionSize = resource?.collectionSize as
    | CollectionSize
    | CollectionSize[]
    | undefined
    | null;

  if (!collectionSize) return [];

  const entries = Array.isArray(collectionSize)
    ? collectionSize
    : [collectionSize];

  return entries
    .map(entry => entry?.minValue)
    .filter((value): value is number => typeof value === 'number');
};

/**
 * Scopes the probes to the same result set the filter is shown against, minus
 * the range itself (see `withoutRangeFilter`). The unit selection is kept, so
 * the bounds describe the unit actually being filtered on.
 */
export const buildBoundsFilter = ({
  extra_filter = '',
  unitTerms = [],
}: Pick<
  UseCollectionSizeBoundsParams,
  'extra_filter' | 'unitTerms'
>): string => {
  const withoutRange = withoutRangeFilter(extra_filter);

  // The unit may not be applied yet: the dropdown probes bounds for the unit
  // the user is looking at, not only for the one already in the URL.
  if (unitTerms.length > 0) {
    withoutRange[COLLECTION_SIZE_UNIT_FIELD] = unitTerms;
  }

  const scoped = queryFilterObject2String(withoutRange) || '';

  return scoped ? `${scoped} AND ${HAS_VALUE_FILTER}` : HAS_VALUE_FILTER;
};

/**
 * Smallest and largest collection size available under the current query.
 *
 * `collectionSize.minValue` is not aggregated (see the filter config), so the
 * bounds are probed with two sorted single-record requests. Elasticsearch sorts
 * a multi-valued field by its lowest value ascending and its highest
 * descending, so each hit still has to be reduced across its own
 * `collectionSize` array.
 *
 * Used for the range inputs' placeholders and to clamp what gets applied.
 */
export const useCollectionSizeBounds = (
  params: UseCollectionSizeBoundsParams,
  options?: { enabled?: boolean },
) => {
  const {
    q,
    extra_filter = '',
    use_ai_search = 'false',
    advancedSearch,
    unitTerms = [],
  } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);
  const boundsFilter = buildBoundsFilter({ extra_filter, unitTerms });

  // `null` rather than `undefined` for "no bounds": react-query rejects an
  // undefined query result and fails the query instead of caching it.
  return useQuery<CollectionSizeBounds | null>({
    queryKey: [
      'collection-size-bounds',
      encodedQ,
      use_ai_search,
      advancedSearch,
      boundsFilter,
    ],
    queryFn: async () => {
      const probe = (sort: string) =>
        fetchSearchResults({
          q: encodedQ,
          extra_filter: boundsFilter,
          fields: ['collectionSize'],
          size: 1,
          sort,
          use_ai_search,
        });

      const [lowest, highest] = await Promise.all([
        probe(COLLECTION_SIZE_VALUE_FIELD),
        probe(`-${COLLECTION_SIZE_VALUE_FIELD}`),
      ]);

      const lowestValues = collectionSizeValues(lowest?.results?.[0]);
      const highestValues = collectionSizeValues(highest?.results?.[0]);

      if (lowestValues.length === 0 || highestValues.length === 0) {
        return null;
      }

      return {
        min: Math.min(...lowestValues),
        max: Math.max(...highestValues),
      };
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
