import {
  Box,
  Flex,
  Heading,
  Separator,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useCallback, useMemo, useState } from 'react';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { SearchInput } from 'src/components/search-input';
import { useTableSearch } from 'src/components/table/data-table';
import { DataDictionary } from 'src/views/repository-matcher/components/DataDictionary';
import { Filters } from 'src/views/repository-matcher/components/Filters';
import { RepositoryMatcherTable } from 'src/views/repository-matcher/components/RepositoryMatcherTable';
import { useRepositoryMatcherData } from 'src/views/repository-matcher/hooks/useRepositoryMatcherData';
import {
  SelectedRepositoryMatcherFilters,
  useRepositoryMatcherFilters,
} from 'src/views/repository-matcher/hooks/useRepositoryMatcherFilters';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

const COLUMNS_WITH_DEFINITIONS = REPOSITORY_MATCHER_COLUMNS.filter(
  col => col.description || col.info?.terms,
);

const RepositoryMatcher: NextPage = () => {
  const fields = useMemo(
    () =>
      Array.from(
        new Set(REPOSITORY_MATCHER_COLUMNS.flatMap(col => col.fields)),
      ),
    [],
  );

  const { data, loading, error } = useRepositoryMatcherData([
    ...fields,
    'creativeWorkStatus',
  ]);

  /****** Search *****/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );
  // Search iterates ALL columns (incl. hidden), so toggling visibility
  // doesn't drop matches that live in hidden columns.
  const searchedData = useTableSearch(data, searchTerm);

  /****** Filters *****/
  const [selectedFilters, setSelectedFilters] =
    useState<SelectedRepositoryMatcherFilters>({});

  // Filter terms count against the search-scoped rows so the facets stay
  // consistent with what the table is showing.
  const { filteredData, termsByColumnId } = useRepositoryMatcherFilters(
    searchedData,
    selectedFilters,
  );
  const handleFilterChange = useCallback(
    (columnId: string, values: string[]) =>
      setSelectedFilters(prev => ({ ...prev, [columnId]: values })),
    [],
  );

  const filterTags = useMemo(() => {
    const tags: { name: string; value: string; property: string }[] = [];
    for (const col of REPOSITORY_MATCHER_COLUMNS) {
      const selectedValues = selectedFilters[col.id];
      if (selectedValues?.length) {
        const name = col.header || '';
        for (const value of selectedValues) {
          tags.push({ name, value, property: col.id });
        }
      }
    }
    return tags;
  }, [selectedFilters]);

  const removeSingleFilter = useCallback((property: string, value: string) => {
    setSelectedFilters(prev => {
      const prevValues = prev[property] ?? [];
      return {
        ...prev,
        [property]: prevValues.filter(v => v !== value),
      };
    });
  }, []);

  // The set of term labels actually present in the data for each column with a
  // dictionary definition. Computed against the full (unfiltered) dataset so
  // the dictionary stays a stable reference regardless of search/filter state.
  // Based on feedback that users want to see definitions for terms actually
  // present in the table: https://github.com/NIAID-Data-Ecosystem/niaid-feedback/issues/276#issuecomment-4674101195
  const presentTermsByColumnId = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    if (!data?.length) return result;
    for (const col of COLUMNS_WITH_DEFINITIONS) {
      if (!col.info?.terms || !col.filter) continue;
      const values = new Set<string>();
      for (const row of data) {
        for (const value of col.filter.getFilterValues(row[col.id])) {
          values.add(value);
        }
      }
      result[col.id] = values;
    }
    return result;
  }, [data]);

  return (
    <PageContainer meta={getPageSeoConfig('/repository-matcher')} px={0} py={0}>
      <Flex direction='column' gap={4} px={{ base: 4, md: 40 }} py={8}>
        <Heading as='h1' size='lg'>
          Repository Matcher
        </Heading>
        <Text fontSize='md' lineHeight='moderate'>
          Find a suitable repository that accepts research data deposits. Filter
          by research domain, repository type, and other criteria.
        </Text>
      </Flex>
      <Separator />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align='flex-start'
        gap={4}
        mb={8}
      >
        <Box display={{ base: 'none', md: 'block' }} w='320px' flexShrink={0}>
          <Filters
            termsByColumnId={termsByColumnId}
            selected={selectedFilters}
            onChange={handleFilterChange}
            onClearAll={() => setSelectedFilters({})}
            loading={loading}
          />
        </Box>
        <Box
          flex={1}
          minW={0}
          w='100%'
          px={{ base: 4, md: 8 }}
          mt={6}
          maxWidth='2000px'
        >
          {/*
            The results area (search, filters, count, table) is at most one
            screen tall. The toolbar keeps its natural height and the table
            takes whatever is left, so with the area scrolled to the top the
            table fills the rest of the window, wherever the toolbar wraps.
            Fewer rows shrink it; the dictionary follows below.
          */}
          <Flex direction='column' maxHeight={{ base: 'none', sm: '800px' }}>
            {/*
              Margins don't collapse in a flex column, so these are set to
              give the same gaps the block layout's collapsed margins did.
            */}
            <Stack
              direction='row'
              gap={2}
              mb={{ base: 2, md: 0 }}
              flexWrap='wrap'
              alignItems='center'
              width={{ base: '100%', md: '80%' }}
            >
              <SearchInput
                size='md'
                placeholder="Search repositories — i.e. 'IID', 'sequencing'"
                ariaLabel='Search repositories and resource catalogs'
                value={searchTerm}
                handleChange={handleSearchChange}
                isResponsive={false}
                alignItems='flex-end'
                onClose={() => setSearchTerm('')}
                colorPalette='primary'
                flexProps={{
                  width: '100%',
                }}
              />
            </Stack>
            <Box display={{ base: 'block', md: 'none' }}>
              <Filters
                termsByColumnId={termsByColumnId}
                selected={selectedFilters}
                onChange={handleFilterChange}
                onClearAll={() => setSelectedFilters({})}
                loading={loading}
              />
            </Box>
            {/* <!-- Filter Tags--> */}
            {filterTags.length > 0 && (
              <Text
                display={{ base: 'block', md: 'none' }}
                fontSize='sm'
                fontWeight='semibold'
                mt={4}
              >
                Active Filters:
              </Text>
            )}
            <Stack
              direction='row'
              gap={2}
              flexWrap='wrap'
              minW={{ base: 0, md: '300px' }}
              my={4}
            >
              {filterTags.length > 0 && (
                <Tag.Root
                  key='clear'
                  size='md'
                  variant='outline'
                  borderRadius='full'
                  colorPalette='primary'
                  borderColor='primary.100'
                >
                  <Tag.Label>Clear all</Tag.Label>
                  <Tag.EndElement>
                    <Tag.CloseTrigger
                      aria-label='close'
                      onClick={() => setSelectedFilters({})}
                    />
                  </Tag.EndElement>
                </Tag.Root>
              )}
              {filterTags.map(filter => {
                const { property, value } = filter;
                return (
                  <Tag.Root
                    key={property + '-' + value}
                    size='md'
                    variant='subtle'
                    borderRadius='full'
                    colorPalette='primary'
                  >
                    <Tag.Label fontWeight='medium'>{value}</Tag.Label>
                    <Tag.EndElement>
                      <Tag.CloseTrigger
                        aria-label='close'
                        onClick={() => removeSingleFilter(property, value)}
                      />
                    </Tag.EndElement>
                  </Tag.Root>
                );
              })}
            </Stack>

            <RepositoryMatcherTable
              rows={filteredData}
              loading={loading}
              error={error}
            />
          </Flex>

          {/* Information and definitions section */}
          <DataDictionary
            columns={COLUMNS_WITH_DEFINITIONS}
            presentTermsByColumnId={presentTermsByColumnId}
          />
        </Box>
      </Flex>
    </PageContainer>
  );
};

export default RepositoryMatcher;
