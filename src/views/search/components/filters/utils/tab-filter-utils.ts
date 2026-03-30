import { TabType } from 'src/views/search/types';
import { tabs } from 'src/views/search/config/tabs';

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
