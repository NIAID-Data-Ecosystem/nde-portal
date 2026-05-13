import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Divider,
  Flex,
  Heading,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from '@chakra-ui/react';

import { NextPage } from 'next';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { SearchInput } from 'src/components/search-input';
import { Table } from 'src/components/table';
import { CustomizeColumnsPopover } from 'src/views/repository-matcher/components/CustomizeColumnsPopover';
import { Filters } from 'src/views/repository-matcher/components/Filters';
import { useRepositoryMatcherData } from 'src/views/repository-matcher/hooks/useRepositoryMatcherData';
import {
  SelectedRepositoryMatcherFilters,
  useRepositoryMatcherFilters,
} from 'src/views/repository-matcher/hooks/useRepositoryMatcherFilters';
import { useSearchedData } from 'src/views/repository-matcher/hooks/useSearchedData';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

const RepositoryMatcher: NextPage = () => {
  const fields = useMemo(
    () =>
      Array.from(
        new Set(REPOSITORY_MATCHER_COLUMNS.flatMap(col => col.fields)),
      ),
    [],
  );

  const { data, isLoading } = useRepositoryMatcherData(fields);

  /****** Customize columns: visibility + order *****/
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    REPOSITORY_MATCHER_COLUMNS.filter(c => c.columns?.isDefault !== false).map(
      c => c.id,
    ),
  );
  const [orderedColumnIds, setOrderedColumnIds] = useState<string[] | null>(
    null,
  );

  // Render columns in user-chosen order, filtered to currently visible IDs.
  const tableColumns = useMemo(() => {
    const order = orderedColumnIds ?? REPOSITORY_MATCHER_COLUMNS.map(c => c.id);
    const visible = new Set(visibleColumnIds);
    return order
      .filter(id => visible.has(id))
      .map(id => REPOSITORY_MATCHER_COLUMNS.find(c => c.id === id))
      .filter((col): col is (typeof REPOSITORY_MATCHER_COLUMNS)[number] =>
        Boolean(col),
      )
      .map(col => ({
        title: col.label,
        property: col.id,
        isSortable: col.columns?.isSortable,
        props: col.columns?.style,
      }));
  }, [visibleColumnIds, orderedColumnIds]);

  /****** Search *****/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );
  // Search iterates ALL columns (incl. hidden), so toggling visibility
  // doesn't drop matches that live in hidden columns.
  const searchedData = useSearchedData(data, searchTerm);

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

  /****** Sort *****/
  const [sortProperty, setSortProperty] = useState<string>(
    REPOSITORY_MATCHER_COLUMNS[0].id,
  );
  const [sortAsc, setSortAsc] = useState(true);

  // If the currently sorted column gets hidden, fall back to the first
  // visible column so the table doesn't sort on something the user can't see.
  useEffect(() => {
    if (!visibleColumnIds.length) return;
    if (!visibleColumnIds.includes(sortProperty)) {
      setSortProperty(visibleColumnIds[0]);
    }
  }, [visibleColumnIds, sortProperty]);

  const handleSort = useCallback((property: string, ascending: boolean) => {
    setSortProperty(property);
    setSortAsc(ascending);
  }, []);

  const sortedData = useMemo(() => {
    if (!filteredData?.length) return filteredData;
    const col = REPOSITORY_MATCHER_COLUMNS.find(c => c.id === sortProperty);
    if (!col) return filteredData;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...filteredData].sort((a, b) => {
      let va: any = accessor(a[col.id] as any);
      let vb: any = accessor(b[col.id] as any);
      va = va ?? (typeof va === 'number' ? 0 : '');
      vb = vb ?? (typeof vb === 'number' ? 0 : '');
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), undefined, {
              sensitivity: 'base',
              numeric: true,
            });
      return sortAsc ? cmp : -cmp;
    });
  }, [filteredData, sortProperty, sortAsc]);

  const filterTags = useMemo(() => {
    const tags: { name: string; value: string; property: string }[] = [];
    for (const col of REPOSITORY_MATCHER_COLUMNS) {
      const selectedValues = selectedFilters[col.id];
      if (selectedValues?.length) {
        const name = col.filter?.name ?? col.label;
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

  return (
    <PageContainer meta={getPageSeoConfig('/')}>
      <Flex direction='column' gap={4} px={40} py={8}>
        <Heading as='h1' size='lg'>
          Repository Matcher
        </Heading>
        <Text fontSize='md' lineHeight='short'>
          Find a suitable repository to deposit your data. Filter by type,
          research domain, accepted data, and more.
        </Text>
      </Flex>
      <Divider />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align='flex-start'
        gap={4}
      >
        <Box
          w={{ base: '100%', md: '320px' }}
          flexShrink={0}
          position={{ base: 'static', md: 'sticky' }}
          top={{ md: 4 }}
        >
          <Filters
            termsByColumnId={termsByColumnId}
            selected={selectedFilters}
            onChange={handleFilterChange}
            isLoading={isLoading}
          />
        </Box>
        <Box flex={1} minW={0} w='100%' px={8} mt={6}>
          <Stack
            direction='row'
            spacing={2}
            mb={2}
            flexWrap='wrap'
            alignItems='center'
            width='80%'
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
              width='100%'
              colorScheme='primary'
            />
          </Stack>
          {/* <!-- Filter Tags--> */}
          <Stack
            direction='row'
            spacing={2}
            flex={1}
            flexWrap='wrap'
            minW='300px'
          >
            {filterTags.length > 0 && (
              <Tag
                key='clear'
                size='lg'
                variant='outline'
                borderRadius='full'
                colorScheme='primary'
                borderColor='primary.100'
              >
                <TagLabel>Clear all</TagLabel>
                <TagCloseButton onClick={() => setSelectedFilters({})} />
              </Tag>
            )}
            {filterTags.map(filter => {
              const { property, value } = filter;
              return (
                <Tag
                  key={property + '-' + value}
                  size='lg'
                  variant='subtle'
                  borderRadius='full'
                  colorScheme='primary'
                >
                  <TagLabel fontWeight='medium'>{value}</TagLabel>
                  <TagCloseButton
                    onClick={() => removeSingleFilter(property, value)}
                  />
                </Tag>
              );
            })}
          </Stack>
          <Flex
            w='100%'
            py={2}
            justifyContent='space-between'
            alignItems='baseline'
          >
            <Text fontSize='sm' fontWeight='semibold' lineHeight='normal'>
              {sortedData?.length ?? 0} results
            </Text>
            <CustomizeColumnsPopover
              onVisibleColumnsChange={setVisibleColumnIds}
              onColumnOrderChange={setOrderedColumnIds}
            />
          </Flex>

          <Table
            ariaLabel='Repository matcher table'
            caption='Repositories and resource catalogs available for data deposit'
            columns={tableColumns}
            data={(isLoading ? Array(10).fill({}) : sortedData) as any}
            isLoading={isLoading}
            hasPagination={false}
            stickyHeader
            tableContainerProps={{
              overflowX: 'auto',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            getTableRowProps={(_, idx) => ({
              bg: idx % 2 === 0 ? 'white' : 'page.alt',
            })}
            controlledSortProperty={sortProperty}
            controlledSortAsc={sortAsc}
            onControlledSort={handleSort}
            getCells={({ column, data: row, isLoading: rowLoading }) => {
              const col = REPOSITORY_MATCHER_COLUMNS.find(
                c => c.id === column.property,
              );
              if (!col) return null;
              return col.component({
                value: row?.[col.id],
                isLoading: rowLoading,
              });
            }}
          />
        </Box>
      </Flex>
    </PageContainer>
  );
};

export default RepositoryMatcher;
