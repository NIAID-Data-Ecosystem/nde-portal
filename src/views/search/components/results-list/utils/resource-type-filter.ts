import { SelectedFilterValueType } from '../../filters/types';

/*
 * Returns the `@type` values a results section queries with.
 *
 * A section only lists records of its own `sectionTypes`, so the selected
 * `@type` filter narrows those types rather than replacing them. Querying with
 * every selected type (e.g. after "Select all" in the search bar) returns a
 * page of mixed types that the section then trims to its own, often leaving
 * nothing to show.
 *
 * When the selected types exclude all of the section's types, they are
 * returned unchanged: the query then matches none of the section's records, so
 * the section is correctly empty.
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
