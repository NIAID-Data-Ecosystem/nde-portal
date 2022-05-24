import React, { useCallback, useState, useEffect, useMemo } from "react";
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
  TablePagination,
  TableWrapper,
  Tfoot,
  Flex,
  IconButton,
  Button,
  Icon,
  usePagination,
  useTableSort,
  TableSortToggle,
} from "nde-design-system";
import { FormatLinkCell } from "./helpers";
import { FaCaretUp, FaCaretDown, FaCaretSquareDown } from "react-icons/fa";

export interface Column {
  key: string;
  title: string;
}

export interface Row {
  [key: Column["key"]]: {
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
}

const Table: React.FC<TableProps> = ({
  caption,
  columns,
  rowData,
  ROW_SIZE = 5,
  hasFooter = false,
  accessor,
}) => {
  const [{ data: tableData, orderBy, sortBy }, updateSort] = useTableSort(
    rowData,
    accessor
  );

  const [rows, setRows] = useState(tableData || []);

  return (
    <Box overflow="auto">
      <TableWrapper>
        <TableContainer>
          <StyledTable variant="striped">
            {caption && <TableCaption>{caption}</TableCaption>}
            <Thead>
              <Tr>
                {columns.map((column) => {
                  return (
                    <Th key={column.key} role="columnheader" scope="col">
                      {column.title}
                      <TableSortToggle
                        isSelected={column.key === orderBy}
                        sortBy={sortBy}
                        handleToggle={(sortByAsc: boolean) => {
                          console.log(column.key, sortByAsc);
                          updateSort(column.key, sortByAsc);
                        }}
                      />
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
                          role="cell"
                          key={`${cell.value}-${i}-${j}`}
                          id={`${cell.value}-${i}-${j}`}
                          whiteSpace="break-spaces"
                          minW="50px"
                          isNumeric={typeof cell.value === "number"}
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
                      <Th key={column.key} role="columnfooter" scope="col">
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
          data={tableData}
          pageSize={ROW_SIZE}
          setRows={(v) => setRows(v)}
          pageSizeOptionsIncrement={5}
          colorScheme="gray"
        ></TablePagination>
      </TableWrapper>
    </Box>
  );
};

export default Table;
