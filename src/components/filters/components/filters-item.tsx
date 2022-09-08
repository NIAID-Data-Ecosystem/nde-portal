import React from 'react';
import { Checkbox, Flex, Text, CheckboxProps } from 'nde-design-system';
import { formatNumber } from 'src/utils/helpers';

export interface FilterItemProps extends CheckboxProps {
  term: string;
  count?: number;
}

export const FilterItem: React.FC<FilterItemProps> = ({
  term,
  count,
  isChecked,
  onChange,
}) => {
  return (
    <Checkbox
      spacing={2}
      size='lg'
      value={term}
      w='100%'
      my={2}
      isChecked={isChecked}
      onChange={onChange}
    >
      <Flex ml={1} fontSize='xs' lineHeight={1.5}>
        <Text fontWeight='light'>
          {term}
          {typeof count !== 'undefined' && (
            <Text as='span' fontWeight='semibold' ml={1}>
              {count ? `(${formatNumber(count)})` : '-'}
            </Text>
          )}
        </Text>
      </Flex>
    </Checkbox>
  );
};
