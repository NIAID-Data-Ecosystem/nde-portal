import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table as StyledTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  TableWrapper,
  TableSortToggle,
  TablePagination,
  Text,
  Collapse,
  Flex,
  SkeletonText,
} from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { queryFilterObject2String } from 'src/components/filters';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { SelectedFilterType } from '../hooks';
import { useRouter } from 'next/router';
import LoadingSpinner from 'src/components/loading';
import Empty from 'src/components/empty';
import { FormatLinkCell } from 'src/components/table/helpers';
import { Row } from 'src/components/table';
import { getTableRows } from './helpers';
import Banner from 'src/components/banner';
import { formatNumber } from 'src/utils/helpers';
import { Buttons } from './Buttons';

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
  const DEFAULT_PAGE = 1;
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState('name');

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
        sort: sortOrder,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      const filter_string = queryFilterObject2String(filters);
      return fetchSearchResults({
        q: queryString,
        extra_filter: filter_string || '', // extra filter updates aggregate fields
        size: `${size}`,
        from: `${(page - 1) * size}`,
        sort: sortOrder,
      });
    },
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    setTotal(prev => {
      if (data?.total) {
        return data?.total > MAX_RESULTS ? MAX_RESULTS : data?.total;
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

    setSortOrder(prev =>
      sort ? (Array.isArray(sort) ? sort[0] : sort) : prev,
    );
  }, [router]);

  // Empty State.
  if (!isLoading && (!data || data.results.length === 0)) {
    return (
      <Empty message='No results found.' alignSelf='center' py={10}>
        <Text>Search yielded no results, please try again.</Text>
        {/* brings the user to the search bar at the top of the page. */}
        <Button href='#search-header' mt={4}>
          Search Again.
        </Button>
      </Empty>
    );
  }

  const columns = [
    { key: '@type', title: 'type', hasSort: true },
    { key: 'name', title: 'Name', hasSort: true },
    { key: 'author', title: 'Author' },
    { key: 'citation', title: 'Associated Citations' },
  ];

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
  const DEFAULT_PAGE_OPTIONS = [50, 100];
  const Pagination = () => (
    <Flex position='relative'>
      <TablePagination
        isLoading={isLoading}
        total={data?.total || 0}
        numPages={Math.ceil((size < MAX_RESULTS ? total : MAX_RESULTS) / size)}
        size={size}
        setSize={s => updateRouter('size', s)}
        from={page - 1}
        setFrom={f => updateRouter('from', f + 1)}
        colorScheme='gray'
        pageSizeOptions={[DEFAULT_SIZE, ...DEFAULT_PAGE_OPTIONS].sort(
          (a, b) => a - b,
        )}
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
    <Box w='100%'>
      <Buttons queryString={queryString} filters={filters} />
      {/* Display banner on last page if results exceed amount allotted by API */}
      <Box mb={2} w='100%'>
        <Collapse in={page === Math.floor(MAX_RESULTS / size)} animateOpacity>
          <Banner status='info'>
            Only the first {formatNumber(10000)} results are displayed, please
            limit your query to get better results or use our API to download
            all results.
          </Banner>
        </Collapse>
      </Box>
      {/* Table*/}
      <TableWrapper colorScheme='secondary' w='100%'>
        <Pagination />
        <TableContainer>
          <StyledTable variant='striped' colorScheme='secondary'>
            {data?.total && (
              <TableCaption color='text.body'>
                Showing ({(page - 1) * size + 1}-{Math.min(page * size, total)})
                of {formatNumber(data?.total) || '-'} resources.
              </TableCaption>
            )}
            {columns && (
              <Thead>
                <Tr>
                  {columns.map(column => {
                    return (
                      <Th key={column.key} role='columnheader' scope='col'>
                        {column.title}
                        {column.hasSort && (
                          <TableSortToggle
                            isSelected={
                              column.key ===
                              (sortOrder.charAt(0) === '-'
                                ? sortOrder.slice(1)
                                : sortOrder)
                            }
                            sortBy={
                              sortOrder.charAt(0) === '-' ? 'DESC' : 'ASC'
                            }
                            handleToggle={(sortByAsc: boolean) => {
                              const sort = sortByAsc
                                ? column.key
                                : `-${column.key}`;
                              updateRouter('sort', sort);
                              updateRouter('from', DEFAULT_PAGE);
                            }}
                          />
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              </Thead>
            )}

            <Tbody>
              {(Array.from(Array(size)) as Row[]).map((_, i) => {
                return (
                  <Tr key={i} id={`${i}`}>
                    {Array.from(Array(columns.length)).map((_, j) => {
                      if (isLoading) {
                        return (
                          <Td
                            role='cell'
                            key={`${i}-${j}`}
                            id={`${i}-${j}`}
                            whiteSpace='break-spaces'
                            minW='50px'
                          >
                            <SkeletonText noOfLines={2} spacing='2' />
                          </Td>
                        );
                      }
                      if (columns && rows) {
                        const row = rows[i];
                        if (!isLoading && !row) {
                          return;
                        }
                        let col = columns[j];
                        let cell = (row && row[col.key]) || { value: '-' };

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
                      }
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </StyledTable>
        </TableContainer>
        <Pagination />
      </TableWrapper>
    </Box>
  );
};
