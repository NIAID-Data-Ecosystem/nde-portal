import { SORT_OPTIONS } from './helpers';

export interface SortOptionsInterface {
  name: (typeof SORT_OPTIONS)[number]['name'];
  sortBy: (typeof SORT_OPTIONS)[number]['sortBy'];
  orderBy: (typeof SORT_OPTIONS)[number]['orderBy'];
}
