import { Select, VisuallyHidden } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useAdvancedSearchContext } from 'src/components/advanced-search/components/Search';
import { SearchTypesConfigProps } from 'src/components/advanced-search/components/Search/search-types-config';
import { QueryValue } from 'src/components/advanced-search/types';
import { ItemContentProps } from '.';
import { getSearchOptionsForField, getSearchType } from '../../helpers';

export const SearchLabel = ({
  value,
  options,
}: {
  value: ItemContentProps['value'];
  options: SearchTypesConfigProps[];
}) => {
  const { queryValue, selectedSearchType, setSelectedSearchType } =
    useAdvancedSearchContext();

  // Search Options change depending on what field is selected.
  const getSearchOptionsList = useCallback(
    (query: Partial<QueryValue>) => getSearchOptionsForField(query, options),
    [options],
  );

  const [searchOptions, setSearchOptions] = useState(
    getSearchOptionsList(value),
  );

  // The search options change depending on what field is selected
  useEffect(() => {
    setSearchOptions(getSearchOptionsList(queryValue));
  }, [getSearchOptionsList, queryValue]);

  // When the value changes, update the selected search type
  useEffect(() => {
    const updatedValue = getSearchType(queryValue, searchOptions);
    updatedValue && setSelectedSearchType(updatedValue);
  }, [searchOptions, setSelectedSearchType, queryValue]);

  return (
    <>
      <VisuallyHidden>
        <label id='field-select-label'>Select field</label>
      </VisuallyHidden>
      <Select
        aria-labelledby='field-select-label'
        size='sm'
        w='170px'
        variant='outline'
        borderRadius='semi'
        mb={2}
        _focus={{ borderColor: 'page.placeholder' }}
        _hover={{ bg: 'page.alt' }}
        value={selectedSearchType.id}
        onChange={e => {
          const searchType = searchOptions.find(
            ({ id }) => id === e.target.value,
          );
          if (searchType) {
            setSelectedSearchType(searchType);
          }
        }}
      >
        {/* <option value={'None'}>None</option> */}
        {searchOptions.map(option => {
          return (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          );
        })}
      </Select>
    </>
  );
};
