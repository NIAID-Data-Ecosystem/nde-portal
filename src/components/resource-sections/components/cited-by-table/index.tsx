import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Flex,
  Table,
  Tr,
  Text,
  VisuallyHidden,
  Heading,
  Skeleton,
  Stack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { CitedBy as CitedByType } from 'src/utils/api/types';
import { uniqueId } from 'lodash';
import { Cell, EmptyCell, Th } from 'src/components/table/components/cell';
import { Row } from 'src/components/table/components/row';
import { TableContainer } from 'src/components/table/components/table-container';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { TagWithUrl } from 'src/components/tag-with-url';

// Constants for table configuration.
// [ROW_SIZES]: num of rows per page
const ROW_SIZES = [5, 10, 50, 100];

// [COLUMNS]: table columns
const COLUMNS = [
  { key: 'name', title: 'Name' },
  { key: '@type', title: 'Type' },
  { key: 'journalName', title: 'Journal' },
  {
    key: 'datePublished',
    title: 'Date Published',
    props: { w: '200px', maxW: '200px', minW: 'unset' },
  },
];

interface Row extends CitedByType {
  key: string;
}
interface CitedByTable {
  isLoading: boolean;
  data: CitedByType[];
}

// Renders a table with citedby data.
export const CitedByTable: React.FC<CitedByTable> = ({
  data: citedByData,
  isLoading,
}) => {
  // create custom [properties] for sorting. This is needed because the data is nested.
  const citedBy = useMemo(
    () =>
      citedByData?.map((cited, idx) => {
        return {
          ...cited,
          key: uniqueId(`citedBy-${cited.identifier || idx}`),
        };
      }),
    [citedByData],
  );
  // sort data based on column sorting
  const accessor = useCallback((v: any) => {
    return v;
  }, []);

  const [{ data, orderBy, sortBy }, updateSort] = useTableSort({
    data: citedBy,
    accessor,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(ROW_SIZES[0]);

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // [rows]: all rows to display

  const [rows, setRows] = useState<Row[]>(data);

  useEffect(() => {
    // update rows to display based on current page number and num of rows per page
    setRows(data.slice(from * size, from * size + size));
  }, [data, size, from]);

  if (!isLoading && citedBy?.length === 0) {
    return <Text>No data available.</Text>;
  }

  return (
    <Skeleton isLoaded={!isLoading} overflow='auto'>
      <Heading as='h4' fontSize='sm' mx={1} mb={4} fontWeight='semibold'>
        Publications that cite the work.
      </Heading>
      <TableWrapper colorScheme='gray'>
        <TableContainer>
          <Table
            role='table'
            aria-label='Cited by information'
            aria-describedby='citedby-table-caption'
            aria-rowcount={rows.length}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden id='citedby-table-caption' as='caption'>
              Publications that cite the work.
            </VisuallyHidden>
            <thead>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {COLUMNS.map(column => {
                  return (
                    <Th
                      key={`table-col-th-${column.key}`}
                      label={column.title}
                      isSelected={column.key === orderBy}
                      borderBottomColor='primary.200'
                      isSortable={true}
                      tableSortToggleProps={{
                        isSelected: column.key === orderBy,
                        sortBy,
                        handleToggle: (sortByAsc: boolean) => {
                          updateSort(column.key, sortByAsc);
                        },
                      }}
                      {...column.props}
                    ></Th>
                  );
                })}
              </Tr>
            </thead>
            <tbody>
              {rows.map(item => {
                return (
                  <Row
                    as='tr'
                    key={`table-tr-${item.key}`}
                    flexDirection='column'
                    borderColor='gray.200'
                  >
                    <Flex as='td' role='cell'>
                      {COLUMNS.map(column => {
                        return (
                          <Cell
                            key={`table-td-${item.key}-${column.key}`}
                            as='div'
                            {...column.props}
                          >
                            {column.key === 'name' && (
                              <>
                                {item?.url ? (
                                  <Link href={item.url} isExternal mb={2}>
                                    <Text fontSize='inherit' noOfLines={3}>
                                      {item.name ||
                                        item.url ||
                                        '[No title provided]'}
                                    </Text>
                                  </Link>
                                ) : (
                                  <Text
                                    fontWeight='medium'
                                    noOfLines={3}
                                    mb={2}
                                  >
                                    {item.name || '[No title provided]'}
                                  </Text>
                                )}
                                <Stack spacing={1} mt={1}>
                                  {item.identifier && (
                                    <TagWithUrl label='ID |'>
                                      {item.identifier}
                                    </TagWithUrl>
                                  )}
                                  {item.pmid && (
                                    <TagWithUrl label='PMID |'>
                                      {item.pmid}
                                    </TagWithUrl>
                                  )}
                                  {item.doi && (
                                    <TagWithUrl label='DOI |'>
                                      {item.doi}
                                    </TagWithUrl>
                                  )}
                                </Stack>
                              </>
                            )}

                            {column.key === '@type' &&
                              (item['@type'] ? (
                                <>
                                  <TagWithUrl colorScheme='primary'>
                                    {item['@type']}
                                  </TagWithUrl>
                                </>
                              ) : (
                                <EmptyCell />
                              ))}

                            {column.key === 'journalName' &&
                              (item['journalName'] ? (
                                <>
                                  <Text fontSize='inherit' noOfLines={3}>
                                    {item['journalName']}
                                  </Text>
                                </>
                              ) : (
                                <EmptyCell />
                              ))}

                            {column.key.toLowerCase().includes('date') &&
                              (item[column.key as keyof CitedByType] ? (
                                <>
                                  {new Date(
                                    item[
                                      column.key as keyof CitedByType
                                    ] as string,
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </>
                              ) : (
                                <EmptyCell />
                              ))}
                          </Cell>
                        );
                      })}
                    </Flex>
                  </Row>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
        <TablePagination
          total={citedBy.length}
          size={size}
          setSize={setSize}
          from={from}
          setFrom={setFrom}
          pageSizeOptions={ROW_SIZES}
          colorScheme='gray'
          __css={{ '>div': { py: 1 } }}
        />
      </TableWrapper>
    </Skeleton>
  );
};
