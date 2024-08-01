import { Params } from 'src/utils/api';
import { UseQueryOptions } from '@tanstack/react-query';

// Define the structure of the transformed query result
export interface FacetTerm {
  label?: string;
  term: string;
  count: number;
  facet?: string;
  groupBy?: string;
}

export interface QueryResult {
  facet: string;
  results: FacetTerm[];
}

export interface FilterItem {
  count: number;
  isHeader?: boolean;
  label: string;
  term: string;
  facet?: string;
  groupBy?: string;
}

export interface TransformedQueryResult {
  facet: string;
  results: FilterItem[];
}
// Interface for filter configuration
export interface FilterConfig {
  name: string;
  property: string;
  description: string;
  isDefaultOpen?: Boolean;
  createQueries: (
    params: Params,
    options?: UseQueryOptions<any, Error, QueryResult>,
  ) => UseQueryOptions<any, Error, QueryResult>[];
  transformData?: (item: FacetTerm) => FacetTerm;
  groupBy?: {
    property: string;
    label: string;
  }[];
}
