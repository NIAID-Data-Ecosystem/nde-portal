import { QueryKey } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { Metadata } from 'src/hooks/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { RawQueryResult } from '../types';

interface SourcesData extends FetchSearchResultsResponse {
  repos: Metadata | null;
}

/**
 * Generate common query parameters for making the API call.
 *
 * @param params - The parameters used in the query.
 * @param facetField - The facet field to filter by.
 * @returns The common query parameters.
 */
export interface FacetParams extends Params {
  facets: string;
}
export const buildFacetQueryParams = (params: FacetParams): FacetParams => {
  const { advancedSearch, q, facets, extra_filter } = params;

  const encodedQuery = advancedSearch === 'true' ? q : encodeString(q);

  return {
    ...params,
    q: encodedQuery,
    extra_filter,
    filters: '',
    size: 0,
    facet_size: 1000,
    facets,
    sort: undefined,
  };
};

/**
 * Format the terms returned from the fetchSearchResults.
 *
 * @param data - The data returned from the fetchSearchResults API.
 * @param facetField - The facet field being processed.
 * @returns Formatted terms array.
 */
export const structureQueryData = (data: FetchSearchResultsResponse) => {
  const { total, facets } = data;
  if (!facets) {
    throw new Error('No facets returned from fetchSearchResults');
  }

  const terms =
    Object.values(facets).filter(facet => facet._type === 'terms')?.[0]
      ?.terms || [];

  if (facets?.multi_terms_agg) {
    facets.multi_terms_agg.terms.forEach(({ term: multiTerm }) => {
      const [groupBy, term] = multiTerm.split('|');
      const matchIndex = terms.findIndex(t => t.term === term);
      if (matchIndex > -1) {
        terms[matchIndex] = { ...terms[matchIndex], groupBy };
      }
    });
  }

  return [
    {
      label: 'Any',
      term: '_exists_',
      count: total,
    },
    ...terms,
  ];
};
/**
 * Create common query for a given facet field.
 *
 * @param commonParams - The common parameters for the query.
 * @param optionsQueryKey - The query key options.
 * @returns The query object.
 */

export interface QueryArgs {
  id: string;
  queryKey: QueryKey;
  params: FacetParams;
  placeholderData?: any;
  select?: (data: FetchSearchResultsResponse) => RawQueryResult;
}

export const createCommonQuery = ({
  id,
  params,
  queryKey,
  ...options
}: QueryArgs) => {
  // add exists to get total count for "Any"
  const extraFilterWithFacets = params.extra_filter
    ? `${params.extra_filter}${
        params.facets ? ` AND _exists_:${params.facets}` : ''
      }`
    : params.facets
    ? `_exists_:${params.facets}`
    : '';

  const queryParams = buildFacetQueryParams({
    ...params,
    extra_filter: extraFilterWithFacets,
  });

  return {
    queryKey: [...queryKey, queryParams],
    queryFn: async () => {
      const data = await fetchSearchResults(queryParams);
      if (!data) {
        throw new Error('No data returned from fetchSearchResults');
      }
      return data;
    },
    select: (data: FetchSearchResultsResponse) => {
      return {
        id,
        facet: queryParams.facets,
        results: structureQueryData(data),
      };
    },
    ...options,
  };
};

/**
 * Create a query for fetching results where the facet field does not exist.
 *
 * @param commonParams - The common parameters for the query.
 * @param optionsQueryKey - The query key options.
 * @returns The query object.
 */

export const createNotExistsQuery = ({
  id,
  params,
  queryKey,
  ...options
}: QueryArgs) => {
  // add not exists to get total count for "None Specified"
  const extraFilterWithFacets = params.extra_filter
    ? `${params.extra_filter}${
        params.facets ? ` AND -_exists_:${params.facets}` : ''
      }`
    : params.facets
    ? `-_exists_:${params.facets}`
    : '';
  const queryParams = buildFacetQueryParams({
    ...params,
    extra_filter: extraFilterWithFacets,
  });

  return {
    queryKey: [
      ...queryKey,
      {
        ...queryParams,
        extra_filter: extraFilterWithFacets,
        facet_size: 0,
      },
    ],
    queryFn: async () => {
      const data = await fetchSearchResults({
        ...queryParams,
        extra_filter: params.extra_filter
          ? `${params.extra_filter} AND -_exists_:${params.facets}`
          : `-_exists_:${params.facets}`,
        facet_size: 0,
      });
      if (!data) {
        throw new Error('No data returned from fetchSearchResults');
      }
      return data;
    },
    select: (data: FetchSearchResultsResponse) => ({
      id,
      facet: queryParams.facets,
      results:
        data.total === 0
          ? []
          : [
              {
                label: 'No',
                term: '-_exists_',
                count: data.total,
              },
            ],
    }),
    ...options,
  };
};

/**
 * Create common query with metadata for the "Sources" facet field.
 *
 * @param commonParams - The common parameters for the query.
 * @param optionsQueryKey - The query key options.
 * @returns The query object.
 */
export const createQueryWithSourceMetadata = ({
  id,
  params,
  queryKey,
  ...options
}: QueryArgs) => {
  const queryParams = buildFacetQueryParams(params);
  return {
    queryKey: [...queryKey, queryParams],
    queryFn: async () => {
      const data = await fetchSearchResults(queryParams);
      const repos = !queryKey.includes('filtered')
        ? await fetchMetadata()
        : null;
      if (!data) {
        throw new Error('No data returned from fetchSearchResults');
      }
      return { ...data, repos };
    },
    select: (data: SourcesData) => {
      if (!data) {
        throw new Error('No data returned from fetchSearchResults');
      }
      const { facets } = data;

      if (!facets) {
        throw new Error('No facets returned from fetchSearchResults');
      }
      // Merge repository details with the facet terms
      const repos =
        (data?.repos?.src &&
          Object.values(data.repos.src).filter(repo => repo?.sourceInfo)) ||
        [];

      const terms =
        Object.values(facets).filter(facet => facet._type === 'terms')?.[0]
          ?.terms || [];

      const results = terms.map((item: { term: string; count: number }) => ({
        label: item.term,
        term: item.term,
        count: item.count,
        facet: queryParams.facets,
        groupBy:
          repos?.find(r => r.sourceInfo?.name === item.term)?.sourceInfo
            ?.genre || 'Generalist',
      }));

      return {
        id,
        facet: queryParams.facets,
        results,
      };
    },
    ...options,
  };
};
