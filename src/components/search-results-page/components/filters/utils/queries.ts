import { QueryKey } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { Metadata } from 'src/hooks/api/types';
import { encodeString } from 'src/utils/querystring-helpers';

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
interface FacetParams extends Params {
  facets: string;
}
export const buildFacetQueryParams = (params: FacetParams): FacetParams => ({
  ...params,
  q: params?.advancedSearch === 'true' ? params.q : encodeString(params.q),
  extra_filter: params?.extra_filter
    ? `${params.extra_filter} AND _exists_:${params.facets}`
    : `_exists_:${params.facets}`,
  size: 0,
  facet_size: 1000,
  facets: params.facets,
  sort: undefined,
});

/**
 * Format the terms returned from the fetchSearchResults.
 *
 * @param data - The data returned from the fetchSearchResults API.
 * @param facetField - The facet field being processed.
 * @returns Formatted terms array.
 */
export const structureQueryData = (
  data: FetchSearchResultsResponse,
  facetField: string,
) => {
  const { total, facets } = data;
  if (!facets) {
    throw new Error('No facets returned from fetchSearchResults');
  }
  const { terms } = facets[facetField];

  if (facets?.multi_terms_agg) {
    facets.multi_terms_agg.terms.forEach(({ term: multiTerm }) => {
      const [groupBy, term] = multiTerm.split('|');
      const matchIndex = terms.findIndex(t => t.term === term);
      if (matchIndex > -1) {
        terms[matchIndex] = { ...terms[matchIndex], groupBy };
      }
    });
  }

  return {
    facet: facetField,
    results: [
      {
        label: 'Any Specified',
        term: '_exists_',
        count: total,
        facet: facetField,
      },
      ...terms,
    ],
  };
};
/**
 * Create common query for a given facet field.
 *
 * @param commonParams - The common parameters for the query.
 * @param optionsQueryKey - The query key options.
 * @returns The query object.
 */

export const createCommonQuery = ({
  params,
  queryKey,
  ...options
}: {
  queryKey: QueryKey;
  params: FacetParams;
}) => {
  const queryParams = buildFacetQueryParams(params);

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
      return structureQueryData(data, queryParams.facets);
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
  params,
  queryKey,
  ...options
}: {
  queryKey: QueryKey;
  params: FacetParams;
}) => {
  const queryParams = buildFacetQueryParams(params);

  return {
    queryKey: [
      ...queryKey,
      {
        ...queryParams,
        extra_filter: params.extra_filter
          ? `${params.extra_filter} AND -_exists_:${params.facets}`
          : `-_exists_:${params.facets}`,
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
      facet: queryParams.facets,
      results:
        data.total === 0
          ? []
          : [
              {
                label: 'Not Specified',
                term: '-_exists_',
                count: data.total,
                facet: queryParams.facets,
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
export const createCommonQueryWithMetadata = ({
  queryKey,
  params,
  ...options
}: {
  queryKey: QueryKey;
  params: FacetParams;
}) => {
  const queryParams = buildFacetQueryParams(params);

  return {
    queryKey: [...queryKey, queryParams],
    queryFn: async () => {
      const data = await fetchSearchResults(queryParams);
      // Don't need to re-run the metadata query if the data is already in the cache
      const repos = !queryKey.includes('filtered')
        ? await fetchMetadata()
        : null;
      if (!data) {
        throw new Error('No data returned from fetchSearchResults');
      }
      return { ...data, repos };
    },
    select: (data: SourcesData) => {
      const { facets } = data;
      if (!facets) {
        throw new Error('No facets returned from fetchSearchResults');
      }
      // Merge repository details with the facet terms
      const repos =
        (data?.repos?.src &&
          Object.values(data.repos.src).filter(repo => repo?.sourceInfo)) ||
        [];

      const terms = facets[queryParams.facets].terms.map(
        (item: { term: string; count: number }) => ({
          label: item.term,
          term: item.term,
          count: item.count,
          facet: queryParams.facets,
          groupBy:
            repos?.find(r => r.sourceInfo?.name === item.term)?.sourceInfo
              ?.genre || 'Generalist',
        }),
      );

      return {
        facet: queryParams.facets,
        results: terms,
      };
    },
    ...options,
  };
};
