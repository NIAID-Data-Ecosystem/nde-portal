import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Checkbox as ChakraCheckbox,
  CheckboxGroup,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react';
import { SearchInput } from 'src/components/search-input';
import {
  FilterConfig,
  FilterItem,
} from 'src/components/search-results-page/components/filters/types';
import { useDebounceValue } from 'usehooks-ts';
import { formatNumber } from 'src/utils/helpers';
import { VariableSizeList as List } from 'react-window';
import { FILTER_CONFIGS } from 'src/components/search-results-page/components/filters/config';

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
  isLoading: boolean;
}
const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({ count, isHeader, isLoading, term, ...props }) => {
    let label = props.label;
    let subLabel = '';

    if (!label && !term) {
      return <></>;
    }
    if (isHeader) {
      return (
        <Text px={6} fontSize='xs' fontWeight='semibold'>
          {label}
        </Text>
      );
    }

    if (term.includes('|')) {
      const [scientificName, commonName] = props.label.split(' | ');
      label = commonName || props.label;
      subLabel = scientificName;
    }

    return (
      <ChakraCheckbox
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
            mt: 1, // to keep checkbox in line with top of text for options with multiple lines
          },
          '>.chakra-checkbox__label': {
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            opacity: count ? 1 : 0.8,
          },
        }}
      >
        <Skeleton
          isLoaded={!isLoading}
          display='flex'
          flex={1}
          alignItems='center'
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
        </Skeleton>
      </ChakraCheckbox>
    );
  },
);

// VirtualizedList component to render the list of filter terms
const VirtualizedList = ({
  children,
  items,
}: {
  items: FilterItem[];
  children: (props: FilterItem) => JSX.Element;
}) => {
  const listRef = useRef<any>();
  const itemRefs = useRef<number[]>(Array(items.length).fill(null));
  const setItemSize = useCallback((index: number, size: number) => {
    listRef?.current?.resetAfterIndex(0);

    itemRefs.current[index] = size;
  }, []);

  const Row = ({
    children,
    index,
    style,
  }: {
    children: React.ReactNode;
    index: number;
    style: any;
  }) => {
    const ref = useRef<HTMLInputElement>(null);

    // Set the item size in the list for virtualization.
    useEffect(() => {
      if (ref.current) {
        setItemSize(index, ref.current.clientHeight);
      }
    }, [ref, index]);

    return (
      <div className='virtualized-row' style={style}>
        <div ref={ref}>{children}</div>
      </div>
    );
  };

  return (
    <Box
      pr={2}
      pb={2}
      sx={{
        '>.virtualized-list::-webkit-scrollbar': {
          width: '8px',
          height: '7px',
        },
        '>.virtualized-list::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '8px',
        },
        '>.virtualized-list::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '8px',
        },
        '&:hover>.virtualized-list::-webkit-scrollbar-thumb': {
          background: 'niaid.placeholder',
        },
      }}
    >
      <List
        className='virtualized-list'
        ref={listRef}
        width='100%'
        height={items.length > 10 ? 400 : Math.max(100, items.length * 35)}
        itemCount={items.length}
        itemSize={index => {
          return itemRefs?.current?.[index] || 35;
        }}
      >
        {({ index, style }) => (
          <Row index={index} style={style}>
            {children(items[index])}
          </Row>
        )}
      </List>
    </Box>
  );
};

const sortTerms = (terms: FilterItem[]) =>
  terms?.sort((a, b) => {
    // 1. Terms -_exists_(labelled as Not Specified) is always first followed by _exists_(labelled as Any Specified) - no matter the count.
    if (a.term.includes('-_exists_') && !b.term.includes('-_exists_'))
      return -1;
    if (!a.term.includes('-_exists_') && b.term.includes('-_exists_')) return 1;
    if (a.term.includes('_exists_') && !b.term.includes('_exists_')) return -1;
    if (!a.term.includes('_exists_') && b.term.includes('_exists_')) return 1;
    // 2. Sort by count in descending order
    if (a.count !== b.count) return b.count - a.count;

    return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
  });

const groupTerms = (
  terms: FilterItem[],
  groupOrder?: FilterConfig['groupBy'],
) => {
  const groupedTerms: Record<string, FilterItem[]> = {};

  terms.forEach(term => {
    const group =
      term.groupBy ||
      (term.term.includes('_exists_') && '_exists_') ||
      'Ungrouped';
    if (!groupedTerms[group]) groupedTerms[group] = [];
    groupedTerms[group].push(term);
  });

  Object.values(groupedTerms).forEach(sortTerms);

  const results: FilterItem[] = [];

  // Append the _exists_ group first if it exists
  if (groupedTerms['_exists_']) {
    results.push(...groupedTerms['_exists_']);
    delete groupedTerms['_exists_'];
  }

  // Process group order if provided
  groupOrder?.forEach(({ property, label }) => {
    if (groupedTerms[property]) {
      results.push({
        label,
        count: groupedTerms[property].length,
        term: property,
        isHeader: true,
      });
      results.push(...groupedTerms[property]);
      delete groupedTerms[property];
    }
  });

  // Append remaining groups alphabetically, except for "Ungrouped"
  Object.keys(groupedTerms)
    .sort()
    .forEach(group => {
      if (group !== 'Ungrouped') {
        results.push({
          label: group,
          count: groupedTerms[group].length,
          term: group,
          isHeader: true,
        });
        results.push(...groupedTerms[group]);
      }
    });

  // Append "Ungrouped" terms at the end without header
  if (groupedTerms['Ungrouped']) {
    results.push(...groupedTerms['Ungrouped']);
  }

  return results;
};

export const FiltersList: React.FC<FiltersListProps> = React.memo(
  ({
    colorScheme,
    handleSelectedFilters,
    isLoading,
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

    // Group the terms based on the groupBy property in the optional facet order.
    const facetConfig = useMemo(
      () => FILTER_CONFIGS.find(f => f.property === property),
      [property],
    );

    const groupedAndSorted = useMemo(
      () => groupTerms(terms, facetConfig?.groupBy),
      [terms, facetConfig?.groupBy],
    );

    // Filter the terms based on the search term
    const searchedTerms: FilterItem[] = useMemo(() => {
      if (!groupedAndSorted?.length) {
        return [];
      }
      if (!debouncedSearchTerm) {
        return groupedAndSorted;
      }
      return groupedAndSorted.filter(t =>
        t.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
    }, [groupedAndSorted, debouncedSearchTerm]);

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
            {props => <Checkbox isLoading={isLoading} {...props} />}
          </VirtualizedList>
        </CheckboxGroup>
      </>
    );
  },
);
