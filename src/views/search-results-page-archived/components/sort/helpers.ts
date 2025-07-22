// Sorting configuration.
export const SORT_OPTIONS = [
  { name: 'Best Match', sortBy: '_score', orderBy: 'asc' },
  { name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc' },
  { name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc' },
  { name: 'A-Z', sortBy: 'name.raw', orderBy: 'asc' },
  { name: 'Z-A', sortBy: 'name.raw', orderBy: 'desc' },
] as const;

export interface SortOptionsInterface {
  name: (typeof SORT_OPTIONS)[number]['name'];
  sortBy: (typeof SORT_OPTIONS)[number]['sortBy'];
  orderBy: (typeof SORT_OPTIONS)[number]['orderBy'];
}
