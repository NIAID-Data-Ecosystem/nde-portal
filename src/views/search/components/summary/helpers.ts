import {
  Facet,
  FacetTerm,
  FetchSearchResultsResponse,
} from 'src/utils/api/types';
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
  maxSlices: 7,
  minPercent: 0.03,
  moreId: MORE_ID,
  moreLabel: 'More',
};

// Group small value buckets into a "More" category for better visualization.
export const bucketSmallValues = (
  data: ChartDatum[],
  opts?: {
    maxSlices?: number;
    minPercent?: number;
    moreId?: string;
    moreLabel?: string;
  },
): { chartData: ChartDatum[]; moreItems: ChartDatum[] } => {
  const {
    maxSlices = DEFAULT_MORE_PARAMS.maxSlices,
    minPercent = DEFAULT_MORE_PARAMS.minPercent,
    moreId = DEFAULT_MORE_PARAMS.moreId,
    moreLabel = DEFAULT_MORE_PARAMS.moreLabel,
  } = opts ?? {};

  const cleaned = data
    .filter(d => Number.isFinite(d.value) && d.value > 0)
    .slice()
    .sort((a, b) => b.value - a.value);

  const total = cleaned.reduce((s, d) => s + d.value, 0);
  if (total === 0) return { chartData: [], moreItems: [] };

  // keep = slices rendered directly
  // more = slices grouped into "More"
  const keep: ChartDatum[] = [];
  const more: ChartDatum[] = [];

  for (const d of cleaned) {
    const pct = d.value / total;

    // Keep the item if:
    // - we haven't exceeded the slice limit AND
    // - the item represents a meaningful portion of the total
    if (keep.length < maxSlices && pct >= minPercent) keep.push(d);
    else more.push(d);
  }

  if (more.length === 0) return { chartData: keep, moreItems: [] };

  // Aggregate all "more" values into a single slice
  const moreValue = more.reduce((s, d) => s + d.value, 0);

  return {
    chartData: [
      ...keep,
      {
        id: moreId,
        label: `${moreLabel}... (${more.length.toLocaleString()})`,
        value: moreValue,
      },
    ],
    moreItems: more,
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
