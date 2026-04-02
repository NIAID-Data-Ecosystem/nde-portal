import { FilterConfig } from '../../types';

// Helper function to group filters by category
export const groupFiltersByCategory = (filtersList: FilterConfig[]) => {
  const groups = new Map<string, FilterConfig[]>();

  filtersList.forEach(filter => {
    const group = groups.get(filter.category) || [];
    group.push(filter);
    groups.set(filter.category, group);
  });

  return Array.from(groups.entries()).map(([category, filters]) => ({
    category,
    filters,
  }));
};

// Helper function to filter grouped filters by search term
export const filterGroupsBySearchTerm = (
  groups: { category: string; filters: FilterConfig[] }[],
  searchTerm: string,
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return groups;
  }

  return groups
    .map(group => ({
      ...group,
      filters: group.filters.filter(filter =>
        filter.name.toLowerCase().includes(normalizedSearch),
      ),
    }))
    .filter(group => group.filters.length > 0);
};
