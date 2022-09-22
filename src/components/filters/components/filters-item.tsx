import React from 'react';
import {
  Checkbox,
  Flex,
  Text,
  CheckboxProps,
  Skeleton,
} from 'nde-design-system';
import { formatNumber } from 'src/utils/helpers';

export interface FilterItemProps extends CheckboxProps {
  displayTerm: string; // term used for display
  value: string; // unique checkbox value.
  count?: number;
  isLoading: boolean;
}

export const FilterItem: React.FC<FilterItemProps> = React.memo(
  ({ displayTerm, count, value, isLoading }) => {
    return (
      <Checkbox spacing={1} size='lg' value={value} my={2}>
        <Skeleton
          width='200px'
          h={isLoading ? 4 : 'unset'}
          isLoaded={!isLoading}
          flex={1}
          ml={1}
        >
          <Flex width='100%'>
            <Text fontWeight='light' w='100%' fontSize='xs' lineHeight={1.5}>
              {displayTerm}
              {typeof count !== 'undefined' && (
                <Text as='span' fontWeight='semibold' ml={1}>
                  {count ? `(${formatNumber(count)})` : '-'}
                </Text>
              )}
            </Text>
          </Flex>
        </Skeleton>
      </Checkbox>
    );
  },
);
