// Sorting configuration.
export const SORT_OPTIONS = [
  { name: 'Best Match', sortBy: '_score', orderBy: 'asc' },
  { name: 'Date: oldest to newest', sortBy: 'date', orderBy: 'asc' },
  { name: 'Date: newest to oldest', sortBy: 'date', orderBy: 'desc' },
  { name: 'A-Z', sortBy: 'name.raw', orderBy: 'asc' },
  { name: 'Z-A', sortBy: 'name.raw', orderBy: 'desc' },
] as const;
