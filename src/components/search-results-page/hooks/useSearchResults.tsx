import { useQuery, UseQueryOptions } from 'react-query';
import { fetchSearchResults, Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

//useGetSearchResults
export function useQuerySearchResults(
  params: Params,
  options?: UseQueryOptions<FetchSearchResultsResponse | undefined, Error>,
) {
  return useQuery<FetchSearchResultsResponse | undefined, Error>(
    ['search-results', params],
    () => {
      if (typeof params.q !== 'string' && !params.q) {
        return;
      }
      return fetchSearchResults(params);
    },

    options,
  );
}
