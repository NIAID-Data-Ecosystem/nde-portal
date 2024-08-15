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
} from 'src/views/search-results-page/components/filters/types';
import { useDebounceValue } from 'usehooks-ts';
import { formatNumber } from 'src/utils/helpers';
import { VariableSizeList as List } from 'react-window';
import { FILTER_CONFIGS } from 'src/views/search-results-page/components/filters/config';

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
  isUpdating?: boolean;
}
const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({ count, isHeader, isLoading, term, isUpdating, ...props }) => {
    let label = props.label;
    let subLabel = '';

    const termCount = useMemo(
      () => (typeof count === 'number' ? formatNumber(count) : undefined),
      [count],
    );

    // Display the header label for the group
    if (isHeader) {
      return (
        <Text
          px={6}
          fontSize='xs'
          fontWeight='semibold'
          lineHeight='shorter'
          py={1}
        >
          {label}
        </Text>
      );
    }

    // Split the label into scientific name and common name if it contains '|'
    if (term?.includes('|')) {
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
            mt: '0.15rem', // to keep checkbox in line with top of text for options with multiple lines
          },
          '>.chakra-checkbox__label': {
            display: 'flex',
            alignItems: 'flex-start',
            flex: 1,
            opacity: count ? 1 : 0.8,
          },
        }}
      >
        <Skeleton isLoaded={!isLoading} display='flex' flex={1}>
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
            {label
              ? label.charAt(0).toUpperCase() + label.slice(1)
              : 'Loading...'}
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

          {/* Display the count of the filter term */}
          <Skeleton
            isLoaded={!isUpdating && typeof count === 'number'}
            borderRadius='full'
            startColor='secondary.50'
            endColor='secondary.100'
            fontSize='xs'
            alignSelf='flex-start'
            lineHeight={1.2}
          >
            <Tag
              as='span'
              className='tag-count'
              variant='subtle'
              bg='secondary.50'
              colorScheme='secondary'
              borderRadius='full'
              fontSize='inherit'
              size='sm'
            >
              {!isUpdating && typeof count === 'number' ? (
                <>{termCount}</>
              ) : (
                <>0,000</>
              )}
            </Tag>
          </Skeleton>
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
  const DEFAULT_SIZE = useMemo(() => 35, []);
  const listRef = useRef<any>();
  const itemRefs = useRef<number[]>(Array(items.length).fill(DEFAULT_SIZE));
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
    const ref = useRef<HTMLDivElement>(null);

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
        height={
          items.length > 10 ? 400 : Math.max(100, items.length * DEFAULT_SIZE)
        }
        itemCount={items.length}
        itemSize={index => itemRefs.current[index] || DEFAULT_SIZE}
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

const sortTerms = (terms: FilterItem[], selectedFilters: string[]) => {
  const selectedSet = new Set(selectedFilters);

  return terms.sort((a, b) => {
    // Place selected filters at the top of their group
    const aSelected = selectedSet.has(a.term);
    const bSelected = selectedSet.has(b.term);

    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    // Terms -_exists_ (labelled as Not Specified) is always first followed by _exists_ (labelled as Any Specified) - no matter the count.
    if (a.term.includes('-_exists_') !== b.term.includes('-_exists_'))
      return a.term.includes('-_exists_') ? -1 : 1;

    if (a.term.includes('_exists_') !== b.term.includes('_exists_'))
      return a.term.includes('_exists_') ? -1 : 1;

    // Sort by count in descending order
    if (a.count !== b.count) return b.count - a.count;

    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
};

const groupTerms = (
  terms: FilterItem[],
  selectedFilters: string[],
  groupOrder?: FilterConfig['groupBy'],
) => {
  if (!terms) {
    return [];
  }
  const groupedTerms: Record<string, FilterItem[]> = terms.reduce(
    (acc, term) => {
      const group =
        term.groupBy ||
        (term.term.includes('_exists_') && '_exists_') ||
        'Ungrouped';
      if (!acc[group]) acc[group] = [];
      acc[group].push(term);
      return acc;
    },
    {} as Record<string, FilterItem[]>,
  );

  Object.keys(groupedTerms).forEach(group => {
    groupedTerms[group] = sortTerms(groupedTerms[group], selectedFilters);
  });

  const results: FilterItem[] = [];

  // Append the _exists_ group first if it exists.
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

    // Group the terms based on the groupBy property in the optional facet order.
    const facetConfig = useMemo(
      () => FILTER_CONFIGS.find(f => f.property === property),
      [property],
    );

    const groupedAndSorted = useMemo(
      () => groupTerms(terms, selectedFilters, facetConfig?.groupBy),
      [terms, facetConfig?.groupBy, selectedFilters],
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
            {props => (
              <Checkbox
                isLoading={isLoading && !isUpdating}
                isUpdating={isLoading || isUpdating}
                {...props}
              />
            )}
          </VirtualizedList>
        </CheckboxGroup>
      </>
    );
  },
);