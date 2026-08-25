import { QueryValue } from 'src/components/advanced-search/types';

import { SearchTypesConfigProps } from '../../search-types-config';

/**
 * The search types a user could actually pick for this query.
 *
 * Excludes disabled types as well as omitted ones, which is what separates it
 * from the filter in ./index.tsx: the picker renders disabled types greyed out,
 * while a default search type has to be one the user can select.
 */
export const getSelectableSearchTypes = (
  searchTypeOptions: SearchTypesConfigProps[],
  query: QueryValue,
) => {
  return searchTypeOptions.filter(searchType => {
    if (searchType.shouldOmit && searchType.shouldOmit(query)) {
      return false;
    }
    if (searchType.shouldDisable && searchType.shouldDisable(query)) {
      return false;
    }
    return true;
  });
};
