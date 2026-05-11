import React from 'react';
import { Accordion, Box, Heading } from '@chakra-ui/react';
import { FiltersList } from 'src/views/search/components/filters/components/list';
import { FiltersSection } from 'src/views/search/components/filters/components/section';
import {
  FilterConfig,
  FilterTermType,
} from 'src/views/search/components/filters/types';
import {
  FILTERABLE_REPOSITORY_MATCHER_COLUMNS,
  RepositoryMatcherColumn,
} from 'src/views/repository-matcher/table-config';
import { SelectedRepositoryMatcherFilters } from 'src/views/repository-matcher/hooks/useRepositoryMatcherFilters';

interface FiltersProps {
  termsByColumnId: Record<string, FilterTermType[]>;
  selected: SelectedRepositoryMatcherFilters;
  onChange: (columnId: string, values: string[]) => void;
  isLoading?: boolean;
}

// FiltersList only reads `name` and (optionally) `groupBy` off its config; the
// rest of FilterConfig is search-page plumbing we stub out here.
const toFilterConfig = (col: RepositoryMatcherColumn<any>): FilterConfig => ({
  id: col.id,
  name: col.filter?.name ?? col.label,
  property: col.id,
  category: 'Dataset',
  description: col.filter?.description ?? '',
  queryType: 'facet',
  groupBy: col.filter?.groupBy,
});

export const Filters: React.FC<FiltersProps> = ({
  termsByColumnId,
  selected,
  onChange,
  isLoading,
}) => {
  return (
    <Box
      bg='white'
      borderWidth='1px'
      borderColor='gray.100'
      borderRadius='md'
      overflow='hidden'
    >
      <Heading
        as='h2'
        size='sm'
        px={4}
        py={3}
        borderBottom='1px solid'
        borderBottomColor='gray.100'
      >
        Filters
      </Heading>
      <Box px={2} py={1} bg='blackAlpha.50'>
        <Accordion
          allowMultiple
          defaultIndex={FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map((_, i) => i)}
        >
          {FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map(col => {
            const config = toFilterConfig(col);
            const name = col.filter?.name ?? col.label;
            return (
              <FiltersSection
                key={col.id}
                name={name}
                description={col.filter?.description ?? ''}
              >
                <FiltersList
                  config={config}
                  colorScheme='primary'
                  searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                  terms={termsByColumnId[col.id] ?? []}
                  selectedFilters={selected[col.id] ?? []}
                  handleSelectedFilters={values => onChange(col.id, values)}
                  isLoading={!!isLoading}
                />
              </FiltersSection>
            );
          })}
        </Accordion>
      </Box>
    </Box>
  );
};
