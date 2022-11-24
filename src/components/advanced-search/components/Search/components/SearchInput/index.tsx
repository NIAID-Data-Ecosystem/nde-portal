import React, { useEffect, useState } from 'react';
import { InputProps } from 'nde-design-system';
import { DropdownButton } from 'src/components/dropdown-button';
import { PredictiveSearch } from 'src/components/search-with-predictive-text/components/PredictiveSearch';
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
  const usePredictiveSearchProps = useAdvancedSearchContext();
  const { searchField } = usePredictiveSearchProps;

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
        size={size}
        colorScheme={
          unionType ? getUnionTheme(unionType).colorScheme : colorScheme
        }
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

    handleSubmit({ term, field, union, querystring });
  };

  // If the field type is date, we want to use date inputs.
  if (searchFieldDetails && searchFieldDetails.format === 'date') {
    return (
      <DateInputGroup
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
    /* Input field with suggestions matching the search term. */
    <PredictiveSearch
      ariaLabel='Search for datasets or tools'
      placeholder='Search for datasets or tools'
      size={size}
      renderSubmitButton={InputButton}
      handleSubmit={(term, field) => {
        // [TO DO]: if radio for exact is selected or whatever we would modify
        // the encoding here for (querystring)
        onSubmit({ term, field, querystring: term });
      }}
      {...usePredictiveSearchProps}
    />
  );
};
