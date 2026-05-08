import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

import { NextPage } from 'next';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { SearchInput } from 'src/components/search-input';
import { Table } from 'src/components/table';
import { CustomizeColumnsPopover } from 'src/views/repository-matcher/components/CustomizeColumnsPopover';
import { useRepositoryMatcherData } from 'src/views/repository-matcher/hooks/useRepositoryMatcherData';
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
    if (!searchedData?.length) return searchedData;
    const col = REPOSITORY_MATCHER_COLUMNS.find(c => c.id === sortProperty);
    if (!col) return searchedData;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...searchedData].sort((a, b) => {
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
  }, [searchedData, sortProperty, sortAsc]);

  return (
    <PageContainer meta={getPageSeoConfig('/')}>
      <Flex direction='column' gap={4} mb={6}>
        <Heading as='h1' size='lg'>
          Repository Matcher
        </Heading>
        <Text fontSize='md' lineHeight='short'>
          Find a suitable repository to deposit your data. Filter by type,
          research domain, accepted data, and more.
        </Text>
      </Flex>

      <Stack
        direction='row'
        spacing={2}
        mb={2}
        flexWrap='wrap'
        alignItems='center'
      >
        <SearchInput
          size='md'
          placeholder='Search table'
          ariaLabel='Search repositories and resource catalogs'
          value={searchTerm}
          handleChange={handleSearchChange}
          isResponsive={false}
          alignItems='flex-end'
          onClose={() => setSearchTerm('')}
        />
        <CustomizeColumnsPopover
          onVisibleColumnsChange={setVisibleColumnIds}
          onColumnOrderChange={setOrderedColumnIds}
        />
      </Stack>

      <Box py={2}>
        <Text fontSize='sm' fontWeight='semibold' lineHeight='normal'>
          {sortedData?.length ?? 0} results
        </Text>
      </Box>

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
    </PageContainer>
  );
};

export default RepositoryMatcher;
