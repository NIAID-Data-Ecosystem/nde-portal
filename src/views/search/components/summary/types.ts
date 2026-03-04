import { SearchQueryParams } from 'src/views/search/types';

// Re-export chart types from refactored-filters for consistency
export type { ChartType, ChartTypeConfig } from '../refactored-filters/types';

export interface ChartDatum {
  id: string;
  label: string;
  term: string;
  value: number;
  countItems?: number;
  tooltip?: string;
}

export type SearchFilter = {
  field: string;
  value: string | string[] | { from?: string; to?: string };
};

export type SearchState = Omit<SearchQueryParams, 'from' | 'size' | 'sort'> &
  Required<Pick<SearchQueryParams, 'from' | 'size' | 'sort'>>;
