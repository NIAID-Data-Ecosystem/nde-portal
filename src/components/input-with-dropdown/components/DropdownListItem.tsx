import React, { useMemo } from 'react';
import {
  Heading,
  Highlight,
  ListItem as NDEListItem,
  ListItemProps as ChakraListItemProps,
  Text,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { useDropdownContext } from '..';

interface DropdownListItemProps extends ChakraListItemProps {
  searchTerm: string;
  name?: keyof FormattedResource;
  value: FormattedResource['name'];
  index: number;
}

export const DropdownListItem: React.FC<DropdownListItemProps> = React.memo(
  ({ name, searchTerm, value, index, onMouseOver, onClick, ...props }) => {
    const { colorScheme, cursor, getListItemProps } = useDropdownContext();

    // If item is highlighted (mouseover or keydown), update the input string with the value of the list item.
    const isSelected = useMemo(() => cursor === index, [index, cursor]);
    const displayValue = Array.isArray(value) ? value.join(' or ') : value;
    return (
      <NDEListItem
        borderRadius='base'
        cursor='pointer'
        p={2}
        m={2}
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
        >
          <Highlight
            query={searchTerm.split(' ')}
            styles={{
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorScheme}.400`,
              bg: 'transparent',
            }}
          >
            {displayValue}
          </Highlight>
        </Heading>
      </NDEListItem>
    );
  },
);
