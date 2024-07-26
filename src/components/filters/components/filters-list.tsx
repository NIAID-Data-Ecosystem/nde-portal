import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  keyframes,
  UnorderedList,
  Checkbox as ChakraCheckbox,
  CheckboxGroup,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { SearchInput } from 'src/components/search-input';
import { FaArrowDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { FilterTerm } from 'src/components/search-results-page/components/filters/types';
import { useFilterTerms } from 'src/components/search-results-page/components/filters/hooks/useFilterTerms';
import { useDebounceValue } from 'usehooks-ts';

// Define the props interface for the FiltersList component
interface FiltersListProps {
  colorScheme: string;
  terms: FilterTerm[];
  searchPlaceholder: string;
  selectedFilters: string[];
  handleSelectedFilters: (arg: string[]) => void;
  isLoading: boolean;
  isUpdating?: boolean;
  property: string;
}

// Animation keyframes for the "bounce" effect
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
  }
  40% {
      transform: translateY(-10px);
  }
  60% {
      transform: translateY(-5px);
  }
`;
// Memoized Checkbox component to prevent unnecessary re-renders
const Checkbox: React.FC<Partial<FilterTerm>> = React.memo(
  ({ label, term, facet }) => (
    <ChakraCheckbox
      key={`${facet}-${term}`}
      as='li'
      value={term}
      w='100%'
      px={4}
      py={1}
      _hover={{ bg: 'secondary.50' }}
      sx={{
        '>.chakra-checkbox__label': {
          fontSize: 'sm',
          color: 'text.body',
          lineHeight: 'tall',
        },
      }}
    >
      {label}
    </ChakraCheckbox>
  ),
);

export const FiltersList: React.FC<FiltersListProps> = React.memo(
  ({
    colorScheme,
    handleSelectedFilters,
    isLoading,
    isUpdating,
    property,
    searchPlaceholder,
    selectedFilters,
    terms,
  }) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const animation = prefersReducedMotion
      ? undefined
      : `${bounce} 1 1.5s ease-in-out`;

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

    // Handle search input change and update the search term in the useFilterTerms hook
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value);

    // useFilterTerms to handle filter terms logic when a search term is applied.
    const { filteredTerms, showFullList, toggleShowFullList } = useFilterTerms({
      terms,
      searchTerm: debouncedSearchTerm,
      isLoading,
    });

    return (
      <>
        {/* Search through filter terms */}
        <Box px={4} py={2}>
          <SearchInput
            ariaLabel={`Search filter ${searchPlaceholder} terms`}
            placeholder={searchPlaceholder}
            maxW='unset'
            size='sm'
            value={searchTerm}
            handleChange={handleSearchChange}
            colorScheme={colorScheme}
            onClose={() => setSearchTerm('')}
          />
        </Box>
        {/* List of filters available narrowed based on search and expansion toggle */}
        <ScrollContainer
          flexDirection='column'
          ml={0}
          pr={0}
          maxH={showFullList ? 460 : 400}
          overflowY='auto'
        >
          {!isLoading && !isUpdating && !filteredTerms.length && (
            <Box p={2}>No available filters.</Box>
          )}
          <CheckboxGroup
            value={selectedFilters}
            onChange={handleSelectedFilters}
          >
            <UnorderedList ml={0} pb={4}>
              {filteredTerms
                ?.slice(0, showFullList ? filteredTerms.length : 5)
                .map((item, idx) => {
                  return (
                    <Checkbox
                      key={idx}
                      term={item.term}
                      label={item.label}
                      facet={property}
                    ></Checkbox>
                  );
                })}
            </UnorderedList>
          </CheckboxGroup>
        </ScrollContainer>
        {/* Show more expansion button. */}
        {filteredTerms.length > 5 && property !== 'includedInDataCatalog' && (
          <Flex
            w='100%'
            justifyContent='space-between'
            borderColor='gray.200'
            alignItems='center'
          >
            <Button
              variant='link'
              colorScheme='secondary'
              size='sm'
              px={2}
              py={2}
              onClick={toggleShowFullList}
            >
              {showFullList ? 'Show less' : 'Show all'}
            </Button>
            <Icon
              as={FaArrowDown}
              animation={showFullList ? animation : undefined}
              color={showFullList ? 'gray.800' : 'gray.400'}
            />
          </Flex>
        )}
      </>
    );
  },
);
