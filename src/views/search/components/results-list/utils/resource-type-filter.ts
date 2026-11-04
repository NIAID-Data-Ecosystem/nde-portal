import {
  SelectedFilterType,
  SelectedFilterValueType,
} from '../../filters/types';

/*
 * Returns the `@type` values a results section queries with.
 *
 * When loading a specific tab type, only consider this section's types for the `@type` filter.
 * example:
 * getSectionTypeFilter(['Sample'], ['Dataset', 'Sample']) returns ['Sample'] when on the Sample page
 *
 */
export const getSectionTypeFilter = (
  sectionTypes: string[],
  selectedTypes: SelectedFilterValueType[] = [],
): SelectedFilterValueType[] => {
  if (selectedTypes.length === 0) return sectionTypes;

  const matchingTypes = sectionTypes.filter(type =>
    selectedTypes.includes(type),
  );

  return matchingTypes.length > 0 ? matchingTypes : selectedTypes;
};

/*
 * Returns the filters a results section queries with: the selected filters,
 * with `@type` scoped by `getSectionTypeFilter`.
 *
 * Anything that prefetches a section's results must build its filters here
 * too. The serialized filters are part of the query key, so building them any
 * other way gives a key the section never reads.
 */
export const getSectionFilters = (
  sectionTypes: string[],
  selectedFilters: SelectedFilterType = {},
): SelectedFilterType => ({
  ...selectedFilters,
  '@type': getSectionTypeFilter(sectionTypes, selectedFilters['@type']),
});
