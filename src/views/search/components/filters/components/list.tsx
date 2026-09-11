import { Box, CheckboxGroup, Text } from '@chakra-ui/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VariableSizeList as List } from 'react-window';
import { SearchInput } from 'src/components/search-input';
import { SHOW_FILTER_ANY_NO_EXCLUSIVITY } from 'src/utils/feature-flags';
import { useDebounceValue } from 'usehooks-ts';

import { FilterConfig, FilterItem, FilterTermType } from '../types';
import { Checkbox } from './checkbox';

// Rows are measured after they mount, so the list starts out assuming every row
// is this tall.
const DEFAULT_ROW_SIZE = 40;

// A single measured row. The height of a filter option is not known ahead of
// time - a term with both a common and a scientific name wraps onto two lines,
// and any label can re-wrap when the panel changes width - so each row reports
// its rendered height back to the list.
const Row = ({
  children,
  index,
  setItemSize,
  style,
}: {
  children: React.ReactNode;
  index: number;
  setItemSize: (index: number, size: number) => void;
  style: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setItemSize(index, el.clientHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') return;

    // Keep measuring after mount: a row's height also changes when its loading
    // skeleton is replaced with the real label, or when the label re-wraps as
    // the filter panel is resized.
    const observer = new ResizeObserver(measure);
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
    const listRef = useRef<List>(null);
    const itemSizes = useRef<number[]>([]);

    const setItemSize = useCallback((index: number, size: number) => {
      // A hidden or not-yet-painted row measures 0; keep the default until it
      // reports a real height.
      if (!size || itemSizes.current[index] === size) return;

      // Record the measurement *before* invalidating the list's cached offsets.
      // Resetting first makes react-window recalculate against the size this
      // row had a moment ago, which left taller rows overlapping the row below
      // them until some later event happened to invalidate the cache again.
      itemSizes.current[index] = size;
      listRef.current?.resetAfterIndex?.(index);
    }, []);

    return (
      <Box
        pr={2}
        pb={2}
        css={{
          '& >.virtualized-list::-webkit-scrollbar': {
            width: '8px',
            height: '7px',
          },

          '& >.virtualized-list::-webkit-scrollbar-track': {
            background: 'blackAlpha.100',
            borderRadius: '8px',
          },

          '& >.virtualized-list::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '8px',
          },

          '& &:hover>.virtualized-list::-webkit-scrollbar-thumb': {
            background: 'text.placeholder',
          },
        }}
      >
        <List
          className='virtualized-list'
          ref={listRef}
          width='100%'
          height={
            items.length > 10
              ? 400
              : Math.max(100, items.length * DEFAULT_ROW_SIZE)
          }
          itemCount={items.length}
          itemSize={index => itemSizes.current[index] || DEFAULT_ROW_SIZE}
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
    if (a.count !== b.count) return (b.count ?? 0) - (a.count ?? 0);

    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
};

export const groupTerms = (
  terms: FilterTermType[],
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
  colorPalette: string;
  terms: FilterTermType[];
  searchPlaceholder: string;
  selectedFilters: string[];
  handleSelectedFilters: (arg: string[]) => void;
  loading: boolean;
  isUpdating?: boolean;
  config: FilterConfig;
}

export const FiltersList: React.FC<FiltersListProps> = React.memo(
  ({
    colorPalette,
    config,
    handleSelectedFilters,
    loading,
    isUpdating,
    searchPlaceholder,
    selectedFilters,
    terms: resultTerms,
  }) => {
    // filter out terms that are undefined or null or empty strings
    const terms = useMemo(() => {
      const filteredTerms =
        resultTerms?.filter(
          term =>
            term.term !== undefined && term.term !== null && term.term !== '',
        ) || [];

      // Behind the SHOW_FILTER_ANY_NO_EXCLUSIVITY feature flag: until
      // approved for production, checking "Any"/"No" does not hide the
      // other options for this filter.
      if (!SHOW_FILTER_ANY_NO_EXCLUSIVITY) {
        return filteredTerms;
      }

      // If the user has checked "Any <filter>" (_exists_) or
      // "No <filter>" (-_exists_), the other facet values (and the opposite
      // exists/not-exists option) are no longer relevant to choose from, so
      // hide them and only show the one option the user selected.
      if (selectedFilters.includes('_exists_')) {
        return filteredTerms.filter(term => term.term === '_exists_');
      }
      if (selectedFilters.includes('-_exists_')) {
        return filteredTerms.filter(term => term.term === '-_exists_');
      }

      return filteredTerms;
    }, [resultTerms, selectedFilters]);

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
        <Box p={2} pt={4}>
          {!loading && !isUpdating && !terms?.length ? (
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
        <CheckboxGroup
          value={selectedFilters}
          onValueChange={handleSelectedFilters}
        >
          <VirtualizedList items={searchedTerms}>
            {props => (
              <Checkbox
                loading={loading}
                isUpdating={isUpdating}
                colorPalette={colorPalette}
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
