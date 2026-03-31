/**
 * Simplified filter term representing a single filterable value
 */
export interface FilterTermType {
  term: string;
  label: string;
  count: number;
  groupBy?: string;
  facet?: string;
}

/**
 * Filter item extends FilterTermType with header support for grouped lists
 */
export interface FilterItem extends FilterTermType {
  isHeader?: boolean;
}

/**
 * Selected filter value - can be a string or an object for exists/not-exists queries
 */
export type SelectedFilterValueType = string | { [key: string]: string[] };

/**
 * Currently selected filters keyed by filter property
 */

export interface SelectedFilterType {
  [property: string]: SelectedFilterValueType[];
}
/**
 * Query type determines how the filter query is built
 * - 'facet': Regular facet query with exists/not-exists options
 * - 'source': Special query that includes source metadata
 * - 'histogram': Date histogram query
 */
export type FilterQueryType = 'facet' | 'source' | 'histogram';

/**
 * Chart types available for visualizations
 */
export type ChartType = 'pie' | 'bar' | 'histogram';

/**
 * Filter category types available for grouping filters in the UI
 */
export type FilterCategory =
  | 'Shared / Dataset'
  | 'Dataset'
  | 'Computational Tool'
  | 'Sample';

/**
 * Configuration for individual chart types (e.g., bar, pie)
 */
export interface ChartTypeConfig {
  maxItems?: number;
  minPercent?: number;
}

/**
 * Visualization chart configuration
 */
export interface ChartConfig {
  availableOptions: ChartType[];
  defaultOption: ChartType;
  bar?: ChartTypeConfig;
  pie?: ChartTypeConfig;
  histogram?: ChartTypeConfig;
}

/**
 * Simplified filter configuration - no more createQueries function!
 * The query building logic is now handled internally by the hook based on `queryType`
 */
export interface FilterConfig {
  /** Unique identifier for the filter */
  id: string;
  /** Display name for the filter */
  name: string;
  /** The API property to query/aggregate data (e.g., 'sourceOrganization.name.raw') */
  property: string;
  /** Property to categorize filters in the UI */
  category: FilterCategory;
  /** Optional: The property to use for filtering, if different from property (e.g., 'sourceOrganization.name') */
  filterProperty?: string;
  /** Tooltip description */
  description: string;
  /** Query type determines how the API query is built */
  queryType: FilterQueryType;
  /** Optional: Whether the filter is open by default */
  isDefaultOpen?: boolean;
  /** Optional: Grouping configuration for terms */
  groupBy?: { property: string; label: string }[];
  /** Optional: Whether to show "No {facet}" option (defaults to true) */
  showMissing?: boolean;
  /** Optional: Chart configuration for visualizations */
  chart?: ChartConfig;
  /** Optional: Transform function for visualization data */
  transformData?: (item: { count: number; term: string; label?: string }) => {
    count: number;
    term: string;
    label: string;
  };
  /** IDs of tabs where this filter should be shown */
  tabIds?: string[];
}

/**
 * Filter query results for a single filter
 */
export interface FilterQueryResult {
  id: string;
  terms: FilterTermType[];
  /** Alias for terms - used by DateFilter */
  data: FilterTermType[];
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Combined results for all filters
 */
export interface FilterResults {
  [filterId: string]: FilterQueryResult;
}
