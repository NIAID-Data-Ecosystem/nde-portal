import React, { useCallback, useMemo, useState } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

import { NextPage } from 'next';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { Table } from 'src/components/table';
import { useRepositoryMatcherData } from 'src/views/repository-matcher/hooks/useRepositoryMatcherData';
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
  const tableColumns = useMemo(
    () =>
      REPOSITORY_MATCHER_COLUMNS.map(col => ({
        title: col.label,
        property: col.id,
        isSortable: col.columns?.isSortable,
      })),
    [],
  );

  const [sortProperty, setSortProperty] = useState<string>(
    REPOSITORY_MATCHER_COLUMNS[0].id,
  );
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = useCallback((property: string, ascending: boolean) => {
    setSortProperty(property);
    setSortAsc(ascending);
  }, []);

  const sortedData = useMemo(() => {
    if (!data?.length) return data;
    const col = REPOSITORY_MATCHER_COLUMNS.find(c => c.id === sortProperty);
    if (!col) return data;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...data].sort((a, b) => {
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
  }, [data, sortProperty, sortAsc]);

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
