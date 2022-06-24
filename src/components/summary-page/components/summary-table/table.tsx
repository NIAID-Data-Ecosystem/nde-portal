import React, { useCallback } from 'react';
import {
  Button,
  Link,
  Table as StyledTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  TableWrapper,
  Tfoot,
  useTableSort,
  TableSortToggle,
  TablePagination,
  Tag,
  Text,
  Collapse,
} from 'nde-design-system';

import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import Empty from 'src/components/empty';
import { FormatLinkCell, getTableColumns } from 'src/components/table/helpers';
import { Row } from 'src/components/table';
import {
  formatAuthorsList2String,
  formatCitationString,
  formatNumber,
} from 'src/utils/helpers';
import NextLink from 'next/link';
import { getTypeColor } from 'src/components/resource-sections/components/type-banner';
import Banner from 'src/components/banner';
import { getTableRows } from './helpers';

interface TableProps {
  isLoading: boolean;
  data?: FormattedResource[];
  total?: FetchSearchResultsResponse['total'];
  queryString: string;
  size: number;
  setSize: (s: number) => void;
}

export const MAX_RESULTS = 10000;

const Table: React.FC<TableProps> = ({
  isLoading,
  data,
  total,
  queryString,
  size,
  setSize,
  page,
  setPage,
}) => {
  // num of rows per page
  const accessorFn = useCallback(v => v.sortValue, []);

  // Loading State.
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  // Empty State.
  if (!data || data.length === 0) {
    return (
      <Empty message='No results found.' alignSelf='center'>
        <Text>Search yielded no results, please try again.</Text>
        <Button href='#search-header' mt={4}>
          Search Again.
        </Button>
      </Empty>
    );
  }

  const column_name_config = {
    '@type': 'type',
    name: 'Name',
    author: 'Author',
    citation: 'Associated Citations',
  } as Record<keyof FormattedResource, string>;

  const columns = data && getTableColumns(data, column_name_config);
  const rows = getTableRows(data);
  return (
    <>
      {/* Display banner on last page if results exceed amount allotted by API */}
      {/* <Collapse in={selectedPage === Math.floor(MAX_RESULTS / selectedPerPage)} animateOpacity>
        <Banner status='info'>
          Only the first {formatNumber(10000)} results are displayed, please
          limit your query to get better results or use our API to download all
          results.
        </Banner>
      </Collapse> */}
      <TableWrapper colorScheme={'secondary'}>
        <TablePagination
          total={total || 0}
          size={size}
          setSize={setSize}
          from={page}
          setFrom={setPage}
          colorScheme='gray'
          // [to do]:change to default size
          pageSizeOptions={[size, 50, 100].sort((a, b) => a - b)}
        ></TablePagination>
        <TableContainer>
          <StyledTable variant='striped' colorScheme={'secondary'}>
            {total && (
              <TableCaption color='text.body'>
                Showing ({page * size}-{Math.min((page + 1) * size, total)}) of{' '}
                {total} resources.
              </TableCaption>
            )}
            <Thead>
              <Tr>
                {columns.map(column => {
                  return (
                    <Th key={column.key} role='columnheader' scope='col'>
                      {column.title}
                      {/* <TableSortToggle
                        isSelected={column.key === orderBy}
                        sortBy={sortBy}
                        handleToggle={(sortByAsc: boolean) => {
                          updateSort(column.key, sortByAsc);
                        }}
                      /> */}
                    </Th>
                  );
                })}
              </Tr>
            </Thead>

            <Tbody>
              {(rows as Row[]).map((row, i) => {
                return (
                  <Tr key={i} id={`${i}`}>
                    {columns.map((col, j) => {
                      let cell = row[col.key];
                      return (
                        <Td
                          role='cell'
                          key={`${cell.value}-${i}-${j}`}
                          id={`${cell.value}-${i}-${j}`}
                          whiteSpace='break-spaces'
                          minW='50px'
                          isNumeric={typeof cell.value === 'number'}
                          {...cell.props}
                        >
                          <FormatLinkCell value={cell.value} />
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </StyledTable>
        </TableContainer>
        <TablePagination
          total={total || 0}
          size={size}
          setSize={setSize}
          from={page}
          setFrom={setPage}
          colorScheme='gray'
          // [to do]:change to default size
          pageSizeOptions={[size, 50, 100].sort((a, b) => a - b)}
        ></TablePagination>
      </TableWrapper>
    </>
  );
};

export default Table;
