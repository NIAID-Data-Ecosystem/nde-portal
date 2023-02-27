import React, { useMemo } from 'react';
import { Heading, ListItem as NDEListItem, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { ListItemProps as ChakraListItemProps } from '@chakra-ui/react';
import { useDropdownContext } from '..';

interface DropdownListItemProps
  extends Omit<ChakraListItemProps, 'textUnderlineOffset'> {
  searchTerm: string;
  name?: keyof FormattedResource;
  value: FormattedResource['name'];
  index: number;
}

// Highlights the words in a text given a set of words to match.
// See example: https://codesandbox.io/s/text-highlighting-vk1hj?file=/src/App.js
interface HighlightProps {
  tags: string[];
}
export const Highlight: React.FC<HighlightProps> = ({
  children: text = '',
  tags = [],
}) => {
  if (typeof text !== 'string' || !tags?.length) return <>{text}</>;

  const matches = [
    ...text.matchAll(
      new RegExp(
        // escape characters tha timpact regex.
        tags.join('|').replace(/[\[\]\(\)\/\\/\{\}\*]/g, '\\$&'),
        'ig',
      ),
    ),
  ];

  const startText = text.slice(0, matches[0]?.index);
  return (
    <>
      {startText}
      {matches.map((match, i) => {
        const startIndex = match.index || 0;
        const currentText = match[0];
        const endIndex = startIndex + currentText.length;
        const nextIndex = matches[i + 1]?.index;
        const untilNextText = text.slice(endIndex, nextIndex);
        return (
          <span key={i}>
            <mark className='search-term'>{currentText}</mark>
            {untilNextText}
          </span>
        );
      })}
    </>
  );
};

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
