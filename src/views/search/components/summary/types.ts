import { SearchQueryParams } from 'src/views/search/types';

export type ChartType = 'pie' | 'bar';

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

  chart: {
    availableOptions: ChartType[];
    defaultOption: ChartType;
  };

  formatting?: {
    label?: (bucketKey: string) => string;
  };

  behavior?: {
    bucketToFilter?: (bucketKey: string) => SearchFilter;
  };
};
