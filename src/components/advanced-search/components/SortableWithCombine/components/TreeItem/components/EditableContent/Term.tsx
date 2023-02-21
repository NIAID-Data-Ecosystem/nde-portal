import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  SearchInput,
  useAdvancedSearchContext,
} from 'src/components/advanced-search/components/Search';
import { getDateQuerystring } from 'src/components/advanced-search/components/Search/components/SearchInput/helpers';
import { SearchInputProps } from 'src/components/advanced-search/components/Search/components/SearchInput/types';
import { ItemContentProps } from '.';
import { transformQueryString } from '../../helpers';

export const TermLabel = React.memo(
  ({
    term,
    querystring,
  }: {
    term: ItemContentProps['value']['term'];
    querystring: ItemContentProps['value']['querystring'];
  }) => {
    const { updateQueryValue, selectedFieldDetails, selectedSearchType } =
      useAdvancedSearchContext();

    const [inputValue, setInputValue] = useState<
      SearchInputProps['defaultInputValue']
    >(() => transformQueryString(querystring, selectedFieldDetails?.type));

    const [inputTerm, setTerm] = useState<string>(term || '');

    const handleChange = useCallback(updated => {
      setInputValue(updated.value);
      setTerm(updated.term);
    }, []);

    useEffect(() => {
      if (
        selectedSearchType.id !== '_exists_' &&
        selectedSearchType.id !== '-_exists_'
      ) {
        if (typeof inputValue === 'string') {
          const updatedQuery = {
            term: inputTerm || inputValue,
            querystring: inputValue,
          };
          updateQueryValue({
            ...updatedQuery,
            field: selectedFieldDetails?.property,
          });
        } else if (typeof inputValue === 'object') {
          const { term, querystring } = getDateQuerystring(inputValue);
          updateQueryValue({
            term,
            querystring,
            field: selectedFieldDetails?.property,
          });
        }
      }
    }, [
      inputTerm,
      inputValue,
      selectedFieldDetails,
      selectedSearchType,
      updateQueryValue,
    ]);

    return (
      <SearchInput
        size='sm'
        defaultInputValue={inputValue}
        onChange={handleChange}
        hideSuggestions={true}
        resetForm={false}
        errors={[]}
        onSubmit={() => {}}
        setErrors={() => {}}
        setResetForm={() => {}}
      />
    );
  },
);
