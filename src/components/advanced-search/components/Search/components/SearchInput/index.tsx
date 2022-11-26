import React, { useEffect, useState } from 'react';
import { InputProps } from 'nde-design-system';
import { DropdownButton } from 'src/components/dropdown-button';
import {
  DragItem,
  UnionTypes,
} from 'src/components/advanced-search/components/SortableWithCombine';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { DateInputGroup } from './components/DateInput';
import { getPropertyInConfig } from 'src/utils/metadata-schema';
import MetadataConfig from 'configs/resource-metadata.json';
import { TextInput } from './components/TextInput';

interface SearchInputProps {
  //   isDisabled: boolean;
  colorScheme?: InputProps['colorScheme'];
  size: InputProps['size'];
  items: DragItem[];
  handleSubmit: (args: {
    term: string;
    field: string;
    union?: UnionTypes;
    querystring?: string;
  }) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  colorScheme = 'primary',
  items,
  size,
  handleSubmit,
}) => {
  const advancedSearchProps = useAdvancedSearchContext();
  const { searchField, searchOption, updateSearchTerm } = advancedSearchProps;
  // Input is disabledinputValue wen search whether entire field exists (or doesn't exist).
  const inputIsDisabled =
    searchOption.value === '_exists_' || searchOption.value === '-_exists_';

  // Information about the search field such as type to use for inputs type.
  const searchFieldDetails = searchField
    ? getPropertyInConfig(searchField, MetadataConfig)
    : null;
  const [unionType, setUnionType] = useState<typeof unionOptions[number] | ''>(
    '',
  );

  useEffect(() => {
    setUnionType(prev => {
      if (items.length === 0) {
        return '';
      } else if (!prev && items.length > 0) {
        return 'AND';
      }
      return prev;
    });
  }, [items]);

  // Submit button for input.
  const InputButton = (props: any) => {
    return (
      <DropdownButton
        placeholder='Add'
        selectedOption={unionType}
        setSelectedOption={setUnionType}
        options={
          items.length > 0 &&
          unionOptions.map(term => {
            return {
              name: `Add with ${term}`,
              value: term,
              props: { ...getUnionTheme(term) },
            };
          })
        }
        {...props}
        py={0}
        size={size}
        colorScheme={
          unionType ? getUnionTheme(unionType).colorScheme : colorScheme
        }
        // isDisabled={!searchTerm && !inputIsDisabled}
      />
    );
  };

  const onSubmit = ({
    term,
    field,
    querystring,
  }: {
    term: string;
    field: string;
    querystring: string;
  }) => {
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
      handleSubmit({
        term: `Must ${
          searchOption.value === '-_exists_' ? 'not' : ''
        } contain ${field} field`,
        field: searchOption.value,
        union,
        querystring: field,
      });
    } else {
      handleSubmit({ term, field, union, querystring });
    }
  };

  // If the field type is date, we want to use date inputs.
  if (searchFieldDetails && searchFieldDetails.format === 'date') {
    return (
      <DateInputGroup
        isDisabled={inputIsDisabled}
        size={size}
        handleSubmit={({
          term,
          querystring,
        }: {
          term: string;
          querystring: string;
        }) => {
          onSubmit({ term, field: searchField, querystring });
        }}
        renderSubmitButton={InputButton}
      />
    );
  }

  return (
    <TextInput
      size={size}
      isDisabled={inputIsDisabled}
      renderSubmitButton={InputButton}
      onChange={value => {
        let term = value;
        if (searchOption?.transformValue) {
          term = searchOption.transformValue(value);
        }
        updateSearchTerm(term);
      }}
      handleSubmit={({ term, field }) => {
        let querystring = term;
        if (searchOption?.transformValue) {
          querystring = searchOption.transformValue(term);
        }
        onSubmit({ term, field, querystring });
      }}
      {...advancedSearchProps}
    />
  );
};
