import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchSearchResults, Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

export function useSearchResultsQuery(
  params: Params,
  options?: UseQueryOptions<FetchSearchResultsResponse | undefined, Error>,
) {
  return useQuery<FetchSearchResultsResponse | undefined, Error>({
    queryKey: ['search-results', params],
    queryFn: () => {
      if (typeof params.q !== 'string' && !params.q) {
        return;
      }
      return fetchSearchResults(params);
    },
    ...options,
  });
}
