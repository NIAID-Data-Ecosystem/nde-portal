import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Checkbox as ChakraCheckbox,
  CheckboxGroup,
  Tag,
  Text,
} from '@chakra-ui/react';
import { SearchInput } from 'src/components/search-input';
import { FilterItem } from 'src/components/search-results-page/components/filters/types';
import { useDebounceValue } from 'usehooks-ts';
import { formatNumber } from 'src/utils/helpers';
import { VariableSizeList as List } from 'react-window';

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

// Memoized Checkbox component to prevent unnecessary re-renders
interface FilterCheckboxProps extends FilterItem {
  index: number;
  setItemSize: (idx: number, size: number) => void;
}
const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({ count, label, subLabel, index, term, setItemSize }) => {
    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (ref.current) {
        setItemSize(index, ref.current.clientHeight);
      }
    }, [ref, index, term, setItemSize]);
    if (!label && !term) {
      return <div>Loading...</div>;
    }

    return (
      <div ref={ref}>
        <ChakraCheckbox
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
      </div>
    );
  },
);

// VirtualizedList component to render the list of filter terms
const VirtualizedList = ({
  children,
  items,
}: {
  items: FilterItem[];
  children: (props: FilterCheckboxProps) => JSX.Element;
}) => {
  const listRef = useRef<any>();
  const itemRefs = useRef<number[]>(Array(items.length).fill(null));
  const setItemSize = React.useCallback((index: number, size: number) => {
    listRef?.current?.resetAfterIndex(0);

    itemRefs.current[index] = size;
  }, []);

  return (
    <Box
      pr={2}
      pb={2}
      sx={{
        '>.scrolly-list::-webkit-scrollbar': {
          width: '8px',
          height: '7px',
        },
        '>.scrolly-list::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '8px',
        },
        '>.scrolly-list::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '8px',
        },
        _hover: {
          '&::-webkit-scrollbar-thumb': {
            background: 'niaid.placeholder',
          },
        },
      }}
    >
      <List
        className='scrolly-list'
        ref={listRef}
        width='100%'
        height={items.length > 10 ? 400 : items.length * 35}
        itemCount={items.length}
        itemSize={index => {
          return itemRefs?.current?.[index] || 35;
        }}
      >
        {({ index, style }) => (
          <div style={style}>
            {children({ ...items[index], index, setItemSize })}
          </div>
        )}
      </List>
    </Box>
  );
};
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

    // Filter the terms based on the search term
    const searchedTerms: FilterItem[] = React.useMemo(() => {
      if (!terms?.length) {
        return [];
      }

      return terms.filter(t =>
        t.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [terms, searchTerm]);

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
        <CheckboxGroup value={selectedFilters} onChange={handleSelectedFilters}>
          <VirtualizedList items={searchedTerms}>
            {(props: FilterCheckboxProps) => <Checkbox {...props} />}
          </VirtualizedList>
        </CheckboxGroup>
      </>
    );
  },
);
