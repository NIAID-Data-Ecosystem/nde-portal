import { Params } from 'src/utils/api';
import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export type SelectedFilterTypeValue = string | { [key: string]: string[] };

export interface SelectedFilterType {
  [key: string]: SelectedFilterTypeValue[];
}

export interface RawQueryResult {
  facet: string;
  results: {
    count: number;
    facet?: string;
    label?: string;
    groupBy?: string;
    term: string;
  }[];
}

// Define the structure of the transformed query result
export interface FacetTermWithDetails
  extends Omit<RawQueryResult['results'][number], 'label'> {
  label: string;
}

export interface QueryData {
  [facet: string]: Omit<UseQueryResult<FacetTermWithDetails[]>, 'data'> & {
    data: FacetTermWithDetails[];
  };
}

// Interface for filter configuration
export interface FilterConfig {
  name: string;
  property: string;
  description: string;
  isDefaultOpen?: Boolean;
  createQueries?: (
    params: Params,
    options?: UseQueryOptions<any, Error, RawQueryResult>,
  ) => UseQueryOptions<any, Error, RawQueryResult>[];
  transformData?: (
    item: RawQueryResult['results'][number],
  ) => FacetTermWithDetails; // useful for transforming data before rendering. Note that the label is used for search and display.
  groupBy?: {
    property: string;
    label: string;
  }[];
}
