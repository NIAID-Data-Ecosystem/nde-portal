import { SearchQueryParams } from 'src/views/search/types';

export type ChartType = 'pie' | 'bar' | 'histogram';

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

export type ChartTypeConfig = {
  maxItems?: number;
  minPercent?: number;
};

export type VizConfig = {
  id: string;
  label: string;
  property: string;
  filterProperty?: string; // Optional: property to use for filtering (defaults to property if not specified)

  chart: {
    availableOptions: ChartType[];
    defaultOption: ChartType;
  } & Partial<Record<ChartType, ChartTypeConfig>>;

  formatting?: {
    label?: (bucketKey: string) => string;
    tooltip?: (bucketKey: string) => string;
  };

  behavior?: {
    bucketToFilter?: (bucketKey: string) => SearchFilter;
  };

  // Optional: Function to transform facet data (e.g., format labels)
  transformData?: (item: { count: number; term: string; label?: string }) => {
    count: number;
    term: string;
    label: string;
  };
};
