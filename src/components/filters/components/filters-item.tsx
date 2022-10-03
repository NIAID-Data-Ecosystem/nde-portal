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
  isCountUpdating?: boolean;
}

export const FilterItem: React.FC<FilterItemProps> = React.memo(
  ({ displayTerm, count, value, isLoading, isCountUpdating }) => {
    return (
      <Checkbox
        w='100%'
        spacing={1}
        size='lg'
        value={value}
        my={2}
        sx={{ '.chakra-checkbox__label': { width: '100%' } }}
      >
        <Skeleton
          width={isLoading ? '200px' : '100%'}
          h={isLoading ? 4 : 'unset'}
          isLoaded={!isLoading}
          flex={1}
          ml={1}
        >
          <Flex width='100%' alignItems='center'>
            <Text fontWeight='light' fontSize='xs' lineHeight={1.5}>
              {displayTerm}
            </Text>
            <Skeleton
              width={isCountUpdating ? '2em' : 'unset'}
              h={isCountUpdating ? 4 : 'unset'}
              isLoaded={!isCountUpdating}
              ml={1}
            >
              {typeof count !== 'undefined' && (
                <Text
                  fontSize='xs'
                  lineHeight={1.5}
                  fontWeight='semibold'
                  ml={1}
                >
                  {count ? `(${formatNumber(count)})` : '-'}
                </Text>
              )}
            </Skeleton>
          </Flex>
        </Skeleton>
      </Checkbox>
    );
  },
);
