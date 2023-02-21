import React, { useEffect, useState } from 'react';
import { Flex } from 'nde-design-system';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import {
  DateInputGroup,
  EnumInput,
  NumberInput,
  TextInput,
} from './components/';
import { QueryValue } from 'src/components/advanced-search/types';
import { formatType } from 'src/utils/api/helpers';
import { SearchInputProps } from './types';

export const SearchInput: React.FC<SearchInputProps> = ({
  defaultInputValue = '',
  errors,
  hideSuggestions = false,
  resetForm,
  size,
  onChange,
  onSubmit,
  renderSubmitButton,
  setErrors,
  setResetForm,
}) => {
  const {
    queryValue,
    selectedFieldDetails,
    selectedSearchType,
    updateQueryValue,
  } = useAdvancedSearchContext();

  const [inputType, setInputType] = useState<
    'number' | 'string' | 'date' | 'enum' | 'boolean'
  >('string');

  const [inputValue, setInputValue] =
    useState<SearchInputProps['defaultInputValue']>(defaultInputValue);

  const handleSubmit = (value: Partial<QueryValue>) => {
    setInputValue(defaultInputValue);

    const updatedQuery = { ...queryValue, ...value };

    // For "exists" type queries, we want a format of _exists_: {field} or -_exists_:{field}
    // so the exists keyword is set as field parameter
    // and the field is set as the querystring parameter.
    if (
      selectedSearchType.id === '_exists_' ||
      selectedSearchType.id === '-_exists_'
    ) {
      if (selectedSearchType.transformValue) {
        onSubmit(selectedSearchType.transformValue(queryValue));
      }
    } else {
      onSubmit(updatedQuery);
    }
  };

  // If form is reset, clear input value.
  useEffect(() => {
    if (resetForm) {
      setInputValue('');
      updateQueryValue({ term: '', querystring: '', field: '', union: '' });
    }
    return () => {
      setResetForm(false);
    };
  }, [resetForm, setResetForm, updateQueryValue]);

  // Determine input type based on field type.
  useEffect(() => {
    setInputType(() => {
      if (selectedFieldDetails?.enum) {
        return 'enum';
      } else if (selectedFieldDetails?.type === 'boolean') {
        return 'boolean';
      } else if (selectedFieldDetails?.format === 'date') {
        return 'date';
      } else if (
        selectedFieldDetails?.type === 'unsigned_long' ||
        selectedFieldDetails?.type === 'integer' ||
        selectedFieldDetails?.type === 'double' ||
        selectedFieldDetails?.type === 'float'
      ) {
        return 'number';
      }
      return 'string';
    });
  }, [selectedFieldDetails]);

  // if input type changes, clear input value.
  useEffect(() => {
    setInputValue(defaultInputValue);
  }, [inputType, defaultInputValue]);

  const inputProps = {
    size,
    inputValue,
    clearInputValue: () => {
      setInputValue('');
      setErrors([]);
    },
    // Input is disabled when a search option that doesn't require text input is selected.
    isDisabled:
      selectedSearchType.id === '_exists_' ||
      selectedSearchType.id === '-_exists_',
    errors,
    setErrors,
    handleChange: (queryObject: {
      value: typeof inputValue;
      term?: string;
      querystring?: string;
    }) => {
      setInputValue(queryObject.value || '');
      onChange && onChange(queryObject);
    },

    handleSubmit,
    handleClick: handleSubmit,
    renderSubmitButton,
  };

  return (
    <>
      <Flex flexDirection='column' flex={1}>
        {/* [date]: Two date type inputs. */}
        {inputType === 'date' ? <DateInputGroup {...inputProps} /> : <></>}
        {/* [enum]: Select/Option Component. */}
        {inputType === 'enum' ? (
          <EnumInput
            options={selectedFieldDetails?.enum?.map(value => {
              // [@type] needs to be formatted to the terms we use in the UI.
              if (selectedFieldDetails.property === '@type') {
                return { label: formatType(value), value };
              }
              return { label: value, value };
            })}
            {...inputProps}
          />
        ) : (
          <></>
        )}
        {/* [boolean]: Select/Option Component. */}
        {inputType === 'boolean' ? (
          <EnumInput
            options={[
              {
                label: 'Yes',
                value: 'true',
              },
              {
                label: 'No',
                value: 'false',
              },
            ]}
            {...inputProps}
          />
        ) : (
          <></>
        )}
        {/* [number]: Number input */}
        {inputType === 'number' ? (
          <NumberInput {...inputProps}></NumberInput>
        ) : (
          <></>
        )}
        {/* [string]: Text input */}
        {inputType === 'string' ? (
          <TextInput hideSuggestions={hideSuggestions} {...inputProps} />
        ) : (
          <></>
        )}
      </Flex>
    </>
  );
};
