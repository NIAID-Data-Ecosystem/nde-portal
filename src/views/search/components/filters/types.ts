import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { FacetParams } from './utils/queries';
import { TabType } from '../../types';

export type SelectedFilterTypeValue = string | { [key: string]: string[] };

export interface SelectedFilterType {
  [key: string]: SelectedFilterTypeValue[];
}

export interface RawQueryResult {
  id: string;
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

export interface FilterItem extends FacetTermWithDetails {
  isHeader?: boolean;
}

export interface QueryData {
  [facet: string]: Omit<UseQueryResult<FacetTermWithDetails[]>, 'data'> & {
    data: FacetTermWithDetails[];
  };
}

// Interface for filter configuration
/**
 * @FilterConfig
 *
 * Interface for filter configuration.
 *
 * @property _id - The unique identifier for the filter.
 * @property vizId - The associated visualization ID for the filter (if applicable).
 * @property name - The name used for display the filter.
 * @property property - The schema property to filter on, used in selected filters.
 * @property description - The description of the filter, used for the tooltip.
 * @property createQueries - Function to create queries for the filter.
 * @property groupBy - The property to group the terms under.
 * @property isDefaultOpen - Whether the filter is open by default.
 * @property transformData - Function to transform data before rendering, used for updating the display label mostly.
 *
 */
export interface FilterConfig {
  _id: string;
  vizId?: string;
  name: string;
  property: string;
  description: string;
  tabIds: TabType['id'][];
  createQueries: (
    id: string,
    params: FacetParams,
    options?: UseQueryOptions<any, Error, RawQueryResult>,
  ) => UseQueryOptions<any, Error, RawQueryResult>[];
  groupBy?: {
    property: string;
    label: string;
  }[];
  isDefaultOpen?: Boolean;
  transformData?: (
    item: RawQueryResult['results'][number],
  ) => FacetTermWithDetails; // useful for transforming data before rendering. Note that the label is used for search and display.
}
