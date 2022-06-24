import React, { useState } from 'react';
import {
  Box,
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
} from 'nde-design-system';
import { FormatLinkCell } from './helpers';

export interface Column {
  key: string;
  title: string;
}

export interface Row {
  [key: Column['key']]: {
    value: any;
    props?: Object;
    sortValue: string | number;
  };
}

interface TableProps {
  rowData: Row[];
  columns: Column[];
  caption?: string;
  ROW_SIZE?: number;
  hasFooter?: boolean;
  accessor?: (...args: string[]) => void;
  colorScheme?: string;
}

const Table: React.FC<TableProps> = ({
  caption,
  colorScheme,
  columns,
  rowData,
  ROW_SIZE = 5,
  hasFooter = false,
  accessor,
}) => {
  // num of rows per page
  const [size, setSize] = useState(ROW_SIZE);

  // current page
  const [from, setFrom] = useState(1);

  const [{ data: tableData, orderBy, sortBy }, updateSort] = useTableSort(
    rowData,
    accessor,
  );

  const rows = tableData || [];

  return (
    <Box overflow='auto'>
      <TableWrapper colorScheme={colorScheme}>
        <TableContainer>
          <StyledTable variant='striped' colorScheme={colorScheme}>
            {caption && (
              <TableCaption color='text.body'>{caption}</TableCaption>
            )}
            <Thead>
              <Tr>
                {columns.map(column => {
                  return (
                    <Th key={column.key} role='columnheader' scope='col'>
                      {column.title}
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
            </Thead>

            <Tbody>
              {(rows as Row[])
                .slice(from * size, from * size + size)
                .map((row, i) => {
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
            {hasFooter && (
              <Tfoot>
                <Tr>
                  {columns.map((column, i) => {
                    return (
                      <Th key={column.key} role='columnfooter' scope='col'>
                        {column.title}
                      </Th>
                    );
                  })}
                </Tr>
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
          pageSizeOptions={Array.from(
            Array(Math.ceil(rowData.length / ROW_SIZE)),
          )
            .map((_: any, i) => (i + 1) * ROW_SIZE)
            .slice(0, 10)}
          colorScheme='gray'
        ></TablePagination>
      </TableWrapper>
    </Box>
  );
};

export default Table;
