import { SearchQueryParams } from 'src/views/search/types';

export type ChartType = 'pie' | 'bar';

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

export type VizConfig = {
  id: string;
  label: string;
  property: string;
  filterProperty?: string; // Optional: property to use for filtering (defaults to property if not specified)

  chart: {
    availableOptions: ChartType[];
    defaultOption: ChartType;
    pie?: {
      maxItems?: number;
      minPercent?: number;
    };
    bar?: {
      maxItems?: number;
      minPercent?: number;
    };
  };

  formatting?: {
    label?: (bucketKey: string) => string;
    tooltip?: (bucketKey: string) => string;
  };

  behavior?: {
    bucketToFilter?: (bucketKey: string) => SearchFilter;
  };
};
