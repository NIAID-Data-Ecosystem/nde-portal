import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, CheckboxGroup, Text } from '@chakra-ui/react';
import { VariableSizeList as List } from 'react-window';
import { useDebounceValue } from 'usehooks-ts';
import { SearchInput } from 'src/components/search-input';
import { Checkbox } from './checkbox';
import { FacetTermWithDetails, FilterConfig, FilterItem } from '../types';

// VirtualizedList component to render the list of filter terms
const VirtualizedList = React.memo(
  ({
    children,
    items,
  }: {
    items: FilterItem[];
    children: (props: FilterItem) => JSX.Element;
  }) => {
    const DEFAULT_SIZE = useMemo(() => 40, []);
    const listRef = useRef<any>();
    const itemRefs = useRef<number[]>(Array(items.length).fill(DEFAULT_SIZE));
    const setItemSize = useCallback((index: number, size: number) => {
      listRef?.current?.resetAfterIndex?.(0);

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
      const handleRowSize = useCallback(() => {
        if (ref.current) {
          setItemSize(index, ref.current.clientHeight);
        }
      }, [index]);

      // Set the item size on mount and on resize
      useEffect(() => {
        handleRowSize();
      }, [handleRowSize]);

      useEffect(() => {
        window.addEventListener('resize', handleRowSize);
        return () => window.removeEventListener('resize', handleRowSize);
      }, [handleRowSize]);

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
            background: 'page.placeholder',
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
  },
);

export const sortTerms = (terms: FilterItem[], selectedFilters: string[]) => {
  const selectedSet = new Set(selectedFilters);

  return terms.sort((a, b) => {
    // Place selected filters at the top of their group
    const aSelected = selectedSet.has(a.term);
    const bSelected = selectedSet.has(b.term);

    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    // Terms -_exists_ (labelled as Not Specified) is always first followed by _exists_ (labelled as Any) - no matter the count.
    if (a.term.includes('-_exists_') !== b.term.includes('-_exists_'))
      return a.term.includes('-_exists_') ? -1 : 1;

    if (a.term.includes('_exists_') !== b.term.includes('_exists_'))
      return a.term.includes('_exists_') ? -1 : 1;

    // Sort by count in descending order
    if (a.count !== b.count) return b.count - a.count;

    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
};

export const groupTerms = (
  terms: FacetTermWithDetails[],
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

// Define the props interface for the FiltersList component
interface FiltersListProps {
  colorScheme: string;
  terms: FacetTermWithDetails[];
  searchPlaceholder: string;
  selectedFilters: string[];
  handleSelectedFilters: (arg: string[]) => void;
  isLoading: boolean;
  isUpdating?: boolean;
  config: FilterConfig;
}

export const FiltersList: React.FC<FiltersListProps> = React.memo(
  ({
    colorScheme,
    config,
    handleSelectedFilters,
    isLoading,
    isUpdating,
    searchPlaceholder,
    selectedFilters,
    terms: resultTerms,
  }) => {
    // filter out terms that are undefined or null or empty strings
    const terms = useMemo(
      () =>
        resultTerms?.filter(
          term =>
            term.term !== undefined && term.term !== null && term.term !== '',
        ) || [],
      [resultTerms],
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

    // Handle search input change and update the search term in the useFilterSearch hook
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value);

    const groupedAndSorted = useMemo(
      () => groupTerms(terms, selectedFilters, config?.groupBy),
      [terms, config?.groupBy, selectedFilters],
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
          {!isLoading && !isUpdating && !terms?.length ? (
            <Text fontStyle='italic' color='gray.800' mt={1} textAlign='center'>
              No results with {config.name.toLocaleLowerCase()} information.
            </Text>
          ) : (
            <SearchInput
              ariaLabel={searchPlaceholder}
              placeholder={searchPlaceholder}
              maxW='unset'
              size='sm'
              value={searchTerm}
              handleChange={handleSearchChange}
              colorScheme={colorScheme}
              onClose={() => setSearchTerm('')}
            />
          )}
        </Box>
        {/* List of filters available narrowed based on search and expansion toggle */}
        <CheckboxGroup value={selectedFilters} onChange={handleSelectedFilters}>
          <VirtualizedList items={searchedTerms}>
            {props => (
              <Checkbox
                isLoading={isLoading}
                isUpdating={isUpdating}
                colorScheme={colorScheme}
                filterName={config.name}
                {...props}
              />
            )}
          </VirtualizedList>
        </CheckboxGroup>
      </>
    );
  },
);
