import { NativeSelect, VisuallyHidden } from '@chakra-ui/react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useAdvancedSearchContext } from 'src/components/advanced-search/components/Search';
import { SearchTypesConfigProps } from 'src/components/advanced-search/components/Search/search-types-config';
import { QueryValue } from 'src/components/advanced-search/types';

import { getSearchOptionsForField, getSearchType } from '../../helpers';
import { ItemContentProps } from '.';

export const SearchLabel = ({
  value,
  options,
}: {
  value: ItemContentProps['value'];
  options: SearchTypesConfigProps[];
}) => {
  // Several items can be in edit mode at once, so the label id must be unique.
  const labelId = useId();
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
        <label id={labelId}>Select search type</label>
      </VisuallyHidden>
      {/* The width goes on the root: it is `width: 100%` by default, which
      leaves the indicator at the far edge of the row, away from the field. */}
      <NativeSelect.Root size='sm' variant='outline' w='170px' mb={2}>
        <NativeSelect.Field
          aria-labelledby={labelId}
          borderRadius='semi'
          _focus={{ borderColor: 'text.placeholder' }}
          _hover={{ bg: 'bg.alt' }}
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
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </>
  );
};
