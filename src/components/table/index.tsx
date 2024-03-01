import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { uniqueId } from 'lodash';
import {
  Box,
  Flex,
  Skeleton,
  Table as ChakraTable,
  Tr,
  VisuallyHidden,
  HTMLChakraProps,
  TableContainerProps,
} from '@chakra-ui/react';
import { TableContainer } from 'src/components/table/components/table-container';
import { TableSortToggle } from 'src/components/table/components/sort-toggle';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { Row } from 'src/components/table/components/row';
import { Cell, Th } from 'src/components/table/components/cell';

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
}

interface TableProps<TData extends Record<string, string | number>> {
  ariaLabel: string;
  caption: string;
  columns: Column[];
  data: TData[];
  getCells: (props: {
    column: Column;
    data: TData;
    isLoading?: boolean;
  }) => React.ReactNode;
  colorScheme?: string;
  isLoading?: boolean;
  numRows?: number[];
  hasPagination?: boolean;
  tableBodyProps?: HTMLChakraProps<'tbody'>;
  tableHeadProps?: HTMLChakraProps<'thead'>;
  tableContainerProps?: TableContainerProps;
}
// Constants for table configuration.
// [NUM_ROWS]: num of rows per page
const NUM_ROWS = [5, 10, 50, 100];

export const Table: React.FC<TableProps<any>> = ({
  ariaLabel,
  caption,
  colorScheme = 'gray',
  columns,
  data,
  getCells,
  hasPagination,
  isLoading,
  numRows = NUM_ROWS,
  tableHeadProps,
  tableBodyProps,
  tableContainerProps,
}) => {
  // create unique id for each row
  const dataWithUniqueID = useMemo(
    () =>
      data?.map((item, idx) => {
        return {
          ...item,
          key: uniqueId(`row-${item?.identifier || idx}`),
        };
      }),
    [data],
  );

  // sort data based on column sorting
  const accessor = useCallback((v: any) => {
    return v;
  }, []);

  const [{ data: tableData, orderBy, sortBy }, updateSort] = useTableSort({
    data: dataWithUniqueID,
    accessor,
    orderBy: 'label',
    isSortAscending: true,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(hasPagination ? numRows[0] : data.length);

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // [rows]: all rows to display
  const [rows, setRows] = useState(tableData);

  useEffect(() => {
    setSize(hasPagination ? numRows[0] : data.length);
    // update rows to display based on current page number and num of rows per page
    setRows(tableData.slice(from * size, from * size + size));
  }, [tableData, size, from, data.length, hasPagination, numRows]);

  return (
    <Skeleton
      isLoaded={!isLoading}
      overflow='auto'
      minH={isLoading ? '500px' : 'unset'}
    >
      <TableWrapper colorScheme={colorScheme}>
        <TableContainer {...tableContainerProps}>
          <ChakraTable
            role='table'
            aria-label={ariaLabel}
            aria-describedby='table-caption'
            aria-rowcount={rows.length}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden id='table-caption' as='caption'>
              {caption}
            </VisuallyHidden>
            <Box as='thead' {...tableHeadProps}>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {columns.map(column => {
                  return (
                    <Th
                      key={`table-col-th-${column.property}`}
                      label={column.title}
                      isSelected={column.property === orderBy}
                      borderBottomColor={`${colorScheme}.200`}
                      {...column.props}
                    >
                      {column.property && column.isSortable && (
                        <TableSortToggle
                          isSelected={column.property === orderBy}
                          sortBy={sortBy}
                          handleToggle={(sortByAsc: boolean) => {
                            updateSort(column.property, sortByAsc);
                          }}
                        />
                      )}
                    </Th>
                  );
                })}
              </Tr>
            </Box>
            <Box as='tbody' {...tableBodyProps}>
              {rows.map((row: any) => {
                return (
                  <Row
                    as='tr'
                    key={`table-tr-${row.key}`}
                    flexDirection='column'
                    borderColor='gray.100'
                  >
                    <Flex as='td' role='cell'>
                      {columns.map(column => {
                        return (
                          <Cell
                            key={`table-td-${row.key}-${column.property}`}
                            as='div'
                            alignItems='center'
                            sx={{ '>div': { my: 0 } }}
                            {...column.props}
                          >
                            {/* generate the cells */}
                            {getCells({ column, data: row, isLoading })}
                          </Cell>
                        );
                      })}
                    </Flex>
                  </Row>
                );
              })}
            </Box>
          </ChakraTable>
        </TableContainer>
        {hasPagination && numRows && (
          <TablePagination
            total={dataWithUniqueID.length}
            size={size}
            setSize={setSize}
            from={from}
            setFrom={setFrom}
            pageSizeOptions={numRows}
            colorScheme='gray'
            __css={{ '>div': { py: 1 } }}
          />
        )}
      </TableWrapper>
    </Skeleton>
  );
};
