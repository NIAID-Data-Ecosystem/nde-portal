import React, { useCallback, useEffect, useState } from 'react';
import { ButtonProps, InputProps } from 'nde-design-system';
import {
  DragItem,
  UnionTypes,
} from 'src/components/advanced-search/components/SortableWithCombine';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { DateInputGroup } from './components/DateInput';
import { getPropertyInConfig } from 'src/utils/metadata-schema';
import MetadataConfig from 'configs/resource-metadata.json';
import { TextInput } from './components/TextInput';
import { EnumInput } from './components/EnumInput';
import { InputSubmitButton } from './components/InputSubmitButton';

interface CustomInputProps {
  size: InputProps['size'];
  inputValue: any;
  isDisabled: boolean;
  colorScheme?: InputProps['colorScheme'];
  handleClick: (args: { term: string; field: string }) => void; // triggered when suggestion item from list is clicked.
  handleChange: (
    value: string | { startDate: string; endDate: string },
  ) => void;
  handleSubmit: (args: {
    term: string;
    field?: string;
    union?: UnionTypes;
    querystring: string;
  }) => void;
  renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
  type: 'number' | 'string' | 'date' | 'enum';
  options?: string[];
}

const CustomInput: React.FC<CustomInputProps> = props => {
  if (props.type === 'date') {
    return <DateInputGroup {...props} />;
  } else if (props.type === 'enum') {
    return <EnumInput {...props} />;
  }
  return <TextInput {...props} />;
};

interface SearchInputProps {
  //   isDisabled: boolean;
  colorScheme?: InputProps['colorScheme'];
  size: InputProps['size'];
  items: DragItem[];
  onSubmit: (args: {
    term: string;
    field: string;
    querystring: string;
    union?: UnionTypes;
  }) => void;
  isFormReset: boolean;
  setResetForm: (arg: boolean) => void;
}
export const SearchInput: React.FC<SearchInputProps> = ({
  colorScheme = 'primary',
  items,
  size,
  onSubmit,
  isFormReset,
  setResetForm,
}) => {
  const advancedSearchProps = useAdvancedSearchContext();
  const {
    searchField,
    searchOption,
    updateSearchTerm,
    unionType,
    setUnionType,
  } = advancedSearchProps;

  const [inputType, setInputType] = useState<
    'number' | 'string' | 'date' | 'enum'
  >('string');

  const [inputValue, setInputValue] = useState<
    string | number | { startDate: string; endDate: string }
  >('');

  // Input is disabled when a search option that is not "contains" is chosen.
  const inputIsDisabled =
    searchOption.value === '_exists_' || searchOption.value === '-_exists_';

  const clearInputField = useCallback(() => {
    updateSearchTerm('');
    setInputValue('');
  }, [updateSearchTerm]);

  // Information about the search field such as type to use for inputs type.
  const searchFieldDetails = searchField
    ? getPropertyInConfig(searchField, MetadataConfig)
    : null;

  const handleSubmit = ({
    term,
    field,
    querystring,
  }: {
    term: string;
    field: string;
    querystring: string;
  }) => {
    clearInputField();
    // if no union type is selected, default to "AND"
    const union = unionType || undefined;
    !unionType && setUnionType(union || 'AND');

    // For "exists" type queries, we want a format of _exists_: {field} or -_exists_:{field}
    // so the exists keyword is set as field parameter
    // and the field is set as the querystring parameter.
    if (
      searchOption.value === '_exists_' ||
      searchOption.value === '-_exists_'
    ) {
      onSubmit({
        term: `Must ${
          searchOption.value === '-_exists_' ? 'not' : ''
        } contain ${field} field`,
        field: searchOption.value,
        union,
        querystring: field,
      });
    } else {
      onSubmit({ term, field, union, querystring });
    }
  };

  useEffect(() => {
    if (isFormReset) {
      clearInputField();
    }
  }, [isFormReset, clearInputField]);

  useEffect(() => {
    setInputType(() => {
      if (searchFieldDetails?.enum) {
        return 'enum';
      } else if (searchFieldDetails?.format === 'date') {
        return 'date';
      } else if (
        searchFieldDetails?.type === 'unsigned_long' ||
        searchFieldDetails?.type === 'integer' ||
        searchFieldDetails?.type === 'double' ||
        searchFieldDetails?.type === 'float'
      ) {
        return 'number';
      }
      return 'string';
    });
  }, [searchFieldDetails]);

  return (
    <CustomInput
      size={size}
      type={inputType}
      options={searchFieldDetails?.enum}
      inputValue={inputValue}
      isDisabled={inputIsDisabled}
      handleChange={props => {
        setInputValue(props);
        setResetForm(false);
      }}
      handleClick={({ term, field }) => {
        handleSubmit({
          term,
          field: field || searchField,
          querystring: `"${term}"`,
        });
      }}
      handleSubmit={props => {
        handleSubmit({ field: searchField, ...props });
      }}
      renderSubmitButton={props => (
        <InputSubmitButton
          items={items}
          size={size}
          colorScheme={colorScheme}
          {...props}
        />
      )}
    />
  );
};
