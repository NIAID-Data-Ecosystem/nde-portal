import React, { useEffect, useState } from 'react';
import { InputProps } from '@chakra-ui/react';
import { DropdownButton } from 'src/components/dropdown-button';
import { TreeItem } from 'src/components/advanced-search/components/SortableWithCombine';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils/query-helpers';
import { useAdvancedSearchContext } from '../../AdvancedSearchFormContext';

export interface InputSubmitButtonProps {
  isDisabled: boolean;
  colorScheme?: InputProps['colorScheme'];
  items: TreeItem[];
  size: InputProps['size'];
}

// Submit button for input.
export const InputSubmitButton: React.FC<InputSubmitButtonProps> = ({
  colorScheme = 'primary',
  size = 'md',
  items,
  isDisabled,
  ...props
}) => {
  const { queryValue, updateQueryValue } = useAdvancedSearchContext();
  const [union, setUnion] = useState(queryValue.union);

  useEffect(() => {
    setUnion(prev => {
      if (items.length === 0) {
        return '';
      } else if (!prev && items.length > 0) {
        return 'AND';
      }
      return prev;
    });
  }, [items]);

  useEffect(() => {
    updateQueryValue({ union });
  }, [union, updateQueryValue]);

  return (
    <DropdownButton
      placeholder='Add'
      ariaLabel='Submit button'
      selectedOption={union}
      setSelectedOption={setUnion}
      options={
        items.length > 0
          ? unionOptions.map(term => {
              return {
                name: `${term}`,
                value: term,
                props: {
                  bg: getUnionTheme(term).bg,
                  _hover: getUnionTheme(term)._hover,
                },
              };
            })
          : []
      }
      {...props}
      py={0}
      size={size}
      colorScheme={union ? getUnionTheme(union).colorScheme : colorScheme}
      isDisabled={isDisabled}
    />
  );
};
