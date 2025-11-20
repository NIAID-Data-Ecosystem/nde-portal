import { Box, CheckboxGroup, Fieldset, Text } from '@chakra-ui/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VariableSizeList as List } from 'react-window';
import { SearchInput } from 'src/components/search-input';
import { useDebounceValue } from 'usehooks-ts';

import { FacetTermWithDetails, FilterConfig, FilterItem } from '../types';
import { Checkbox } from './checkbox';

const DEFAULT_SIZE = 40;

interface RowProps {
  index: number;
  style: React.CSSProperties;
  children: React.ReactNode;
  setItemSize: (index: number, size: number) => void;
}

const Row = ({ children, index, style, setItemSize }: RowProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;

    const el = ref.current;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const height = Math.ceil(entry.contentRect.height);
      setItemSize(index, height);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, setItemSize]);

  return (
    <div className='virtualized-row' style={style}>
      <div ref={ref}>{children}</div>
    </div>
  );
};

// VirtualizedList component to render the list of filter terms
const VirtualizedList = React.memo(
  ({
    children,
    items,
  }: {
    items: FilterItem[];
    children: (props: FilterItem) => JSX.Element;
  }) => {
    const listRef = useRef<List | null>(null);
    const itemRefs = useRef<number[]>(Array(items.length).fill(DEFAULT_SIZE));
    const setItemSize = useCallback((index: number, size: number) => {
      const height = Math.ceil(size);
      const current = itemRefs.current[index];

      if (current === height) return;

      itemRefs.current[index] = height;
      listRef.current?.resetAfterIndex(index, true);
    }, []);

    return (
      <Box
        pr={2}
        pb={2}
        css={{
          '&>.virtualized-list::-webkit-scrollbar': {
            width: '8px',
            height: '7px',
          },
          '&>.virtualized-list::-webkit-scrollbar-track': {
            background: 'blackAlpha.100',
            borderRadius: '8px',
          },
          '&>.virtualized-list::-webkit-scrollbar-thumb': {
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
            <Row index={index} style={style} setItemSize={setItemSize}>
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

  return [...terms].sort((a, b) => {
    const aSelected = selectedSet.has(a.term);
    const bSelected = selectedSet.has(b.term);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;

    if (a.term.includes('-_exists_') !== b.term.includes('-_exists_')) {
      return a.term.includes('-_exists_') ? -1 : 1;
    }

    if (a.term.includes('_exists_') !== b.term.includes('_exists_')) {
      return a.term.includes('_exists_') ? -1 : 1;
    }

    if (a.count !== b.count) return b.count - a.count;

    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
};

const UNGROUPED_KEY = 'Ungrouped';
const EXISTS_KEY = '_exists_';

export const groupTerms = (
  terms: FacetTermWithDetails[],
  selectedFilters: string[],
  groupOrder?: FilterConfig['groupBy'],
) => {
  if (!terms?.length) return [];

  const groupedTerms = terms.reduce<Record<string, FilterItem[]>>(
    (acc, term) => {
      const group =
        term.groupBy ||
        (term.term.includes(EXISTS_KEY) && EXISTS_KEY) ||
        UNGROUPED_KEY;

      (acc[group] ??= []).push(term);
      return acc;
    },
    {},
  );

  Object.keys(groupedTerms).forEach(group => {
    groupedTerms[group] = sortTerms(groupedTerms[group], selectedFilters);
  });

  const results: FilterItem[] = [];

  if (groupedTerms[EXISTS_KEY]) {
    results.push(...groupedTerms[EXISTS_KEY]);
    delete groupedTerms[EXISTS_KEY];
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
      if (group !== UNGROUPED_KEY) {
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
  if (groupedTerms[UNGROUPED_KEY]) {
    results.push(...groupedTerms[UNGROUPED_KEY]);
  }

  return results;
};

// Define the props interface for the FiltersList component
interface FiltersListProps {
  colorPalette: string;
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
    colorPalette,
    config,
    handleSelectedFilters,
    isLoading,
    isUpdating,
    searchPlaceholder,
    selectedFilters,
    terms,
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

    // Handle search input change and update the search term in the useFilterSearch hook
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
      [],
    );

    const groupedAndSorted = useMemo(
      () => groupTerms(terms, selectedFilters, config?.groupBy),
      [terms, config?.groupBy, selectedFilters],
    );
    // Filter the terms based on the search term
    const searchedTerms: FilterItem[] = useMemo(() => {
      if (!groupedAndSorted?.length) return [];

      if (!debouncedSearchTerm) return groupedAndSorted;

      const q = debouncedSearchTerm.toLowerCase();
      return groupedAndSorted.filter(t => t.label.toLowerCase().includes(q));
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
              colorPalette={colorPalette}
              onClose={() => setSearchTerm('')}
            />
          )}
        </Box>
        {/* List of filters available narrowed based on search and expansion toggle */}
        <Fieldset.Root>
          <CheckboxGroup
            colorPalette='blue' // keep this fixed as blue for checkbox colors
            value={selectedFilters}
            onValueChange={handleSelectedFilters}
            gap={4}
          >
            <VirtualizedList items={searchedTerms}>
              {props => (
                <Checkbox
                  isLoading={isLoading}
                  isUpdating={isUpdating}
                  colorPalette={colorPalette}
                  filterName={config.name}
                  {...props}
                />
              )}
            </VirtualizedList>
          </CheckboxGroup>
        </Fieldset.Root>
      </>
    );
  },
);
