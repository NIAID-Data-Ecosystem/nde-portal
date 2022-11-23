import React, { useEffect, useState } from 'react';
import { Flex, Select, Skeleton } from 'nde-design-system';
import {
  SearchWithPredictiveText,
  usePredictiveSearch,
} from 'src/components/search-with-predictive-text';
import { uniqueId } from 'lodash';
import { DropdownButton } from 'src/components/dropdown-button';
import { PredictiveSearch } from 'src/components/search-with-predictive-text/components/PredictiveSearch';
import { DragItem, UnionTypes } from '../../SortableWithCombine';
import { getUnionTheme, unionOptions } from '../../../utils';

interface SearchBarProps {
  isDisabled: boolean;
  items: DragItem[];
  handleSubmit: (args: {
    term: string;
    field: string;
    union?: UnionTypes;
  }) => void;
}
export const SearchBar: React.FC<SearchBarProps> = ({
  handleSubmit,
  isDisabled,
  items,
}) => {
  const usePredictiveSearchProps = usePredictiveSearch();
  const { searchField, setSearchField } = usePredictiveSearchProps;

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

  return (
    /* Input field with suggestions matching the search term. */
    <PredictiveSearch
      ariaLabel='Search for datasets or tools'
      placeholder='Search for datasets or tools'
      size='md'
      renderSubmitButton={props => {
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
            colorScheme={
              unionType ? getUnionTheme(unionType).colorScheme : 'primary'
            }
          />
        );
      }}
      handleSubmit={(term, field) => {
        // if no union type is selected, default to "AND"
        const union = unionType || undefined;
        !unionType && setUnionType(union || 'AND');
        handleSubmit({ term, field, union });
      }}
      {...usePredictiveSearchProps}
    />
  );
};
