import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Flex,
} from 'nde-design-system';
import { PageContent } from 'src/components/page-container';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { queryFilterObject2String } from 'src/components/filter/helpers';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { SelectedFilterType } from '../hooks';
import { useRouter } from 'next/router';
import LoadingSpinner from 'src/components/loading';
import Empty from 'src/components/empty';
import { FormatLinkCell, getTableColumns } from 'src/components/table/helpers';
import { Row } from 'src/components/table';
import { getTableRows } from './helpers';

interface SummaryTableProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
}

interface TableProps {
  isLoading: boolean;
  data?: FormattedResource[];
  total?: FetchSearchResultsResponse['total'];
  queryString: string;
  size: number;
  setSize: (s: number) => void;
}

export const MAX_RESULTS = 10000;

export const SummaryTable: React.FC<SummaryTableProps> = ({
  queryString,
  filters,
}) => {
  const router = useRouter();

  // num of rows to display per page.
  const DEFAULT_SIZE = 10;
  const DEFAULT_PAGE = 0;
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);

  // Fetch data for table.
  const { data, isLoading } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        filters,
        size,
        from: page,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      const filter_string = queryFilterObject2String(filters);

      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
        size: `${size}`,
        from: `${page * size}`,
      });
    },
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    setTotal(prev => {
      if (data?.total) {
        return data?.total;
      }
      return prev;
    });
  }, [data]);
  // Set initial state based on route params.
  useEffect(() => {
    const { size, from, sort } = router.query;
    setPage(() => {
      if (!from) {
        return DEFAULT_PAGE;
      }
      return Array.isArray(from) ? +from[0] : +from;
    });

    setSize(prev => (size ? (Array.isArray(size) ? +size[0] : +size) : prev));

    // setSortOrder(prev =>
    //   sort ? (Array.isArray(sort) ? sort[0] : sort) : prev,
    // );
  }, [router]);

  // num of rows per page
  const accessorFn = useCallback(v => v.sortValue, []);

  // Empty State.
  if (!isLoading && (!data || data.results.length === 0)) {
    return (
      <Empty message='No results found.' alignSelf='center'>
        <Text>Search yielded no results, please try again.</Text>
        {/* brings the user to the search bar at the top of the page. */}
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

  const columns = data && getTableColumns(data.results, column_name_config);
  const rows: any = data && getTableRows(data.results);

  const updateRouter = (param: string, value: string | number) => {
    router.query[param] = `${value}`;
    router.push(
      {
        query: {
          ...router.query,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  const Pagination = () => (
    <Flex position='relative'>
      <TablePagination
        isLoading={isLoading}
        total={total || 0}
        size={size}
        setSize={s => updateRouter('size', s)}
        from={page}
        setFrom={f => updateRouter('from', f)}
        colorScheme='gray'
        numPages={
          size < MAX_RESULTS ? Math.ceil(total / size) : MAX_RESULTS / size
        }
        pageSizeOptions={[DEFAULT_SIZE, 50, 100].sort((a, b) => a - b)}
      ></TablePagination>
      <Flex
        position='absolute'
        top={[0, 'unset']}
        bottom={['unset', 0]}
        left={0}
      >
        <LoadingSpinner isLoading={isLoading} />
      </Flex>
    </Flex>
  );

  return (
    <PageContent>
      <>
        {/* Display banner on last page if results exceed amount allotted by API */}
        {/* <Collapse in={selectedPage === Math.floor(MAX_RESULTS / selectedPerPage)} animateOpacity>
        <Banner status='info'>
          Only the first {formatNumber(10000)} results are displayed, please
          limit your query to get better results or use our API to download all
          results.
        </Banner>
      </Collapse> */}
        <TableWrapper colorScheme={'secondary'} w='100%'>
          <Pagination />
          <TableContainer>
            <StyledTable variant='striped' colorScheme={'secondary'}>
              {total && (
                <TableCaption color='text.body'>
                  Showing ({page * size}-{Math.min((page + 1) * size, total)})
                  of {total} resources.
                </TableCaption>
              )}
              {columns && (
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
              )}

              {columns && (
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
              )}
            </StyledTable>
          </TableContainer>
          {/* <Pagination /> */}
        </TableWrapper>
      </>
    </PageContent>
  );
};
