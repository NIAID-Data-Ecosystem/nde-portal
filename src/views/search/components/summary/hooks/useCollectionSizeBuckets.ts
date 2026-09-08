import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { encodeString } from 'src/utils/querystring-helpers';
import {
  COLLECTION_SIZE_BUCKETS,
  COLLECTION_SIZE_VALUE_FIELD,
  CollectionSizeBucket,
  RANGE_WILDCARD,
} from 'src/views/search/config/collection-size';
import { withoutRangeFilter } from '../../filters/components/collection-size-filter/utils';
import { queryFilterObject2String } from '../../filters/utils/query-string';

export interface UseCollectionSizeBucketsParams {
  q: string;
  extra_filter?: string;
  use_ai_search?: string;
  advancedSearch?: string;
}

/** A histogram bucket with the number of records that fall in it. */
export interface CollectionSizeBucketCount extends CollectionSizeBucket {
  count: number;
}

/** `field:[min TO max]`, with `*` for the final bucket's open end. */
const bucketRangeFilter = (bucket: CollectionSizeBucket): string => {
  const max = bucket.max === undefined ? RANGE_WILDCARD : bucket.max;
  return `${COLLECTION_SIZE_VALUE_FIELD}:[${bucket.min} TO ${max}]`;
};

/**
 * Drops empty buckets at both ends while keeping interior ones.
 *
 * The axis then spans only the occupied decades, the way the date histogram
 * spans only years with data. Interior zeros stay so the decades remain evenly
 * spaced — a gap in the middle is information.
 */
export const trimEmptyEdgeBuckets = (
  buckets: CollectionSizeBucketCount[],
): CollectionSizeBucketCount[] => {
  const first = buckets.findIndex(bucket => bucket.count > 0);
  if (first === -1) return [];

  let last = buckets.length - 1;
  while (last > first && buckets[last].count === 0) {
    last -= 1;
  }

  return buckets.slice(first, last + 1);
};

/**
 * Record counts per collection size decade, for the histogram card.
 *
 * `collectionSize.minValue` can neither be faceted nor histogrammed usefully —
 * the API's `hist` param only builds date histograms, and a terms facet is
 * capped at 1000 values ordered by count, which drops every large value. So
 * each bucket is counted with its own `size=0` range query; they run in
 * parallel under one query key, and the API answers them in single-digit ms.
 *
 * The applied range is stripped from the scope (see `withoutRangeFilter`) so
 * the bars keep showing the whole distribution while a range is selected.
 */
export const useCollectionSizeBuckets = (
  params: UseCollectionSizeBucketsParams,
  options?: { enabled?: boolean },
) => {
  const {
    q,
    extra_filter = '',
    use_ai_search = 'false',
    advancedSearch,
  } = params;

  const encodedQ = advancedSearch === 'true' ? q : encodeString(q);
  const scopedFilter = queryFilterObject2String(
    withoutRangeFilter(extra_filter),
  );

  return useQuery<CollectionSizeBucketCount[]>({
    queryKey: [
      'collection-size-buckets',
      encodedQ,
      use_ai_search,
      advancedSearch,
      scopedFilter ?? '',
    ],
    queryFn: async () => {
      const counts = await Promise.all(
        COLLECTION_SIZE_BUCKETS.map(async bucket => {
          const rangeFilter = bucketRangeFilter(bucket);
          const response = await fetchSearchResults({
            q: encodedQ,
            extra_filter: scopedFilter
              ? `${scopedFilter} AND ${rangeFilter}`
              : rangeFilter,
            size: 0,
            use_ai_search,
          });

          return { ...bucket, count: response?.total ?? 0 };
        }),
      );

      return trimEmptyEdgeBuckets(counts);
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
