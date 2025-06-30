import { TAB_FILTER_CONFIG, type TabId } from '../tab-filter-config';

/**
 * Get filter properties for a specific tab
 *
 * @param tabId - The tab identifier ('d' for dataset, 'ct' for computational tool)
 * @returns Array of filter property names for the specified tab
 */
export const getTabFilterProperties = (tabId: TabId): readonly string[] => {
  return TAB_FILTER_CONFIG[tabId] || TAB_FILTER_CONFIG.d;
};

/**
 * Get common filter properties that exist in both tabs
 *
 * @returns Array of filter property names that are common to both tabs
 */
export const getCommonFilterProperties = (): string[] => {
  const dFilters = new Set(TAB_FILTER_CONFIG.d);
  const ctFilters = new Set(TAB_FILTER_CONFIG.ct);
  return Array.from(dFilters).filter(filter => ctFilters.has(filter));
};
