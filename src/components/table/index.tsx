import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { uniqueId } from 'lodash';
import {
  Box,
  Skeleton,
  Table as ChakraTable,
  Tr,
  VisuallyHidden,
  HTMLChakraProps,
  TableContainerProps,
} from '@chakra-ui/react';
import { TableContainer } from 'src/components/table/components/table-container';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { Row } from 'src/components/table/components/row';
import { Cell, Th } from 'src/components/table/components/cell';

export interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
  renderCell?: (props: {
    column: Column;
    data: any;
    isLoading?: boolean;
  }) => React.ReactNode;
}

export interface TableProps<TData extends Record<string, string | number>> {
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
  getTableRowProps?: (row: any, idx: number) => any;
  tableHeadProps?: HTMLChakraProps<'thead'>;
  tableContainerProps?: TableContainerProps;
  /**
   * When provided, the table operates in *controlled sort* mode:
   * - Internal `useTableSort` is bypassed entirely.
   * - The column whose `property` matches `controlledSortProperty` is
   *   highlighted as selected.
   * - Clicking a sort toggle calls `onControlledSort` instead of updating
   *   local state, so the parent drives the sort.
   *
   * Omitting both props keeps the original uncontrolled behavior.
   */
  controlledSortProperty?: string | null;
  controlledSortAsc?: boolean;
  onControlledSort?: (property: string, ascending: boolean) => void;
  /**
   * When true, the thead element sticks to the top of the scrolling container
   * as the user scrolls vertically through rows.
   *
   * Requires tableContainerProps to include a bounded maxHeight and
   * overflowY:'auto'.
   *
   * Defaults to false.
   */
  stickyHeader?: boolean;
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
  getTableRowProps,
  tableContainerProps,
  controlledSortProperty,
  controlledSortAsc,
  onControlledSort,
  stickyHeader = false,
}) => {
  const isControlled =
    controlledSortProperty !== undefined && onControlledSort !== undefined;

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
    orderBy: columns[0].property,
    isSortAscending: true,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(() =>
    hasPagination ? numRows[0] : data.length,
  );

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // In controlled mode the parent already sorted the data server-side, so data
  // is displayed as-is. In uncontrolled mode the locally sorted copy is used.
  const displayData = isControlled ? dataWithUniqueID : tableData;

  // [rows]: all rows to display
  const [rows, setRows] = useState(displayData);

  useEffect(() => {
    setSize(hasPagination ? size : data.length);
    // update rows to display based on current page number and num of rows per page
    setRows(
      hasPagination
        ? displayData.slice(from * size, from * size + size)
        : displayData,
    );
  }, [displayData, size, from, data.length, hasPagination, numRows]);

  // When stickyHeader is enabled, position:sticky is applied to the thead
  // element itself rather than individual th cells.
  const stickyHeadProps = stickyHeader
    ? {
        position: 'sticky' as const,
        top: 0,
        zIndex: 1,
        bg: 'white',
      }
    : {};

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
            <Box as='thead' {...stickyHeadProps} {...tableHeadProps}>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {columns.map(column => {
                  const isSelected = isControlled
                    ? column.property === controlledSortProperty
                    : column.property === orderBy;

                  const currentSortBy = isControlled
                    ? controlledSortAsc
                      ? 'ASC'
                      : 'DESC'
                    : sortBy;

                  return (
                    <Th
                      key={`table-col-th-${column.property}`}
                      label={column.title}
                      isSelected={isSelected}
                      borderBottomColor={`${colorScheme}.200`}
                      isSortable={column.isSortable}
                      tableSortToggleProps={{
                        isSelected,
                        sortBy: currentSortBy as 'ASC' | 'DESC',
                        handleToggle: (sortByAsc: boolean) => {
                          if (isControlled) {
                            onControlledSort!(column.property, sortByAsc);
                          } else {
                            updateSort(column.property, sortByAsc);
                          }
                        },
                      }}
                      {...column.props}
                    />
                  );
                })}
              </Tr>
            </Box>
            <Box as='tbody' {...tableBodyProps}>
              {rows.map((row: any, idx: number) => {
                return (
                  <Row
                    as='tr'
                    key={`table-tr-${row.key}`}
                    flexDirection='row'
                    borderColor='gray.100'
                    {...(getTableRowProps && getTableRowProps(row, idx))}
                  >
                    {columns.map(column => {
                      return (
                        <Cell
                          key={`table-td-${row.key}-${column.property}`}
                          as='td'
                          role='cell'
                          alignItems='center'
                          sx={{ '>div': { my: 0 } }}
                          {...column.props}
                        >
                          {/* generate the cells */}
                          {getCells({ column, data: row, isLoading })}
                        </Cell>
                      );
                    })}
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
