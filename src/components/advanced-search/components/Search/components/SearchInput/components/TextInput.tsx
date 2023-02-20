import React, { useEffect } from 'react';
import { Box, Button } from 'nde-design-system';
import { PredictiveSearch } from 'src/components/search-with-predictive-text/components/PredictiveSearch';
import { useAdvancedSearchContext } from '../../AdvancedSearchFormContext';
import { wildcardQueryString } from 'src/components/advanced-search/utils/query-helpers';
import { usePredictiveSearch } from 'src/components/search-with-predictive-text';
import { checkBalancedPunctuation } from 'src/components/advanced-search/utils/validation-checks';
import { AdvancedSearchInputProps } from '../types';

export const TextInput: React.FC<AdvancedSearchInputProps> = ({
  colorScheme = 'primary',
  inputValue,
  isDisabled,
  size,
  errors,
  clearInputValue,
  setErrors,
  handleChange,
  handleClick,
  handleSubmit,
  renderSubmitButton,
  ...props
}) => {
  const stringInputValue = inputValue as string;
  const { queryValue, selectedSearchType } = useAdvancedSearchContext();

  const validateInput = (value: string) => {
    const errors = [];
    const isBalanced = checkBalancedPunctuation(value);
    if (!isBalanced.isValid) {
      isBalanced.error && errors.push(isBalanced.error);
    }
    setErrors(errors);
    return errors;
  };
  // Show predictive results based on input change.
  const predictiveSearch = usePredictiveSearch(
    stringInputValue,
    queryValue.field,
    true,
  );

  return (
    <Box width='100%'>
      {/* Input field with suggestions matching the search term. */}
      <PredictiveSearch
        ariaLabel='Search for datasets or tools'
        placeholder='Search for datasets or tools'
        colorScheme={colorScheme}
        size={size}
        inputValue={stringInputValue}
        isDisabled={isDisabled}
        isInvalid={errors.length > 0}
        onClose={
          stringInputValue.length
            ? () => {
                predictiveSearch.setSearchTerm('');
                clearInputValue();
                predictiveSearch.cancelRequest();
              }
            : undefined
        }
        onChange={value => {
          let searchTerm = value;
          // for exact search we still want the list of predictive options to be wildcarded.
          // https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/153
          if (selectedSearchType.id === 'exact') {
            searchTerm = wildcardQueryString({
              value,
              field: queryValue.field,
            });
          } else {
            if (selectedSearchType?.transformValue) {
              const transformed_term = selectedSearchType.transformValue({
                ...queryValue,
                term: value,
              });
              if (
                !Array.isArray(transformed_term) &&
                transformed_term?.querystring
              ) {
                searchTerm = transformed_term.querystring;
              }
            }
          }

          // Update the predictive search list;
          predictiveSearch.updateSearchTerm(searchTerm);
          handleChange(value);
          if (errors.length) {
            validateInput(value);
          }
        }}
        onClick={(term, field) => {
          /*
          Some search terms are an array of strings, e.g. ["term1", "term2"]. In this case we want to return 
          results that match either term1 or term2. This is the default though we may want to change this based
          on search type in the future.
          */
          if (Array.isArray(term)) {
            let querystring = `"${term.join('" OR "')}"`;
            return handleClick({
              querystring,
              term: querystring,
              field,
            });
          }

          // if a suggestion is clicked, we exact term that search.
          handleClick({ querystring: `"${term}"`, term: `"${term}"`, field });
        }}
        handleSubmit={(term, field) => {
          const input_string = Array.isArray(term) ? term.join(' ') : term;
          // 1. Check for errors.
          const errors = validateInput(input_string);
          if (errors.length > 0) {
            return;
          } else {
            // reset predictive search list.
            predictiveSearch.updateSearchTerm('');
            const result = selectedSearchType?.transformValue
              ? selectedSearchType.transformValue({
                  ...queryValue,
                  term,
                })
              : { querystring: term, term, field };
            handleSubmit(result);
          }
        }}
        renderSubmitButton={props =>
          renderSubmitButton ? (
            renderSubmitButton({
              ...props,
              isDisabled:
                (selectedSearchType.id !== '_exists_' &&
                  selectedSearchType.id !== '-_exists_' &&
                  inputValue === '') ||
                errors.length > 0,
            })
          ) : (
            <></>
          )
        }
        {...predictiveSearch}
        {...props}
      />
    </Box>
  );
};
