import { TabType } from '../types';

interface TypeCount {
  type: string;
  count: number;
}

// Priority order: Dataset/ResourceCatalog (same priority), ComputationalTool
const PRIORITY_ORDER = {
  Dataset: 1,
  ResourceCatalog: 1,
  ComputationalTool: 2,
};

/**
 * Determines which tab should be active based on search results and user-selected filters
 *
 * Priority rules:
 *   If user selects only one resource type, show that tab (even if 0 results)
 *   If user selects multiple resource types:
 *     a. If any selected type has results, show highest priority selected type with results
 *     b. If all selected types have 0 results, show highest priority selected type (even with 0)
 *   If no type filters are selected, show highest priority tab with results
 *   If there are no results at all, default to "d" tab
 */
export const getDefaultTabId = (
  tabs: TabType[],
  facetCounts: TypeCount[],
  selectedTypes: string[] = [],
): TabType['id'] => {
  // Helper function to get priority (lower number = higher priority)
  const getPriority = (type: string): number => {
    return PRIORITY_ORDER[type as keyof typeof PRIORITY_ORDER] || 999;
  };

  // Helper function to get count for a type
  const getCount = (type: string): number => {
    const count = facetCounts.find(f => f.type === type)?.count || 0;
    return count;
  };

  // Helper function to find the tab containing a specific type
  const findTabForType = (type: string): TabType | undefined => {
    return tabs.find(tab => tab.types.some(t => t.type === type));
  };

  // Case 1: User selected specific types
  if (selectedTypes.length > 0) {
    // Case 1a: Only one type selected -> always show that tab
    if (selectedTypes.length === 1) {
      const tab = findTabForType(selectedTypes[0]);
      const result = tab?.id || tabs.find(t => t.isDefault)?.id || 'd';
      return result;
    }

    // Case 1b: Multiple types selected
    // Sort selected types by priority
    const sortedSelectedTypes = [...selectedTypes].sort(
      (a, b) => getPriority(a) - getPriority(b),
    );
    // Check if any selected type has results
    const hasAnyResults = sortedSelectedTypes.some(type => getCount(type) > 0);

    if (hasAnyResults) {
      // Find highest priority selected type with results
      const typeWithResults = sortedSelectedTypes.find(
        type => getCount(type) > 0,
      );
      if (typeWithResults) {
        const tab = findTabForType(typeWithResults);
        const result = tab?.id || tabs.find(t => t.isDefault)?.id || 'd';
        return result;
      }
    } else {
      // All selected types have 0 results -> use highest priority selected type
      const tab = findTabForType(sortedSelectedTypes[0]);
      const result = tab?.id || tabs.find(t => t.isDefault)?.id || 'd';
      return result;
    }
  }

  // Case 2: No type filters -> show highest priority tab with results
  // Get all unique types across all tabs, sorted by priority
  const allTypes = Array.from(
    new Set(tabs.flatMap(tab => tab.types.map(t => t.type))),
  ).sort((a, b) => getPriority(a) - getPriority(b));

  // Find the highest priority type with results
  for (const type of allTypes) {
    if (getCount(type) > 0) {
      const tab = findTabForType(type);
      if (tab) {
        return tab.id;
      }
    }
  }

  // Case 3: No results at all -> default to "d" tab
  return tabs.find(t => t.isDefault)?.id || 'd';
};
