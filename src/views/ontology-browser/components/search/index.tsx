import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  HStack,
  Tag,
  TagLabel,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  OntologyOption,
  searchOntologyAPI,
  SearchParams,
} from '../../utils/api-helpers';
import {
  DropdownInput,
  InputWithDropdown,
} from 'src/components/input-with-dropdown';
import { DropdownContent } from 'src/components/input-with-dropdown/components/DropdownContent';
import { CheckboxList } from 'src/components/checkbox-list';
import { useDebounceValue } from 'usehooks-ts';
import { DropdownListItem } from './dropdown-list-item';

interface OntologyBrowserSearchProps {
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  ontologyMenuOptions?: OntologyOption[];
}

export const OntologyBrowserSearch = ({
  colorScheme = 'primary',
  size = 'md',
  ontologyMenuOptions = [],
}: OntologyBrowserSearchProps) => {
  const router = useRouter();

  const [hasNoMatch, setHasNoMatch] = useState(false);
  const [selectedOntologies, setSelectedOntologies] =
    useState(ontologyMenuOptions);

  const [searchTerm, setSearchTerm] = useState('');
  // Debounce the search term to avoid excessive API calls
  const [debouncedTerm] = useDebounceValue(searchTerm, 100);

  useEffect(() => {
    if (router?.query?.ontology) {
      setSelectedOntologies(
        ontologyMenuOptions.filter(
          option =>
            router?.query?.ontology &&
            router?.query?.ontology.includes(option.value),
        ),
      );
    }
  }, [router?.query?.ontology, ontologyMenuOptions]);

  // Fetch suggestions based on search term
  const {
    error,
    isLoading,
    data: suggestions,
  } = useQuery({
    queryKey: ['ontology-browser-search', debouncedTerm, selectedOntologies],
    queryFn: async ({ signal }) => {
      const term = debouncedTerm.trim();
      if (!term) return [];

      const ontologyValues = selectedOntologies.map(
        o => o.value,
      ) as SearchParams['ontology'];

      // Search for both exact term and wildcard term. The reason for this is that searching for 9606* will return for anything that starts with 9606 but will not included term 9606 itself.
      const [termSearchResponse, wildcardSearchResponse] = await Promise.all([
        searchOntologyAPI(
          {
            q: term,
            ontology: ontologyValues,
            biothingsFields: ['_id', 'rank', 'scientific_name'],
            olsFields: ['iri', 'label', 'ontology_name', 'short_form', 'type'],
          },
          signal,
        ),
        searchOntologyAPI(
          {
            q: `${term}*`,
            ontology: ontologyValues,
            biothingsFields: ['_id', 'rank', 'scientific_name'],
            olsFields: ['iri', 'label', 'ontology_name', 'short_form', 'type'],
          },
          signal,
        ),
      ]);

      return {
        termSearch: termSearchResponse,
        wildcardSearch: wildcardSearchResponse,
      };
    },
    select: data => {
      if (!data || Array.isArray(data)) return [];
      // Combine results from both searches
      const combinedResults = [
        ...(data.termSearch || []),
        ...(data.wildcardSearch || []),
      ];
      // Remove duplicates based on _id
      const uniqueResults = Array.from(
        new Map(combinedResults.map(item => [item._id, item])).values(),
      );
      return uniqueResults;
    },
    refetchOnWindowFocus: false,
  });

  const handleSubmit = useCallback(
    ({ id, ontology }: { id: string; ontology: string }) => {
      router.push({
        pathname: `/ontology-browser`,
        query: { ...router.query, id, ontology },
      });
    },
    [router],
  );

  const handleInputChange = (str: string) => {
    setHasNoMatch(false);
    setSearchTerm(str);
  };

  const handleInputClose = () => {
    setHasNoMatch(false);
    setSearchTerm('');
  };

  const handleInputSubmit = (str: string) => {
    const suggestionMatch = suggestions?.find(
      suggestion => str === suggestion.label || str === suggestion._id,
    );

    if (suggestionMatch) {
      handleSubmit({
        id: suggestionMatch._id,
        ontology: suggestionMatch.definingOntology,
      });
      setSearchTerm('');
      setHasNoMatch(false);
    } else if (suggestions && suggestions.length > 0) {
      // If no match found, set hasNoMatch to true
      setHasNoMatch(true);
      // and submit the first suggestion if available
      handleSubmit({
        id: suggestions[0]._id,
        ontology: suggestions[0].definingOntology,
      });
    }
  };

  const hasPartialResults = suggestions && suggestions.length > 0 && hasNoMatch;

  return (
    <VStack
      className='ontology-search'
      w='100%'
      alignItems='flex-start'
      spacing={2}
    >
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
          zIndex='docked'
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
              onChange={handleInputChange}
              onClose={handleInputClose}
              onSubmit={handleInputSubmit}
              getInputValue={(idx: number): string => {
                if (suggestions && suggestions.length > 0 && suggestions[idx]) {
                  return suggestions[idx].label || '';
                }
                return '';
              }}
              renderSubmitButton={() => (
                <Button
                  colorScheme={colorScheme}
                  size={size}
                  type='submit'
                  display={{ base: 'none', md: 'flex' }}
                  isDisabled={
                    !!error ||
                    isLoading ||
                    !debouncedTerm.trim() ||
                    (suggestions && suggestions.length === 0)
                  }
                >
                  Search
                </Button>
              )}
            />

            <DropdownContent>
              <UnorderedList ml={0}>
                {suggestions?.map((suggestion, index) => (
                  <DropdownListItem
                    key={`${suggestion.definingOntology}-${suggestion._id}`}
                    id={suggestion._id}
                    handleSubmit={() =>
                      handleSubmit({
                        id: suggestion._id,
                        ontology: suggestion.definingOntology,
                      })
                    }
                    highlight={debouncedTerm}
                    index={index}
                    ontology={suggestion.definingOntology}
                  >
                    {suggestion.label}
                  </DropdownListItem>
                ))}
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
            overflow: 'hidden',
          }}
          zIndex={9}
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
          options={ontologyMenuOptions}
          selectedOptions={selectedOntologies}
          handleChange={setSelectedOntologies}
        />
      </HStack>
      {/* <!-- Error Message --> */}
      {error && (
        <Alert status='error' role='alert' flexWrap='wrap'>
          <AlertIcon />
          <AlertTitle>{error.message}</AlertTitle>
          <AlertDescription>
            There was an error processing your search. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      {/* <!-- No Match Found --> */}
      {suggestions &&
        suggestions.length === 0 &&
        debouncedTerm &&
        !isLoading &&
        !error && (
          <Alert status='info' flexWrap='wrap'>
            <AlertIcon />
            <AlertTitle>No Results Found</AlertTitle>
            <AlertDescription>
              No results found for <strong>{debouncedTerm}</strong>. Please try
              a different search term.
            </AlertDescription>
          </Alert>
        )}
      {/* <!-- No Match in Selected Ontologies --> */}
      {hasNoMatch && (
        <Alert status='info' flexWrap='wrap'>
          <AlertIcon />
          <AlertTitle>
            {suggestions && suggestions.length === 0
              ? 'No match'
              : 'No complete match'}
          </AlertTitle>
          <AlertDescription>
            Search term{' '}
            <Text as='span' textDecoration='underline'>
              {debouncedTerm}
            </Text>{' '}
            not found in selected ontologies.{' '}
            {hasPartialResults && (
              <Text as='span'>
                Returning results for{' '}
                <Text as='span' textDecoration='underline'>
                  {suggestions[0].label}
                </Text>{' '}
              </Text>
            )}
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  );
};
