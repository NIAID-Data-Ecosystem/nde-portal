import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { ChartDatum, ChartType } from './types';
import { PieChart } from 'src/components/visualizations/pie';

// Helper functions for processing aggregate data for chart visualizations.
export const normalizeAggregateData = (
  apiResponse: FetchSearchResultsResponse,
  key: string,
) => {
  return apiResponse?.facets?.[key]?.['terms'];
};

export const MORE_ID = '__more__';
export const DEFAULT_MORE_PARAMS = {
  minPercent: 0.01,
  moreLabel: 'More',
};
export const isMoreSlice = (id: string) => id === MORE_ID;

// Group small value buckets into a "More" category for better visualization.
export const bucketSmallValues = (
  data: ChartDatum[],
  opts: { minPercent: number; moreLabel?: string } = DEFAULT_MORE_PARAMS,
) => {
  const minPercent = opts.minPercent ?? 0.01; // min percent to show individually
  const moreLabel = opts.moreLabel ?? 'More';

  // Sort descending so large slices are always rendered first
  const sorted = [...data].sort((a, b) => b.value - a.value);

  // Total is used to compute percentage contribution
  const total = sorted.reduce((s, d) => s + d.value, 0);

  // No data or invalid totals = skip bucketing
  if (!sorted.length || total <= 0) {
    return { data: sorted, tail: [] as ChartDatum[] };
  }

  const visible: ChartDatum[] = [];
  const tail: ChartDatum[] = [];

  // Partition data into visible slices vs. "More"
  for (const d of sorted) {
    const pct = d.value / total;
    if (pct >= minPercent) visible.push(d);
    else tail.push(d);
  }

  // If nothing to bucket, return original
  if (tail.length === 0) {
    return { data: visible, tail };
  }

  // Aggregate tail values into a single value
  const moreValue = tail.reduce((s, d) => s + d.value, 0);
  const moreItems = tail.length; // number of items in "More"

  return {
    data: [
      ...visible,
      {
        id: MORE_ID,
        value: moreValue,
        label: `${moreLabel} (${moreItems})`,
      },
    ],
    tail,
  };
};

// Mapping chart types to their respective components and data mappers.
export const chartRegistry: Record<
  ChartType,
  {
    Component: React.ComponentType<any>;
    mapFacetsToChartData: (
      buckets: FacetTerm[],
      opts: { formatLabel: (term: string, count: number) => string }, //type VizConfig formatting tbd
    ) => ChartDatum[];
    getFacetKey: (datum: any) => string;
  }
> = {
  pie: {
    mapFacetsToChartData: (data, config) => {
      return data.map(b => ({
        id: b.term,
        value: b.count,
        term: b.term,
        label: config.formatLabel(b.term, b.count),
      }));
    },
    Component: PieChart,
    getFacetKey: d => d.id,
  },
  // bar: {
  //   mapFacetsToChartData: data => {
  //     console.log(data);
  //   },
  //   Component: PieChart,
  //   // mapFacetsToChartData: (buckets, { formatLabel }) =>
  //   //   buckets.map(b => ({
  //   //     id: b.key,
  //   //     value: b.count,
  //   //     label: formatLabel(b.key),
  //   //   })),
  //   // getFacetKey: d => d.id,
  // },
};
