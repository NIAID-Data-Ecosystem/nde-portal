import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartDatum, ChartType, SearchState } from '../types';
import { FilterConfig } from '../../filters';
import {
  useAggregation,
  AggregationQueryParams,
} from 'src/views/search/hooks/useAggregation';
import { ALL_FACET_PROPERTIES } from '../../filters/config';
import { usePreferredChartType } from './usePreferredChartType';
import {
  bucketSmallValues,
  chartRegistry,
  DEFAULT_MORE_PARAMS,
  isMoreSlice,
} from '../helpers';
import { SelectedFilterValueType } from '../../filters/types';
import { queryFilterObject2String } from '../../filters/utils/query-string';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  useBioSampleAggregation,
  BIOSAMPLE_EXTRA_FILTER,
} from 'src/views/search/hooks/useBioSampleAggregation';
import { useComputationalToolAggregation } from 'src/views/search/hooks/useComputationalToolAggregation';
import { useSharedDatasetAggregation } from 'src/views/search/hooks/useSharedDatasetAggregation';
import { useDataCollectionAggregation } from 'src/views/search/hooks/useDataCollectionAggregation';

interface UseVisualizationDataParams {
  config: FilterConfig;
  searchState: SearchState;
  isActive: boolean;
  selectedFilters: SelectedFilterValueType[];
  onFilterUpdate?: (values: SelectedFilterValueType[], facet: string) => void;
}

/**
 * Selects the correct scoped aggregation response for a given filter config.
 *
 * This mirrors the same routing logic used in useFilterQueries so that the
 * visual summary charts always reflect the same scoped counts as the filters
 * panel:
 *
 *   - "Sample": bioSampleAggregationData
 *       (@type:Sample AND additionalType:"BioSample")
 *   - "Computational Tool": computationalToolAggregationData
 *       (@type:ComputationalTool)
 *   - "Shared / Dataset": sharedDatasetAggregationData
 *       (all types except non-BioSample Sample records)
 *   - "Data Collection": dataCollectionAggregationData
 *       (@type:DataCollection)
 *   - anything else: main (unscoped) aggregation as fallback
 */
const selectAggregationForConfig = (
  config: FilterConfig,
  mainResponse: FetchSearchResultsResponse | undefined,
  bioSampleData: FetchSearchResultsResponse | undefined,
  computationalToolData: FetchSearchResultsResponse | undefined,
  sharedDatasetData: FetchSearchResultsResponse | undefined,
  dataCollectionData: FetchSearchResultsResponse | undefined,
): FetchSearchResultsResponse | undefined => {
  switch (config.category) {
    case 'Sample':
      return bioSampleData ?? mainResponse;
    case 'Computational Tool':
      return computationalToolData ?? mainResponse;
    case 'Shared / Dataset':
      return sharedDatasetData ?? mainResponse;
    case 'Data Collection':
      return dataCollectionData ?? mainResponse;
    default:
      return mainResponse;
  }
};

export const useVisualizationData = ({
  config,
  searchState,
  isActive,
  selectedFilters,
  onFilterUpdate,
}: UseVisualizationDataParams) => {
  // Drill stack to manage "More" drill-downs.
  const [drillStack, setDrillStack] = useState<ChartDatum[][]>([]);

  // If no chart config, return early with empty state
  const hasChartConfig = !!config.chart;

  // Use preferred chart type hook to manage user preference.
  const [preferredChartType, setPreferredChartType] = usePreferredChartType(
    config.id,
    config.chart?.defaultOption,
  );

  // Clamp preference to what's allowed (in case options changed)
  const chartType = useMemo<ChartType | undefined>(() => {
    if (!config.chart || !preferredChartType)
      return config.chart?.defaultOption;
    const availableOptions = config.chart.availableOptions;
    return availableOptions.includes(preferredChartType)
      ? preferredChartType
      : config.chart.defaultOption;
  }, [preferredChartType, config.chart]);

  const filterProperty = config.filterProperty || config.property;
  const isHistogramChart =
    chartType === 'histogram' || config.queryType === 'histogram';

  const extraFilter = useMemo(
    () => queryFilterObject2String(searchState.filters) || '',
    [searchState.filters],
  );

  // Shared params used by all scoped aggregation hooks.
  // Kept in a single memo so all hooks receive a stable reference.
  const scopedAggParams = useMemo(
    () => ({
      q: searchState.q || '',
      extra_filter: extraFilter,
      use_ai_search: searchState.use_ai_search ?? 'false',
      advancedSearch: searchState.advancedSearch,
    }),
    [
      searchState.q,
      extraFilter,
      searchState.use_ai_search,
      searchState.advancedSearch,
    ],
  );

  // Each hook is scoped to a specific record type, mirroring the filter panel.
  // React Query deduplicates these against the identical calls already made by
  // the filters panel (Filters component), so no extra network requests are
  // fired (data is served from cache).

  // Sample filters: @type:Sample AND additionalType:"BioSample"
  const bioSampleAgg = useBioSampleAggregation(scopedAggParams, {
    enabled: isActive && hasChartConfig,
  });

  // Computational Tool filters: @type:ComputationalTool
  const computationalToolAgg = useComputationalToolAggregation(
    scopedAggParams,
    {
      enabled: isActive && hasChartConfig,
    },
  );

  // Shared/Dataset filters: all types except non-BioSample Sample records
  const sharedDatasetAgg = useSharedDatasetAggregation(scopedAggParams, {
    enabled: isActive && hasChartConfig,
  });

  // Data Collection filters: @type:DataCollection
  const dataCollectionAgg = useDataCollectionAggregation(scopedAggParams, {
    enabled: isActive && hasChartConfig,
  });

  // Kept as a fallback and for cache-warming. Always requests ALL facet
  // properties + hist=date so the query key is stable.
  const aggParams: AggregationQueryParams = useMemo(
    () => ({
      q: searchState.q || '',
      extra_filter: extraFilter,
      facets: ALL_FACET_PROPERTIES,
      use_ai_search: searchState.use_ai_search ?? 'false',
      advancedSearch: searchState.advancedSearch,
      hist: 'date',
    }),
    [
      searchState.q,
      extraFilter,
      searchState.use_ai_search,
      searchState.advancedSearch,
    ],
  );

  // Main aggregation: used as fallback when no scoped response is available,
  // and for the date histogram (which spans all types).
  const aggQuery = useAggregation({
    params: aggParams,
    enabled: isActive && hasChartConfig,
  });

  // The active response is the category-scoped one when available, falling
  // back to the main aggregation. This ensures chart counts match the filter
  // panel counts exactly.
  const activeAggResponse = useMemo(
    () =>
      selectAggregationForConfig(
        config,
        aggQuery.data,
        bioSampleAgg.data,
        computationalToolAgg.data,
        sharedDatasetAgg.data,
        dataCollectionAgg.data,
      ),
    [
      config,
      aggQuery.data,
      bioSampleAgg.data,
      computationalToolAgg.data,
      sharedDatasetAgg.data,
      dataCollectionAgg.data,
    ],
  );

  // Derive loading/fetching state from the scoped hook that is actually used
  // for this config, so the loading spinner reflects the right request.
  const activeScopedQuery = useMemo(() => {
    switch (config.category) {
      case 'Sample':
        return bioSampleAgg;
      case 'Computational Tool':
        return computationalToolAgg;
      case 'Shared / Dataset':
        return sharedDatasetAgg;
      case 'Data Collection':
        return dataCollectionAgg;
      default:
        return aggQuery;
    }
  }, [
    config.category,
    bioSampleAgg,
    computationalToolAgg,
    sharedDatasetAgg,
    dataCollectionAgg,
    aggQuery,
  ]);

  const aggData = {
    data: activeAggResponse,
    isLoading: activeScopedQuery.isLoading,
    isFetching: activeScopedQuery.isFetching,
    isPlaceholderData: activeScopedQuery.isPlaceholderData,
    isError: activeScopedQuery.isError,
    refetch: activeScopedQuery.refetch,
  };

  // Normalize aggregated data for charts.
  // Histogram uses facets.hist_dates (from hist=date) and keeps full bucket set.
  // Other charts use facet terms and are capped to 100 for readability/perf.
  const dateHistogramTerms = useMemo(
    () => aggQuery.data?.facets?.hist_dates?.terms,
    [aggQuery.data],
  );

  const facetTerms = useMemo(
    () => activeAggResponse?.facets?.[config.property]?.terms,
    [activeAggResponse, config.property],
  );

  const chartTerms = useMemo(() => {
    if (isHistogramChart) {
      return dateHistogramTerms;
    }
    return facetTerms?.slice(0, 100);
  }, [isHistogramChart, dateHistogramTerms, facetTerms]);

  const chartTermsLength = chartTerms?.length ?? 0;
  const availableOptionsKey = useMemo(
    () => config.chart?.availableOptions?.join('|') ?? '',
    [config.chart?.availableOptions],
  );

  const formatChartLabel = useCallback(
    (term: string, count: number) => {
      if (chartType === 'bar') return term;
      if (isHistogramChart) return term.split('-')[0] || term;
      return `${term} (${count.toLocaleString()})`;
    },
    [chartType, isHistogramChart],
  );

  // Format chart data.
  const chartAdapter = chartType ? chartRegistry[chartType] : null;
  const chartData = useMemo(() => {
    if (!chartAdapter || !chartTerms) return null;
    return chartAdapter.mapFacetsToChartData(chartTerms, {
      formatLabel: formatChartLabel,
      transformData: config.transformData,
    });
  }, [chartTerms, chartAdapter, formatChartLabel, config.transformData]);

  // Current level data based on drill stack.
  const currentLevelData = useMemo(() => {
    return drillStack.length ? drillStack[drillStack.length - 1] : chartData;
  }, [chartData, drillStack]);

  // Bucket small values into "More"
  const { bucketedData, tail } = useMemo(() => {
    if (!chartType || !config.chart) return { bucketedData: [], tail: [] };
    if (isHistogramChart) {
      // For histograms, we don't want to bucket small values, so return early.
      return { bucketedData: currentLevelData || [], tail: [] };
    }
    const chartTypeConfig = config.chart[chartType] || {};
    const { data, tail } = bucketSmallValues(currentLevelData || [], {
      ...chartTypeConfig,
      moreLabel: DEFAULT_MORE_PARAMS.moreLabel,
    });

    return { bucketedData: data, tail };
  }, [currentLevelData, config.chart, chartType, isHistogramChart]);

  // If the query/config changes, reset drill mode
  useEffect(() => {
    setDrillStack([]);
  }, [config.id, config.property, chartType, chartTermsLength, config.chart]);

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart || !preferredChartType) return;
    const availableOptions = config.chart.availableOptions;
    if (!availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [
    config.chart,
    availableOptionsKey,
    preferredChartType,
    setPreferredChartType,
  ]);

  // Handler for back navigation in drill stack.
  const handleBack = useCallback(() => {
    setDrillStack(stack => stack.slice(0, -1));
  }, []);

  // Helper function to check if a slice is selected
  const isSliceSelected = useCallback(
    (id: string) => {
      return selectedFilters.some(filter => {
        if (typeof filter === 'string') {
          return filter === id;
        }
        return false;
      });
    },
    [selectedFilters],
  );

  // Handler for slice clicks in the chart.
  const handleSliceClick = useCallback(
    (id: string) => {
      if (isMoreSlice(id)) {
        if (tail.length > 0) {
          setDrillStack(stack => [...stack, tail]);
        }
        return;
      }

      // If slice is already selected, remove it; otherwise add it
      const isSelected = isSliceSelected(id);

      if (isSelected) {
        // Remove the filter - filter out this id from the existing filters
        const newFilters = selectedFilters.filter(filter =>
          typeof filter === 'string' ? filter !== id : true,
        );

        onFilterUpdate?.(newFilters, filterProperty);
      } else {
        // Add the filter
        const newFilters = Array.from(new Set([...selectedFilters, id]));
        onFilterUpdate?.(newFilters, filterProperty);
      }
    },
    [tail, onFilterUpdate, filterProperty, isSliceSelected, selectedFilters],
  );

  return {
    aggData,
    chartType,
    chartAdapter,
    bucketedData,
    drillStack,
    facetData: chartTerms,
    hasEmptyData: chartTerms?.length === 0,
    handleBack,
    handleSliceClick,
    isSliceSelected,
    setPreferredChartType,
  };
};
