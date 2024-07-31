import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox as ChakraCheckbox,
  CheckboxGroup,
  Flex,
  Icon,
  keyframes,
  Tag,
  Text,
  UnorderedList,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { SearchInput } from 'src/components/search-input';
import { FaArrowDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { FilterItem } from 'src/components/search-results-page/components/filters/types';
import { useFilterSearch } from 'src/components/search-results-page/components/filters/hooks/useFilterSearch';
import { useDebounceValue } from 'usehooks-ts';
import { formatNumber } from 'src/utils/helpers';

// Define the props interface for the FiltersList component
interface FiltersListProps {
  colorScheme: string;
  terms: FilterItem[];
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
const Checkbox: React.FC<FilterItem> = React.memo(
  ({ count, facet, label, subLabel, term }) => {
    if (!label && !term) {
      return <div>Loading...</div>;
    }

    return (
      <ChakraCheckbox
        key={`${facet}-${term}`}
        as='li'
        value={term}
        w='100%'
        px={6}
        pr={2}
        py={1}
        alignItems='flex-start'
        _hover={{
          bg: 'secondary.50',
        }}
        sx={{
          '>.chakra-checkbox__control': {
            mt: 1, // to keep checkbox in line with top of text
          },
          '>.chakra-checkbox__label': {
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            opacity: count ? 1 : 0.8,
          },
        }}
      >
        <Text
          as='span'
          flex={1}
          wordBreak='break-word'
          color='text.heading'
          fontSize='xs'
          lineHeight='short'
          mr={0.5}
          display='flex'
          flexDirection='column'
          fontWeight={subLabel ? 'semibold' : 'normal'}
        >
          {label.charAt(0).toUpperCase() + label.slice(1)}
          {subLabel && (
            <Text
              as='span'
              flex={1}
              wordBreak='break-word'
              color='text.heading'
              fontSize='xs'
              lineHeight='short'
              fontWeight='normal'
              mr={0.5}
            >
              {subLabel.charAt(0).toUpperCase() + subLabel.slice(1)}
            </Text>
          )}
        </Text>
        {typeof count === 'number' && (
          <Tag
            as='span'
            className='tag-count'
            variant='subtle'
            colorScheme='secondary'
            bg='secondary.50'
            size='sm'
            fontSize='xs'
            borderRadius='full'
            alignSelf='flex-start'
            fontWeight='semibold'
          >
            {formatNumber(count)}
          </Tag>
        )}
      </ChakraCheckbox>
    );
  },
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

    // Handle search input change and update the search term in the useFilterSearch hook
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value);

    const sorted = React.useMemo(
      () =>
        terms?.sort((a, b) => {
          // 1. Terms -_exists_(labelled as Not Specified) is always first followed by _exists_(labelled as Any Specified) - no matter the count.
          if (a.term.includes('-_exists_') && !b.term.includes('-_exists_'))
            return -1;
          if (!a.term.includes('-_exists_') && b.term.includes('-_exists_'))
            return 1;
          if (a.term.includes('_exists_') && !b.term.includes('_exists_'))
            return -1;
          if (!a.term.includes('_exists_') && b.term.includes('_exists_'))
            return 1;
          // 2. Sort by count in descending order
          if (a.count !== b.count) return b.count - a.count;
          // 3. Sort alphabetically if count is the same
          return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
        }),
      [terms],
    );
    // useFilterSearch to handle filter terms logic when a search term is applied.
    const { disableToggle, filteredTerms, showFullList, toggleShowFullList } =
      useFilterSearch({
        terms: sorted,
        searchTerm: debouncedSearchTerm,
        disableToggle: property === 'includedInDataCatalog.name',
      });
    // const groupedTerms = React.useMemo(() => {
    //   return filteredTerms.reduce((acc, term) => {
    //     const group = term.groupBy || '';
    //     if (!acc[group]) acc[group] = [];
    //     acc[group].push(term);
    //     return acc;
    //   }, {} as { [key: string]: FilterItem[] });
    // }, [filteredTerms]);

    return (
      <>
        {/* Search through filter terms */}
        <Box px={4} pt={4} pb={2}>
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
          mr={1}
          maxH={showFullList ? 460 : 400}
          overflowY='auto'
        >
          {!isLoading && !isUpdating && !filteredTerms.length && (
            <Box p={2} textAlign='center' color='niaid.placeholder'>
              No available filters.
            </Box>
          )}
          <CheckboxGroup
            value={selectedFilters}
            onChange={handleSelectedFilters}
          >
            <UnorderedList ml={0} pb={1}>
              {filteredTerms
                ?.slice(0, showFullList ? filteredTerms.length : 5)
                .map((item, idx) => (
                  <Checkbox
                    key={idx}
                    term={item.term}
                    label={item.label}
                    subLabel={item.subLabel}
                    count={item.count}
                    facet={property}
                  />
                ))}
            </UnorderedList>
            {/* {Object.entries(groupedTerms).map(([group, terms]) => (
              <React.Fragment key={group}>
                <Text fontWeight='medium' px={6} fontSize='xs'>
                  {group}
                </Text>
                <UnorderedList ml={0} pb={1}>
                  {terms
                    ?.slice(0, showFullList ? terms.length : 5)
                    .map((item, idx) => (
                      <Checkbox
                        key={idx}
                        term={item.term}
                        label={item.label}
                        count={item.count}
                        facet={property}
                      />
                    ))}
                </UnorderedList>
              </React.Fragment>
            ))} */}
          </CheckboxGroup>
        </ScrollContainer>
        {/* Show more expansion button. */}
        {!disableToggle && filteredTerms.length > 5 && (
          <Flex
            w='100%'
            justifyContent='space-between'
            borderColor='gray.200'
            alignItems='center'
            px={4}
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
