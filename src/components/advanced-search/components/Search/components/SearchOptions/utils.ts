import { QueryValue } from 'src/components/advanced-search/types';
import { SearchTypesConfigProps } from '../../search-types-config';

export const filterSearchTypes = (
  searchTypeOptions: SearchTypesConfigProps[],
  field: QueryValue['field'],
) => {
  return searchTypeOptions.filter(searchType => {
    if (searchType.shouldOmit && searchType.shouldOmit(field)) {
      return false;
    }
    if (searchType.shouldDisable && searchType.shouldDisable(field)) {
      return false;
    }
    return true;
  });
};
