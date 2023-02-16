import React, { useEffect } from 'react';
import { InputProps } from 'nde-design-system';
import { DropdownButton } from 'src/components/dropdown-button';
import {
  TreeItem,
  UnionTypes,
} from 'src/components/advanced-search/components/SortableWithCombine';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils';
import { useAdvancedSearchContext } from '../../AdvancedSearchFormContext';

interface InputSubmitButtonProps {
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
  const { unionType, setUnionType } = useAdvancedSearchContext();

  useEffect(() => {
    setUnionType(prev => {
      if (items.length === 0) {
        return '';
      } else if (!prev && items.length > 0) {
        return 'AND';
      }
      return prev;
    });
  }, [items, setUnionType]);

  return (
    <DropdownButton
      placeholder='Add'
      ariaLabel='Submit button'
      selectedOption={unionType}
      setSelectedOption={arg => setUnionType(arg as UnionTypes | '')}
      options={
        items.length > 0
          ? unionOptions.map(term => {
              return {
                name: `${term}`,
                value: term,
                props: { ...getUnionTheme(term) },
              };
            })
          : []
      }
      {...props}
      py={0}
      size={size}
      colorScheme={
        unionType ? getUnionTheme(unionType).colorScheme : colorScheme
      }
      isDisabled={isDisabled}
    />
  );
};
