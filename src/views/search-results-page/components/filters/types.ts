import { Params } from 'src/utils/api';
import { UseQueryOptions } from '@tanstack/react-query';

export type SelectedFilterTypeValue = string | { [key: string]: string[] };

export interface SelectedFilterType {
  [key: string]: SelectedFilterTypeValue[];
}

// Define the structure of the transformed query result
export interface FacetTermWithDetails {
  count: number;
  term: string;
  facet?: string;
  groupBy?: string;
  label?: string;
}

export interface QueryResult {
  facet: string;
  results: FacetTermWithDetails[];
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
    isInitialQuery?: boolean,
  ) => UseQueryOptions<any, Error, QueryResult>[];
  transformData?: (item: FacetTermWithDetails) => FacetTermWithDetails; // useful for transforming data before rendering. Note that the label is used for search and display.
  groupBy?: {
    property: string;
    label: string;
  }[];
}

// Define the type for the query result accumulator
export type TransformedFacetResults = {
  [facet: string]: TransformedQueryResult['results'];
};
