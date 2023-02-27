import { QueryValue } from 'src/components/advanced-search/types';
import { SearchTypesConfigProps } from '../../search-types-config';

export const filterSearchTypes = (
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
