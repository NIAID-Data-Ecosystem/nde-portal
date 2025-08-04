import { TabType } from 'src/views/search/types';
import { FILTER_CONFIGS } from '../config';
import { tabs } from 'src/views/search/config/tabs';

/**
 * Get filter properties for a specific tab
 *
 * @param tabId - The tab identifier ('d' for dataset, 'ct' for computational tool)
 * @returns Array of filter property names for the specified tab
 */
export const getTabFilterProperties = (tabId: TabType['id']) =>
  FILTER_CONFIGS.filter(f => f.tabIds?.includes(tabId)).map(f => f.property);

/**
 * Get common filter properties that exist in both tabs
 *
 * @returns Array of filter property names that are common to both tabs
 */
export const getCommonFilterProperties = (): string[] =>
  FILTER_CONFIGS.filter(
    f => f.tabIds?.includes('d') && f.tabIds?.includes('ct'),
  ).map(f => f.property);

/**
 * Get the tab ID from a type label
 * @param typeLabel - The label of the type (e.g., 'Dataset', 'ComputationalTool')
 * @returns The tab ID if found, otherwise undefined
 */
export const getTabIdFromTypeLabel = (
  type: string,
): TabType['id'] | undefined => {
  return (
    tabs.find(tab => tab.types.some(tabType => tabType.type === type))?.id ||
    undefined
  );
};
