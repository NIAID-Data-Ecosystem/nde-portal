import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FILTER_CONFIGS } from 'src/views/search-results-page/components/filters/config';
import { queryFilterString2Object } from 'src/views/search-results-page/helpers';
import { defaultQuery } from '../config/defaultQuery';
import { encodeString } from 'src/utils/querystring-helpers';
import { SearchQueryParams } from '../types';

export const useSearchQueryParams = (): SearchQueryParams => {
  const router = useRouter();

  // Filters
  const defaultFilters = useMemo(() => {
    return FILTER_CONFIGS.reduce(
      (acc, { property }) => ({ ...acc, [property]: [] }),
      {},
    );
  }, []);

  const filters = useMemo(() => {
    const filtersFromQuery = queryFilterString2Object(router.query.filters);
    return {
      ...defaultFilters,
      ...filtersFromQuery,
    };
  }, [router.query.filters, defaultFilters]);

  // Selected page and per page.
  const selectedPage = useMemo(() => {
    const from = router.query.from;
    return from
      ? Number(Array.isArray(from) ? from[0] : from)
      : defaultQuery.from;
  }, [router.query.from]);

  const selectedPerPage = useMemo(() => {
    const size = router.query.size;
    return size
      ? Number(Array.isArray(size) ? size[0] : size)
      : defaultQuery.size;
  }, [router.query.size]);

  const sort = useMemo(() => {
    const sort = router.query.sort;
    return sort ? (Array.isArray(sort) ? sort[0] : sort) : defaultQuery.sort;
  }, [router.query.sort]);

  const shouldUseMetadataScore = useMemo(() => {
    return router.query.use_metadata_score === 'true';
  }, [router.query.use_metadata_score]);

  const querystring = useMemo(() => {
    let q = router.query.q ?? defaultQuery.q;
    q = Array.isArray(q) ? `${q.map(s => s.trim()).join('+')}` : `${q.trim()}`;

    return router.query.advancedSearch ? q : encodeString(q);
  }, [router.query.q, router.query.advancedSearch]);

  return {
    q: querystring,
    filters,
    from: selectedPage,
    size: selectedPerPage,
    sort,
    shouldUseMetadataScore,
  };
};
