import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Highlight,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { searchOntologyAPI } from '../helpers';
import {
  DropdownInput,
  InputWithDropdown,
  useDropdownContext,
} from 'src/components/input-with-dropdown';
import { DropdownContent } from 'src/components/input-with-dropdown/components/DropdownContent';
import { FaMagnifyingGlass } from 'react-icons/fa6';

interface TreeBrowserSearchProps {
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
}
export const TreeBrowserSearch = ({
  colorScheme = 'primary',
  size = 'md',
}: TreeBrowserSearchProps) => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch suggestions based on search term
  const {
    error,
    isLoading,
    data: suggestions,
  } = useQuery({
    queryKey: ['tree-browser-search', debouncedTerm],
    queryFn: () =>
      searchOntologyAPI({
        q: debouncedTerm ? debouncedTerm : '',
        ontology: ['ncbitaxon', 'edam'],
        queryFields: ['label', 'short_form', 'obo_id', 'iri'],
      }),
    refetchOnWindowFocus: false,
  });

  const handleSubmit = ({ id }: { id: string }) => {
    router.push({
      pathname: `/tree-browser`,
      query: { id },
    });
    setSearchTerm('');
  };
  return (
    <Flex flexDirection='column' w='100%'>
      <Text
        as='label'
        htmlFor='tree-browser-search-bar'
        fontSize='sm'
        color='gray.800'
        px={1}
      >
        Search taxonomy browser
      </Text>
      <InputWithDropdown
        inputValue={debouncedTerm}
        cursorMax={suggestions?.length || 0}
        colorScheme={colorScheme}
      >
        <DropdownInput
          id='tree-browser-search-bar'
          ariaLabel='Search taxonomy browser'
          isLoading={isLoading}
          placeholder='Enter a taxonomy name or identifier'
          size={size}
          type='text'
          onChange={str => setSearchTerm(str)}
          onClose={() => setSearchTerm('')}
          onSubmit={str => {
            const suggestion = suggestions?.find(s => s.label === str);
            if (suggestion) {
              handleSubmit({ id: suggestion.short_form });
            }
          }}
          getInputValue={(idx: number): string => {
            if (suggestions && suggestions.length > 0 && suggestions[idx]) {
              return suggestions[idx].label || '';
            }
            return '';
          }}
          renderSubmitButton={() => {
            return (
              <>
                {/* To do : add close button to clear input */}
                <Button
                  colorScheme={colorScheme}
                  size={size}
                  type='submit'
                  display={{ base: 'none', md: 'flex' }}
                  isDisabled={isLoading || !debouncedTerm}
                >
                  Search
                </Button>
              </>
            );
          }}
        />

        <DropdownContent>
          <UnorderedList ml={0}>
            {suggestions?.map((suggestion, index) => {
              return (
                <DropdownListItem
                  key={suggestion.iri}
                  handleSubmit={handleSubmit}
                  highlight={debouncedTerm}
                  id={suggestion.short_form}
                  index={index}
                  ontology={suggestion.ontology_prefix}
                >
                  {suggestion.label}
                </DropdownListItem>
              );
            })}
          </UnorderedList>
        </DropdownContent>
      </InputWithDropdown>
    </Flex>
  );
};

const DropdownListItem = ({
  children,
  colorScheme = 'primary',
  handleSubmit,
  id,
  index,
  ontology,
  highlight,
}: {
  children: string;
  colorScheme?: string;
  handleSubmit: (arg: { id: string }) => void;
  id: string;
  index: number;
  ontology?: string;
  highlight: string | string[];
}) => {
  const { cursor, getListItemProps } = useDropdownContext();

  return (
    <ListItem
      display='flex'
      cursor='pointer'
      px={2}
      mx={2}
      my={1}
      {...getListItemProps({
        index,
        value: `/tree-browser/${id}`,
        isSelected: cursor === index,
        onClick: () => handleSubmit({ id }),
      })}
    >
      <Icon
        as={FaMagnifyingGlass}
        mr={2}
        mt={1.5}
        color='primary.400'
        boxSize={3}
      />
      <Box>
        {/* Ontology label */}
        {ontology && (
          <Text
            fontSize='12px'
            color={`${colorScheme}.800`}
            wordBreak='break-word'
            fontWeight='light'
            textAlign='left'
          >
            {ontology}
          </Text>
        )}

        <Text
          size='sm'
          lineHeight='short'
          color='text.body'
          wordBreak='break-word'
          fontWeight='normal'
          textAlign='left'
        >
          <Highlight
            query={highlight}
            styles={{
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorScheme}.400`,
              bg: 'transparent',
            }}
          >
            {children}
          </Highlight>
        </Text>
      </Box>
    </ListItem>
  );
};
