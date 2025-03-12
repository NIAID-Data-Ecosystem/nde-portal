import React, { useEffect, useState, useCallback } from 'react';
import {
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
  ONTOLOGY_BROWSER_OPTIONS,
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
}

const ErrorMessage = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Flex bg='red.100' px={4} flex={1}>
      <Text color='red.500' fontSize='sm'>
        <Text
          as='span'
          fontWeight='semibold'
          mr={1}
          color='inherit'
          fontSize='inherit'
        >
          {title}
        </Text>
        {children}
      </Text>
    </Flex>
  );
};

export const OntologyBrowserSearch = ({
  colorScheme = 'primary',
  size = 'md',
}: OntologyBrowserSearchProps) => {
  const router = useRouter();

  const [hasNoMatch, setHasNoMatch] = useState(false);
  const [selectedOntologies, setSelectedOntologies] = useState(
    ONTOLOGY_BROWSER_OPTIONS,
  );

  const [debouncedTerm, setSearchTerm] = useDebounceValue('', 300);

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
    } else {
      setHasNoMatch(true);
    }
  };

  return (
    <VStack w='100%' alignItems='flex-start' spacing={1}>
      <HStack
        w='100%'
        alignItems='flex-end'
        flexDirection={{ base: 'column', md: 'row' }}
        flexWrap='wrap'
        justifyContent='flex-end'
        sx={{
          '> div': {
            zIndex: 'docked',
          },
        }}
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
                  isDisabled={isLoading || !debouncedTerm}
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
                    handleSubmit={() =>
                      handleSubmit({
                        id: suggestion._id,
                        ontology: suggestion.definingOntology,
                      })
                    }
                    highlight={debouncedTerm}
                    id={suggestion._id}
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
      {error && <ErrorMessage title='  Error:'>{error.message}</ErrorMessage>}
      {hasNoMatch && (
        <ErrorMessage title='No Match:'>
          Search term{' '}
          <Text
            as='span'
            fontWeight='semibold'
            mr={1}
            color='inherit'
            fontSize='inherit'
          >
            {debouncedTerm ? `${debouncedTerm}` : ''}
          </Text>
          not found in selected ontologies.
        </ErrorMessage>
      )}
    </VStack>
  );
};
