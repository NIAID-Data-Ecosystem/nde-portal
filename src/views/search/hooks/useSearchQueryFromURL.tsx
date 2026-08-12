import { useRouter } from 'next/router';
import { useMemo } from 'react';
import {
  defaultQuery,
  DefaultSearchQueryParams,
  defaultSelectedFilters,
  shouldApplyDefaultDate,
} from '../config/defaultQuery';
import { encodeString } from 'src/utils/querystring-helpers';
import { FILTER_CONFIGS } from '../components/filters/config';
import { queryFilterString2Object } from '../components/filters/utils/query-string';

const parseNumberQueryParam = (
  param: string | string[] | undefined,
  fallback: number,
) => {
  if (Array.isArray(param)) return Number(param[0]) || fallback;
  return Number(param) || fallback;
};

export const useSearchQueryFromURL = (): DefaultSearchQueryParams => {
  const router = useRouter();

  const defaultFilters = useMemo(() => {
    return FILTER_CONFIGS.reduce(
      (acc, { property }) => ({ ...acc, [property]: [] }),
      {},
    );
  }, []);

  const filters = useMemo(() => {
    const raw = queryFilterString2Object(router.query.filters) ?? {};
    // Seed the default date range only for a fresh query — not when the user
    // has explicitly opted out via `applyDefaultDate=false` or already has a
    // date filter applied.
    const base = shouldApplyDefaultDate(router.query.applyDefaultDate, raw)
      ? defaultSelectedFilters
      : {};
    return { ...defaultFilters, ...base, ...raw };
  }, [router.query.filters, router.query.applyDefaultDate, defaultFilters]);

  const from = useMemo(
    () => parseNumberQueryParam(router.query.from, defaultQuery.from),
    [router.query.from],
  );

  const size = useMemo(
    () => parseNumberQueryParam(router.query.size, defaultQuery.size),
    [router.query.size],
  );

  const sort = useMemo(() => {
    const s = router.query.sort;
    return Array.isArray(s) ? s[0] : s ?? defaultQuery.sort;
  }, [router.query.sort]);

  const shouldUseMetadataScore = useMemo(() => {
    return router.query.use_metadata_score === 'true';
  }, [router.query.use_metadata_score]);

  const use_ai_search = useMemo(() => {
    return Array.isArray(router.query.use_ai_search)
      ? router.query.use_ai_search[0]
      : router.query.use_ai_search;
  }, [router.query.use_ai_search]);

  const q = useMemo(() => {
    const raw = router.query.q ?? defaultQuery.q;
    const cleaned = Array.isArray(raw)
      ? raw.map(s => s?.trim()).join('+')
      : raw?.trim() ?? '';
    const finalQuery = cleaned || defaultQuery.q;
    return router.query.advancedSearch ? finalQuery : encodeString(finalQuery);
  }, [router.query.q, router.query.advancedSearch]);

  return {
    q,
    filters,
    from,
    size,
    sort,
    use_ai_search,
    shouldUseMetadataScore,
  };
};
