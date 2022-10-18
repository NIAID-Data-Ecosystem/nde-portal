import React from 'react';
import { Box, ListItem as NDEListItem, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { ListItemProps as ChakraListItemProps } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface SearchWithPredictiveTextProps {
  isOpen: boolean;
}

export const List: React.FC<SearchWithPredictiveTextProps> = ({
  isOpen,
  children,
}) => {
  if (!isOpen) {
    return <></>;
  }

  return (
    <Box maxHeight='500px' overflow='auto' ml={0}>
      {children}
    </Box>
  );
};

interface ListItemProps
  extends Omit<ChakraListItemProps, 'textUnderlineOffset'> {
  value: FormattedResource['name'];
  isSelected: boolean;
  searchTerm: string;
  selectedField: keyof FormattedResource;
}

export const ListItem: React.FC<ListItemProps> = ({
  selectedField,
  value,
  searchTerm,
  isSelected,
  onMouseOver,
  onClick,
  ...props
}) => {
  // Bold and underline the searched term in the result string.
  const boldSubstring = (str: string, substr: string) => {
    if (!str) {
      return '';
    }
    const regex = new RegExp(substr, 'gi');
    return str.replace(regex, str => `<mark class="search-term">${str}</mark>`);
  };

  return (
    <NDEListItem
      borderRadius='base'
      p={2}
      my={1}
      bg={isSelected ? 'primary.100' : 'primary.50'}
      color={isSelected ? 'text.heading' : 'text.body'}
      cursor='pointer'
      onMouseOver={onMouseOver}
      onClick={onClick}
      {...props}
    >
      <Text
        fontSize='12px'
        color='primary.800'
        wordBreak='break-word'
        fontWeight='light'
        textAlign='left'
      >
        {selectedField}
      </Text>
      <Text
        fontSize='sm'
        color='inherit'
        wordBreak='break-word'
        fontWeight='normal'
        textAlign='left'
        sx={{
          '* > .search-term': {
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: 'primary.400',
            bg: 'transparent',
          },
        }}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, remarkGfm]}
          linkTarget='_blank'
        >
          {boldSubstring(value, searchTerm)}
        </ReactMarkdown>
      </Text>
    </NDEListItem>
  );
};
