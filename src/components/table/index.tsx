import {
  SkeletonText,
  Table,
  TableBodyProps,
  TableHeaderProps,
  TableRootProps,
  TableScrollAreaProps,
} from '@chakra-ui/react';
import { uniqueId } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TableRowProps } from 'react-markdown/lib/ast-to-react';
import { SortableHeaderCell } from 'src/components/table/components/cell';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
}

interface TableProps<TData extends Record<string, string | number>> {
  ariaLabel: string;
  caption: string;
  colorPalette?: TableRootProps['colorPalette'];
  columns: Column[];
  data: TData[];
  hasPagination?: boolean;
  isLoading?: boolean;
  numRows?: number[];
  getCells: (props: {
    column: Column;
    data: TData;
    isLoading?: boolean;
  }) => React.ReactNode;
  getTableRowProps?: (row: any, idx: number) => any;
  tableProps?: {
    root?: TableRootProps;
    header?: TableHeaderProps;
    body?: TableBodyProps;
    scrollArea?: TableScrollAreaProps;
    row?: TableRowProps;
  };
}
// Constants for table configuration.
// [NUM_ROWS]: num of rows per page
const NUM_ROWS = [5, 10, 50, 100];

const CustomTable: React.FC<TableProps<any>> = ({
  ariaLabel,
  caption,
  colorPalette = 'gray',
  columns,
  data,
  getCells,
  hasPagination,
  isLoading,
  numRows = NUM_ROWS,
  tableProps,
  getTableRowProps,
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
    orderBy: columns[0].property,
    isSortAscending: true,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(() =>
    hasPagination ? numRows[0] : data.length,
  );

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // [rows]: all rows to display
  const [rows, setRows] = useState(tableData);

  useEffect(() => {
    setSize(hasPagination ? numRows[0] : data.length);
    // update rows to display based on current page number and num of rows per page
    setRows(
      hasPagination
        ? tableData.slice(from * size, from * size + size)
        : tableData,
    );
  }, [tableData, size, from, data.length, hasPagination, numRows]);

  return (
    <>
      <Table.ScrollArea borderWidth='1px' {...tableProps?.scrollArea}>
        <Table.Root
          role='table'
          aria-describedby='table-caption'
          {...tableProps?.root}
          colorPalette={colorPalette}
          aria-label={ariaLabel}
          aria-rowcount={rows.length}
        >
          {/* Note: keep for accessibility */}
          <Table.Caption
            id='table-caption'
            // hide caption visually
            css={{
              height: '1px',
              width: '1px',
              margin: '-1px',
              padding: '0',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              position: 'absolute',
            }}
          >
            {caption}
          </Table.Caption>
          <Table.Header {...tableProps?.header}>
            <Table.Row>
              {columns.map(column => {
                return (
                  <Table.ColumnHeader
                    key={`table-col-th-${column.property}`}
                    {...column.props}
                  >
                    <SortableHeaderCell
                      label={column.title.toUpperCase()}
                      isSortable={column.isSortable}
                      tableSortToggleProps={{
                        columnName: column.title,
                        isSelected: column.property === orderBy,
                        sortBy,
                        handleToggle: (sortByAsc: boolean) => {
                          updateSort(column.property, sortByAsc);
                        },
                      }}
                    />
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body {...tableProps?.body}>
            {rows.map((row: any) => {
              return (
                <Table.Row
                  key={`table-tr-${row.key}`}
                  colorPalette={colorPalette}
                  {...tableProps?.row}
                >
                  {columns.map(column => {
                    return (
                      <Table.Cell
                        key={`table-td-${row.key}-${column.property}`}
                        verticalAlign='top'
                        {...column.props}
                      >
                        {isLoading ? (
                          <SkeletonText
                            key={`table-td-${row.key}-${column.property}`}
                            loading={isLoading}
                            noOfLines={2}
                            height={2}
                          />
                        ) : (
                          <>{getCells({ column, data: row, isLoading })}</>
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {/* {hasPagination && numRows && (
        <TablePagination
          total={dataWithUniqueID.length}
          size={size}
          setSize={setSize}
          from={from}
          setFrom={setFrom}
          pageSizeOptions={numRows}
          colorScheme='gray'
          css={{ '>div': { py: 1 } }}
        />
      )} */}
    </>
  );
};

export { CustomTable as Table };
