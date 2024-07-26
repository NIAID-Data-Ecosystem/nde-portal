import { Params } from 'src/utils/api';
import { UseQueryOptions } from '@tanstack/react-query';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

// Define the structure of the transformed query result
export interface FilterTerm {
  label: string;
  term: string;
  count: number;
  facet: string;
}

export interface TransformedQueryResult {
  facet: string;
  results: FilterTerm[];
}

// Interface for filter configuration
export interface FilterConfig {
  name: string;
  property: string;
  description: string;
  isDefaultOpen?: Boolean;
  createQueries: (
    params: Params,
    options?: UseQueryOptions<
      FetchSearchResultsResponse,
      Error,
      TransformedQueryResult
    >,
  ) => UseQueryOptions<
    FetchSearchResultsResponse,
    Error,
    TransformedQueryResult
  >[];
}
