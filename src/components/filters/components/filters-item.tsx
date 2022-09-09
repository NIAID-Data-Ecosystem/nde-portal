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
  term: string;
  count?: number;
  isLoading: boolean;
}

export const FilterItem: React.FC<FilterItemProps> = React.memo(
  ({ term, count, isLoading }) => {
    return (
      <Checkbox spacing={2} size='lg' my={2} value={term}>
        <Skeleton
          width='200px'
          h={isLoading ? 4 : 'unset'}
          isLoaded={!isLoading}
          flex={1}
        >
          <Flex width='100%' ml={1}>
            <Text fontWeight='light' w='100%' fontSize='xs' lineHeight={1.5}>
              {term}
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
