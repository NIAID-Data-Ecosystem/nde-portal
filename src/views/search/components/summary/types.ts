export type ChartType = 'pie' | 'bar';

type SearchFilter = {
  field: string;
  value: string | string[] | { from?: string; to?: string };
};

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
