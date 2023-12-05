import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table as StyledTable,
  TableWrapper,
  Tfoot,
  Tr,
  useTableSort,
  TableSortToggle,
  TablePagination,
  VisuallyHidden,
} from 'nde-design-system';
import { Th, Cell } from './components/cell';
import { FormatLinkCell } from './helpers';
import { Row } from './components/row';
import { TableContainer } from './components/table-container';

export interface Column {
  key: string;
  title: string;
}

type RowData = {
  value: any; // Consider specifying a more precise type if possible
  sortValue: string | number;
};

export type Row = {
  _key: string;
  styles?: Record<string, any>;
} & Record<string, RowData>;

interface TableProps {
  id: string;
  rowData: Row[];
  columns: Column[];
  caption?: string;
  ROW_SIZE?: number;
  hasFooter?: boolean;
  accessor?: (...args: string[]) => void;
  colorScheme?: string;
  title?: string;
}

const Table: React.FC<TableProps> = ({
  id,
  caption,
  colorScheme = 'gray',
  columns,
  rowData,
  ROW_SIZE = 5,
  hasFooter = false,
  title,
  accessor,
}) => {
  // num of rows per page
  const [size, setSize] = useState(ROW_SIZE);

  // current page
  const [from, setFrom] = useState(0);

  const [{ data, orderBy, sortBy }, updateSort] = useTableSort(
    rowData,
    accessor,
  );
  const [rows, setRows] = useState<Row[]>(data);

  useEffect(() => {
    // update rows to display based on current page number and num of rows per page
    setRows(data.slice(from * size, from * size + size));
  }, [data, size, from]);
  return (
    <Box overflow='auto'>
      {title && (
        <Heading as='h4' fontSize='sm' mx={1} mb={4} fontWeight='semibold'>
          {title}
        </Heading>
      )}
      <TableWrapper colorScheme={colorScheme}>
        <TableContainer>
          <StyledTable
            role='table'
            aria-label={caption}
            aria-describedby='table-caption'
            aria-rowcount={rows.length}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden id={`${id}-caption`} as='caption'>
              {caption}
            </VisuallyHidden>
            <thead>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {columns.map(column => {
                  return (
                    <Th
                      key={column.key}
                      label={column.title}
                      isSelected={column.key === orderBy}
                      colorScheme={colorScheme}
                    >
                      <TableSortToggle
                        isSelected={column.key === orderBy}
                        sortBy={sortBy}
                        handleToggle={(sortByAsc: boolean) => {
                          updateSort(column.key, sortByAsc);
                        }}
                      />
                    </Th>
                  );
                })}
              </Tr>
            </thead>

            <tbody>
              {(rows as Row[]).map((row, idx) => {
                return (
                  <Row key={row._key}>
                    {columns.map(col => {
                      let cell = row[col.key];
                      if (!cell) return <td key={`td-${row._key}-none`}>-</td>;
                      return (
                        <Cell
                          key={`td-${row._key}-${col.key}}}`}
                          id={`td-${row._key}-${col.key}}}`}
                          as='td'
                          role='cell'
                        >
                          <FormatLinkCell value={cell.value} />
                        </Cell>
                      );
                    })}
                  </Row>
                );
              })}
            </tbody>
            {hasFooter && (
              <Tfoot>
                <Row>
                  {columns.map(column => {
                    return (
                      <Th key={column.key} role='columnfooter' scope='col'>
                        {column.title}
                      </Th>
                    );
                  })}
                </Row>
              </Tfoot>
            )}
          </StyledTable>
        </TableContainer>
        <TablePagination
          total={rowData.length}
          size={size}
          setSize={setSize}
          from={from}
          setFrom={setFrom}
          pageSizeOptions={[5, 10, 50, 100]}
          colorScheme='gray'
        ></TablePagination>
      </TableWrapper>
    </Box>
  );
};

export default Table;
