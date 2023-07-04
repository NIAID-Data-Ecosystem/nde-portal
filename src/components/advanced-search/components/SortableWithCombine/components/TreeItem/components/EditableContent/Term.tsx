import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  SearchInput,
  useAdvancedSearchContext,
} from 'src/components/advanced-search/components/Search';
import { getDateQuerystring } from 'src/components/advanced-search/components/Search/components/SearchInput/helpers';
import { SearchInputProps } from 'src/components/advanced-search/components/Search/components/SearchInput/types';
import { QueryStringError } from 'src/components/advanced-search/utils/validation-checks';
import { ItemContentProps } from '.';
import { transformQueryString } from '../../helpers';

export const TermLabel = React.memo(
  ({
    term,
    querystring,
    errors,
    handleValidation,
  }: {
    term: ItemContentProps['value']['term'];
    querystring: ItemContentProps['value']['querystring'];
    errors: QueryStringError[];
    handleValidation: (value: string) => QueryStringError[];
  }) => {
    const { updateQueryValue, selectedFieldDetails, selectedSearchType } =
      useAdvancedSearchContext();

    const [inputValue, setInputValue] = useState<
      SearchInputProps['defaultInputValue']
    >(() => transformQueryString(querystring, selectedFieldDetails?.type));

    const [inputTerm, setTerm] = useState<string>(term || '');

    const handleChange = useCallback(
      (updated: any) => {
        setInputValue(updated.value);
        updated.term && setTerm(updated.term);

        // Update errors as user changes input
        if (errors.length > 0) {
          typeof updated.value === 'string' && handleValidation(updated.value);
        }
      },
      [errors.length, handleValidation],
    );

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
        errors={errors}
        onSubmit={() => {}}
        setErrors={() => {}}
        setResetForm={() => {}}
      />
    );
  },
);
