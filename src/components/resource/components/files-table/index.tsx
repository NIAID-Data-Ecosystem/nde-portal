import React from 'react';
import {
  Box,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
} from 'nde-design-system';
import {Distribution, FormattedResource} from 'src/utils/api/types';
import {formatDate} from 'src/utils/helpers';

interface FilesTable {
  isLoading: boolean;
  distribution?: FormattedResource['distribution'];
}

/*
  TO DO:
  [] Make into generic table component.
  [] Nice example: Table Preview https://data.cdc.gov/Public-Health-Surveillance/NWSS-Public-SARS-CoV-2-Wastewater-Metric-Data/2ew6-ywp6
*/

const FilesTable: React.FC<FilesTable> = ({distribution}) => {
  const tableColumns: string[] = [];

  distribution &&
    distribution.map(d => {
      Object.entries(d).map(([k, v]) => {
        if (v && !tableColumns.includes(k)) {
          return tableColumns.push(k);
        }
        return;
      });
    });
  const formatColumnString = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Box overflow='auto'>
      {!distribution || distribution.length === 0 ? (
        <Text>No data available.</Text>
      ) : (
        <Table variant='simple' border='1px solid' borderColor='gray.100'>
          <TableCaption
            fontSize='xs'
            fontFamily='body'
            fontStyle='italic'
            color='text.body'
          >
            Files available for download
          </TableCaption>
          <Thead>
            <Tr>
              {tableColumns.map((column, i) => {
                return (
                  <Th
                    borderX='0.5px solid'
                    role='columnheader'
                    scope='col'
                    key={column}
                    fontSize='xs'
                    fontFamily='body'
                    bg='white'
                    color='text.heading'
                    minW='300px'
                    maxW='400px'
                    borderRightColor='gray.100'
                    borderLeftColor='gray.100'
                    p={2}
                  >
                    {formatColumnString(column)}
                  </Th>
                );
              })}
            </Tr>
          </Thead>

          <Tbody>
            {distribution.map((d, i) => {
              return (
                <Tr key={i} id={`${i}`}>
                  {tableColumns.map((c, j) => {
                    let column = c as keyof Distribution;
                    let cellValue = d[column];
                    if (
                      // @ts-ignore
                      (column === 'contentUrl' || column === 'url') &&
                      typeof cellValue === 'string'
                    ) {
                      return (
                        <Td
                          role='cell'
                          key={`${cellValue}-${i}-${j}`}
                          id={`${cellValue}-${i}-${j}`}
                          borderLeft='1px solid'
                          borderLeftColor='primary.100'
                          borderRight='1px solid'
                          borderRightColor='primary.100'
                          wordBreak='break-word'
                          px={2}
                          py={1}
                        >
                          <Link href={cellValue} isExternal>
                            {cellValue}
                          </Link>
                        </Td>
                      );
                    }

                    if (column.includes('date') && cellValue) {
                      cellValue = formatDate(cellValue);
                    }

                    return (
                      <Td
                        key={`${cellValue}-${i}-${j}`}
                        id={`${cellValue}-${i}-${j}`}
                        borderLeft='1px solid'
                        borderLeftColor='primary.100'
                        borderRight='1px solid'
                        borderRightColor='primary.100'
                        px={2}
                        py={1}
                      >
                        {Array.isArray(cellValue)
                          ? cellValue.join(' ')
                          : cellValue || '-'}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default FilesTable;
