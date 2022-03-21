import React from 'react';
import {
  Box,
  Link,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
} from 'nde-design-system';

import {FormattedResource} from 'src/utils/api/types';
import {StyledSectionHead, StyledSectionHeading} from '../../styles';

interface FilesTable {
  isLoading: boolean;
  distribution?: FormattedResource['distribution'];
}

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
    <Box p={4}>
      {!distribution || distribution.length === 0 ? (
        <Text>No files available.</Text>
      ) : (
        <Table variant='simple' colorScheme={'primary'}>
          <TableCaption fontSize='xs' fontFamily={'body'} fontStyle={'italic'}>
            Files available for download
          </TableCaption>
          <Thead>
            <Tr>
              {tableColumns.map((column, i) => {
                return (
                  <Th
                    key={column}
                    fontSize='xs'
                    fontFamily={'body'}
                    bg={i % 2 ? 'primary.500' : 'primary.700'}
                    color={'white'}
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
                <Tr key={i}>
                  {Object.entries(d).map(([prop, fileValue], j) => {
                    if (!fileValue) {
                      return;
                    }
                    if (prop === 'contentUrl') {
                      return (
                        <Td
                          key={`${fileValue}-${i}-${j}`}
                          borderLeft={'1px solid'}
                          borderLeftColor={'primary.100'}
                          borderRight={'1px solid'}
                          borderRightColor={'primary.100'}
                        >
                          <Link href={fileValue}>{fileValue}</Link>
                        </Td>
                      );
                    }

                    let value = fileValue;
                    if (prop.includes('date')) {
                      value = new Date(value)
                        .toDateString()
                        .split(' ')
                        .slice(1)
                        .join(' ');
                    }
                    return (
                      <Td
                        key={`${fileValue}-${i}-${j}`}
                        borderLeft={'1px solid'}
                        borderLeftColor={'primary.100'}
                        borderRight={'1px solid'}
                        borderRightColor={'primary.100'}
                      >
                        {value}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
          <Tfoot>
            <Tr>
              {tableColumns.map((column, i) => {
                return (
                  <Th
                    key={column}
                    fontSize='xs'
                    fontFamily={'body'}
                    bg={i % 2 ? 'primary.500' : 'primary.700'}
                    color={'white'}
                  >
                    {formatColumnString(column)}
                  </Th>
                );
              })}
            </Tr>
          </Tfoot>
        </Table>
      )}
    </Box>
  );
};

export default FilesTable;
