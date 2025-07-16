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
import { ErrorMessage } from '../error-message';

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

  const [debouncedTerm, setSearchTerm] = useDebounceValue('', 300);

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
    queryFn: () =>
      searchOntologyAPI({
        q: debouncedTerm ? debouncedTerm : '',
        ontology: selectedOntologies.map(
          o => o.value,
        ) as SearchParams['ontology'],
        biothingsFields: ['_id', 'rank', 'scientific_name'],
        olsFields: ['iri', 'label', 'ontology_name', 'short_form', 'type'],
      }),
    refetchOnWindowFocus: false,
  });

  const handleSubmit = useCallback(
    ({ id, ontology }: { id: string; ontology: string }) => {
      router.push({
        pathname: `/ontology-browser`,
        query: { ...router.query, id, ontology },
      });
      setSearchTerm('');

      setHasNoMatch(false);
    },
    [router, setSearchTerm, setHasNoMatch],
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
    const suggestion = suggestions?.find(
      suggestion => str === suggestion.label || str === suggestion._id,
    );

    if (suggestion) {
      handleSubmit({
        id: suggestion._id,
        ontology: suggestion.definingOntology,
      });
      setSearchTerm('');
    } else {
      setHasNoMatch(true);
    }
  };

  return (
    <VStack
      className='ontology-search'
      w='100%'
      alignItems='flex-start'
      spacing={1}
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
                  isDisabled={error || isLoading || !debouncedTerm}
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
      {error && (
        <Alert status='error' role='alert'>
          <AlertIcon />
          <AlertDescription>
            There was an error processing your search. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      {hasNoMatch && (
        <Alert status='warning'>
          <AlertIcon />
          <AlertTitle>No Match:</AlertTitle>
          <AlertDescription>
            Search term <strong>{debouncedTerm}</strong> not found in selected
            ontologies.
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  );
};
