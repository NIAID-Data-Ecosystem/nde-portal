import React, { useEffect, useState } from 'react';
import {
  Flex,
  InputProps,
  ListItem,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import { TreeItem } from 'src/components/advanced-search/components/SortableWithCombine';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import {
  DateInputGroup,
  EnumInput,
  InputSubmitButton,
  InputSubmitButtonProps,
  NumberInput,
  TextInput,
} from './components/';
import { QueryValue } from 'src/components/advanced-search/types';
import { QueryStringError } from 'src/components/advanced-search/utils/validation-checks';
import { FieldSelectWithContext } from '../FieldSelect';
import { formatType } from 'src/utils/api/helpers';

interface SearchInputProps {
  colorScheme?: InputProps['colorScheme'];
  size: InputProps['size'];
  items: TreeItem[];
  resetForm: boolean;
  onSubmit: (args: QueryValue | QueryValue[]) => void;
  setResetForm: (arg: boolean) => void;
}
export const SearchInput: React.FC<SearchInputProps> = ({
  colorScheme = 'primary',
  items,
  size,
  onSubmit,
  resetForm,
  setResetForm,
}) => {
  const { queryValue, selectedFieldDetails, selectedSearchType } =
    useAdvancedSearchContext();

  const [errors, setErrors] = useState<QueryStringError[]>([]);
  const [inputType, setInputType] = useState<
    'number' | 'string' | 'date' | 'enum' | 'boolean'
  >('string');

  const [inputValue, setInputValue] = useState<
    string | number | { startDate: string; endDate: string }
  >('');

  const handleSubmit = (value: Partial<QueryValue> | QueryValue[]) => {
    setInputValue('');

    if (Array.isArray(value)) {
      onSubmit(value);
      return;
    }
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
      setErrors([]);
    }
    return () => {
      setResetForm(false);
    };
  }, [resetForm, setResetForm]);

  // clear errors when field is changed.
  useEffect(() => {
    setErrors([]);
  }, [queryValue.field]);

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
    setInputValue('');
  }, [inputType]);

  const inputProps = {
    size,
    inputValue,
    clearInputValue: () => setInputValue(''),
    colorScheme,
    // Input is disabled when a search option that doesn't require text input is selected.
    isDisabled:
      selectedSearchType.id === '_exists_' ||
      selectedSearchType.id === '-_exists_',
    errors,
    setErrors,
    handleChange: (props: typeof inputValue) => {
      setInputValue(props);
    },

    handleSubmit,
    handleClick: handleSubmit,
    renderSubmitButton: (props: Partial<InputSubmitButtonProps>) => (
      <InputSubmitButton
        items={items}
        size={size}
        colorScheme={colorScheme}
        // Button is disabled when the text input is needed but empty.
        isDisabled={
          selectedSearchType.id !== '_exists_' &&
          selectedSearchType.id !== '-_exists_'
        }
        {...props}
      />
    ),
  };

  return (
    <>
      <FormControl isInvalid={errors.length > 0}>
        <Flex alignItems='flex-end'>
          <FieldSelectWithContext />
          <Flex flexDirection='column' flex={1}>
            {/* [date]: Two date type inputs. */}
            {inputType === 'date' ? <DateInputGroup {...inputProps} /> : <></>}

            {/* [enum]: Select/Option Component. */}
            {inputType === 'enum' ? (
              <EnumInput
                options={selectedFieldDetails?.enum?.map(value => {
                  // [@type] needs to be formatted to the terms we use in the UI.
                  if (queryValue.field === '@type') {
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
            {inputType === 'string' ? <TextInput {...inputProps} /> : <></>}
          </Flex>
        </Flex>
        <FormErrorMessage justifyContent='flex-end'>
          <UnorderedList>
            {/* This is my error message */}
            {errors.map((error, index) => (
              <ListItem key={index}>
                <Text color='inherit' lineHeight='shorter'>
                  <strong>{error.title}</strong>: {error.message}
                </Text>
              </ListItem>
            ))}
          </UnorderedList>
        </FormErrorMessage>
      </FormControl>
    </>
  );
};
