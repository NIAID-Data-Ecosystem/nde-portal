import React, { useMemo } from 'react';
import { Heading, Highlight, ListItem, Text } from '@chakra-ui/react';
import { useDropdownContext } from 'src/components/input-with-dropdown';
import { SearchResultItemProps } from './types';

export const SearchResultItem = React.memo(
  ({
    index,
    result,
    searchTerm,
    colorScheme,
    onClick,
  }: SearchResultItemProps) => {
    const { cursor, getListItemProps } = useDropdownContext();
    const isSelected = useMemo(() => cursor === index, [index, cursor]);

    return (
      <ListItem
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
          lineHeight='short'
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
                color: `${colorScheme}.400`,
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
                color: `${colorScheme}.400`,
                bg: 'transparent',
              }}
            >
              {result.description}
            </Highlight>
          </Text>
        )}
      </ListItem>
    );
  },
);

SearchResultItem.displayName = 'SearchResultItem';
