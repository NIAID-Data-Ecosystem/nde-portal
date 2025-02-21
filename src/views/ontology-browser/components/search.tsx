import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Highlight,
  HStack,
  Icon,
  ListItem,
  Tag,
  TagLabel,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  ONTOLOGY_BROWSER_OPTIONS,
  OntologyOption,
  searchOntologyAPI,
  SearchParams,
} from '../utils/api-helpers';
import {
  DropdownInput,
  InputWithDropdown,
  useDropdownContext,
} from 'src/components/input-with-dropdown';
import { DropdownContent } from 'src/components/input-with-dropdown/components/DropdownContent';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { CheckboxList } from 'src/components/checkbox-list';

interface OntologyBrowserSearchProps {
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OntologyBrowserSearch = ({
  colorScheme = 'primary',
  size = 'md',
}: OntologyBrowserSearchProps) => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [hasNoMatch, setHasNoMatch] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [selectedOntologies, setSelectedOntologies] = useState(
    ONTOLOGY_BROWSER_OPTIONS,
  );

  useEffect(() => {
    if (router?.query?.onto) {
      setSelectedOntologies(
        ONTOLOGY_BROWSER_OPTIONS.filter(
          option =>
            router?.query?.onto && router?.query?.onto.includes(option.value),
        ),
      );
    }
  }, [router?.query?.onto]);

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
    queryKey: ['ontology-browser-search', debouncedTerm, selectedOntologies],
    queryFn: () =>
      searchOntologyAPI({
        q: debouncedTerm ? debouncedTerm : '',
        ontology: selectedOntologies.map(
          o => o.value,
        ) as SearchParams['ontology'],
        queryFields: ['label', 'short_form', 'obo_id', 'iri'],
      }),
    refetchOnWindowFocus: false,
  });

  const handleSubmit = ({ id }: { id: string }) => {
    router.push({
      pathname: `/ontology-browser`,
      query: { ...router.query, id },
    });
    setSearchTerm('');
    setHasNoMatch(false);
  };

  return (
    <VStack w='100%' alignItems='flex-start' spacing={1}>
      <HStack
        w='100%'
        alignItems='flex-end'
        flexDirection={{ base: 'column', md: 'row' }}
        flexWrap='wrap'
        justifyContent='flex-end'
      >
        <Flex
          flex={3}
          flexDirection='column'
          width={{ base: '100%', md: 'unset' }}
          minWidth={{ base: 'unset', md: '450px' }}
        >
          <Text
            as='label'
            htmlFor='ontology-browser-search-bar'
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
              id='ontology-browser-search-bar'
              ariaLabel='Search taxonomy browser'
              isLoading={isLoading}
              placeholder='Enter a taxonomy name or identifier'
              size={size}
              type='text'
              onChange={str => {
                setHasNoMatch(false);
                setSearchTerm(str);
              }}
              onClose={() => {
                setHasNoMatch(false);
                setSearchTerm('');
              }}
              onSubmit={str => {
                const suggestion = suggestions?.find(s => s.label === str);

                if (suggestion) {
                  handleSubmit({ id: suggestion.short_form });
                } else {
                  setHasNoMatch(true);
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

        {/* <!-- Select Ontology --> */}
        <CheckboxList
          flex={1}
          fontSize='sm'
          width={{ base: '100%', md: 'unset' }}
          buttonProps={{
            width: '250px',
            // maxWidth: { base: 'unset', xl: '250px' },
            overflow: 'hidden',
          }}
          label={
            <Text
              as='span'
              isTruncated
              color='inherit'
              display='flex'
              alignItems='flex-end'
              w='100%'
            >
              Selected ontologies
              <Tag
                variant='outline'
                color='inherit'
                borderRadius='full'
                fontSize='xs'
                alignSelf='flex-start'
                lineHeight={1.2}
                size='sm'
                px={3}
                ml={2}
              >
                <TagLabel>{selectedOntologies.length}</TagLabel>
              </Tag>
            </Text>
          }
          size='lg'
          description=''
          options={ONTOLOGY_BROWSER_OPTIONS}
          selectedOptions={selectedOntologies}
          handleChange={setSelectedOntologies}
        />
      </HStack>
      {hasNoMatch && (
        <Text color='red.500' fontStyle='italic' fontSize='sm'>
          Search term : {debouncedTerm ? `"${debouncedTerm}"` : ''} not found in
          selected ontologies
        </Text>
      )}
    </VStack>
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
        value: `/ontology-browser/${id}`,
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
