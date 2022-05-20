import React from "react";
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
  usePagination,
  Tfoot,
} from "nde-design-system";
import { FormatLinkCell } from "./helpers";

export interface Column {
  key: string;
  title: string;
}

export interface Row {
  [key: Column["key"]]: { value: any; props?: Object };
}

interface TableProps {
  rowData: Row[];
  columns: Column[];
  caption?: string;
  ROW_SIZE?: number;
  hasFooter?: boolean;
}

const Table: React.FC<TableProps> = ({
  caption,
  columns,
  rowData,
  ROW_SIZE = 10,
  hasFooter = false,
}) => {
  // Max number of rows to display
  const [rows, updateRows, currentPage] = usePagination(
    rowData || [],
    ROW_SIZE
  );

  // For paginating table.
  const NUM_PAGES = Math.ceil(rowData.length / ROW_SIZE);

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
          value={currentPage}
          numPages={NUM_PAGES}
          handleChange={(num) => updateRows(num)}
          colorScheme="gray"
        ></TablePagination>
      </TableWrapper>
    </Box>
  );
};

export default Table;
