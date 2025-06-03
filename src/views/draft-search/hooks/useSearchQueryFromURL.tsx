import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { defaultQuery, DefaultSearchQueryParams } from '../config/defaultQuery';
import { encodeString } from 'src/utils/querystring-helpers';
import { FILTER_CONFIGS } from '../components/filters/config';
import { queryFilterString2Object } from '../components/filters/utils/query-builders';

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
    const raw = queryFilterString2Object(router.query.filters);
    return { ...defaultFilters, ...(raw ?? {}) };
  }, [router.query.filters, defaultFilters]);

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

  const q = useMemo(() => {
    const raw = router.query.q ?? defaultQuery.q;
    const cleaned = Array.isArray(raw)
      ? raw.map(s => s?.trim()).join('+')
      : raw?.trim() ?? '';
    return router.query.advancedSearch ? cleaned : encodeString(cleaned);
  }, [router.query.q, router.query.advancedSearch]);

  return {
    q,
    filters,
    from,
    size,
    sort,
    shouldUseMetadataScore,
  };
};
