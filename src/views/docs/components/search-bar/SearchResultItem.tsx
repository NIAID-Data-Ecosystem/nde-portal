import { Heading, Highlight, List, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useDropdownContext } from 'src/components/input-with-dropdown';

import type { SearchResultItemProps } from '../../types';

export const SearchResultItem = React.memo(
  ({
    index,
    result,
    searchTerm,
    colorPalette,
    onClick,
  }: SearchResultItemProps) => {
    const { cursor, getListItemProps } = useDropdownContext();
    const isSelected = useMemo(() => cursor === index, [index, cursor]);

    return (
      <List.Item
        px={2}
        mx={2}
        my={1}
        borderRadius='base'
        cursor='pointer'
        {...getListItemProps({
          index,
          value: result.slug,
          isSelected,
          onClick,
        })}
      >
        <Heading
          as='h4'
          size='sm'
          lineHeight='moderate'
          color='text.body'
          wordBreak='break-word'
          textAlign='left'
        >
          {result.name && (
            <Highlight
              query={searchTerm.split(' ')}
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorPalette}.400`,
                bg: 'transparent',
              }}
            >
              {result.name}
            </Highlight>
          )}
        </Heading>
        {result.description && (
          <Text color='gray.600' fontSize='sm'>
            <Highlight
              query={searchTerm.split(' ')}
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorPalette}.400`,
                bg: 'transparent',
              }}
            >
              {result.description}
            </Highlight>
          </Text>
        )}
      </List.Item>
    );
  },
);

SearchResultItem.displayName = 'SearchResultItem';
