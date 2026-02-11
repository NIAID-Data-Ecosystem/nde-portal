import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { ChartDatum, ChartType } from './types';
import { PieChart } from 'src/components/visualizations/pie';
import { BarChart } from 'src/components/visualizations/bar';

// Helper functions for processing aggregate data for chart visualizations.
export const normalizeAggregateData = (
  apiResponse: FetchSearchResultsResponse,
  key: string,
) => {
  return apiResponse?.facets?.[key]?.['terms'];
};

export const MORE_ID = '__more__';
export const DEFAULT_MORE_PARAMS = {
  minPercent: 0,
  minItems: undefined,
  maxItems: undefined,
  moreLabel: 'More',
};
export const isMoreSlice = (id: string) => id === MORE_ID;

// Group small value buckets into a "More" category for better visualization.
type BucketSmallValuesOpts = {
  // For pie / percent-based bucketing
  minPercent?: number;

  // For bar charts / count-based bucketing (show only this many, bucket the rest)
  minItems?: number;

  // Optional cap that works for both modes
  maxItems?: number;

  // ID and label for the "More" category
  moreId?: string;
  moreLabel?: string;
};

const formatMoreGrouping = ({
  id,
  countItems,
  value,
  label,
}: {
  id: string;
  value: number;
  label: string;
  countItems: number;
}) => {
  const numItems = countItems.toLocaleString();
  const itemsLabel = `${label} (${numItems} item${countItems > 1 ? 's' : ''})`;
  return {
    id,
    label: itemsLabel,
    term: itemsLabel,
    value,
    countItems,
    tooltip: `${label} (${value.toLocaleString()} resource${
      value > 1 ? 's' : ''
    })`,
  };
};

// Group small value buckets into a "More" category for better visualization.
// [TO DO]: maybe add defaults per chart type?
export const bucketSmallValues = (
  data: ChartDatum[],
  opts: BucketSmallValuesOpts,
) => {
  const {
    minPercent = DEFAULT_MORE_PARAMS.minPercent,
    minItems = DEFAULT_MORE_PARAMS.minItems,
    maxItems = DEFAULT_MORE_PARAMS.maxItems,
    moreId = MORE_ID,
    moreLabel = DEFAULT_MORE_PARAMS.moreLabel,
  } = opts ?? {};

  // Clean + sort descending so largest are first
  const sorted = [...data]
    .filter(d => Number.isFinite(d.value) && d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Total is used to compute percentage contribution
  const total = sorted.reduce((s, d) => s + d.value, 0);

  // No data or invalid totals = skip bucketing
  if (!sorted.length || total <= 0) {
    return { data: sorted, tail: [] as ChartDatum[] };
  }

  // -------- Bucketing Option 1: "top N" bucketing  --------
  // NOTE: minItems is the explicit "top N" intent (primarily for bar charts).
  // If minItems is provided, we always use top-N bucketing and ignore minPercent/maxItems.
  if (typeof minItems === 'number') {
    // Ensure minItems is at least 1
    const limit = Math.max(1, Math.floor(minItems));
    const visible = sorted.slice(0, limit);
    const tail = sorted.slice(limit);
    if (tail.length === 0) return { data: visible, tail };

    const moreValue = tail.reduce((s, d) => s + d.value, 0);
    const moreItems = tail.length;

    return {
      data: [
        ...visible,
        formatMoreGrouping({
          id: moreId,
          value: moreValue,
          countItems: moreItems,
          label: moreLabel,
        }),
      ],
      tail,
    };
  }

  // -------- Bucketing Option 2: percent bucketing --------
  const visible: ChartDatum[] = [];
  const tail: ChartDatum[] = [];

  // Partition data into visible slices vs. "More"
  for (const d of sorted) {
    const pct = d.value / total;
    if (pct >= minPercent) visible.push(d);
    else tail.push(d);
  }

  // If maxItems is provided, cap the visible list AFTER percent filtering.
  // Any overflow (plus the existing tail) gets rolled into "More".
  if (
    typeof maxItems === 'number' &&
    maxItems >= 0 &&
    visible.length > maxItems
  ) {
    const overflow = visible.splice(maxItems); // remove items beyond the cap
    tail.push(...overflow);
  }

  if (tail.length === 0) return { data: visible, tail };

  const moreValue = tail.reduce((s, d) => s + d.value, 0);
  const moreItems = tail.length;

  return {
    data: [
      ...visible,
      formatMoreGrouping({
        id: moreId,
        value: moreValue,
        countItems: moreItems,
        label: moreLabel,
      }),
    ],
    tail,
  };
};

// Mapping chart types to their respective components and data mappers.
const mapFacetsToChartData = (
  data: FacetTerm[],
  config: {
    formatLabel: (term: string, count: number) => string;
    transformData?: (item: { count: number; term: string; label?: string }) => {
      count: number;
      term: string;
      label: string;
    };
  },
): ChartDatum[] => {
  return data.map(b => {
    // Apply transformData if provided
    const transformed = config.transformData
      ? config.transformData({ count: b.count, term: b.term })
      : { count: b.count, term: b.term, label: b.term };

    return {
      id: transformed.term,
      value: transformed.count,
      term: transformed.term,
      label: config.formatLabel(transformed.label, transformed.count),
      tooltip: `${
        transformed.label
      } (${transformed.count.toLocaleString()} resource${
        transformed.count > 1 ? 's' : ''
      })`,
    };
  });
};

export const chartRegistry: Record<
  ChartType,
  {
    Component: React.ComponentType<any>;
    mapFacetsToChartData: (
      buckets: FacetTerm[],
      opts: {
        formatLabel: (term: string, count: number) => string;
        transformData?: (item: {
          count: number;
          term: string;
          label?: string;
        }) => {
          count: number;
          term: string;
          label: string;
        };
      },
    ) => ChartDatum[];
    getFacetKey: (datum: any) => string;
  }
> = {
  pie: {
    mapFacetsToChartData,
    Component: PieChart,
    getFacetKey: d => d.id,
  },
  bar: {
    mapFacetsToChartData,
    Component: BarChart,
    getFacetKey: d => d.id,
  },
};
