import React, { useCallback, useEffect, useMemo } from 'react';
import { Heading, ListItem as NDEListItem, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { ListItemProps as ChakraListItemProps } from '@chakra-ui/react';
import { useDropdownContext } from '..';
import { DisplayHTMLString } from 'src/components/html-content';

interface DropdownListItemProps
  extends Omit<ChakraListItemProps, 'textUnderlineOffset'> {
  searchTerm: string;
  name?: keyof FormattedResource;
  value: FormattedResource['name'];
  index: number;
}

export const DropdownListItem: React.FC<DropdownListItemProps> = React.memo(
  ({ name, searchTerm, value, index, onMouseOver, onClick, ...props }) => {
    const { colorScheme, cursor, getListItemProps, setInputValue } =
      useDropdownContext();

    // If item is highlighted (mouseover or keydown), update the input string with the value of the list item.
    const isSelected = useMemo(() => cursor === index, [index, cursor]);
    useEffect(() => {
      if (isSelected) {
        setInputValue(value);
      }
    }, [cursor, isSelected, setInputValue, value]);

    // Bold and underline the searched term in the result string.
    const boldSubstring = useCallback((str: string, substr: string) => {
      if (!str) {
        return '';
      }
      const regex = new RegExp(substr, 'gi');
      return str.replace(
        regex,
        str => `<mark class="search-term">${str}</mark>`,
      );
    }, []);
    return (
      <NDEListItem
        borderRadius='base'
        cursor='pointer'
        p={2}
        my={1}
        {...getListItemProps({
          index,
          value,
          isSelected,
          onMouseOver,
          onClick,
          ...props,
        })}
      >
        {/* Field Name */}
        {name && (
          <Text
            fontSize='12px'
            color={`${colorScheme}.800`}
            wordBreak='break-word'
            fontWeight='light'
            textAlign='left'
          >
            {name}
          </Text>
        )}

        <Heading
          as='h4'
          size='sm'
          lineHeight='short'
          color='text.body'
          wordBreak='break-word'
          fontWeight='normal'
          textAlign='left'
          sx={{
            '* > .search-term': {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorScheme}.400`,
              bg: 'transparent',
            },
          }}
        >
          <DisplayHTMLString>
            {boldSubstring(value, searchTerm)}
          </DisplayHTMLString>
        </Heading>
      </NDEListItem>
    );
  },
);
