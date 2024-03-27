import React, { useMemo } from 'react';
import {
  Heading,
  ListItem as NDEListItem,
  ListItemProps as ChakraListItemProps,
  Text,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { useDropdownContext } from '..';
import dynamic from 'next/dynamic';

const Highlight = dynamic(() =>
  import('src/components/input-with-dropdown/components/Highlight').then(
    mod => mod.Highlight,
  ),
);

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
          sx={{
            '* > .search-term': {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorScheme}.400`,
              bg: 'transparent',
            },
          }}
        >
          <Highlight tags={searchTerm.split(' ')}>{displayValue}</Highlight>
        </Heading>
      </NDEListItem>
    );
  },
);
