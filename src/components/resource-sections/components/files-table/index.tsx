import React, { useCallback } from 'react';
import { Box, Flex, Icon, Text } from 'nde-design-system';
import { Distribution, FormattedResource } from 'src/utils/api/types';
import Table, { Row } from 'src/components/table';
import LoadingSpinner from 'src/components/loading';
import {
  FormatLinkCell,
  getFileIcon,
  getTableColumns,
} from 'src/components/table/helpers';

interface FilesTable {
  isLoading: boolean;
  distribution?: FormattedResource['distribution'];
}

const FilesTable: React.FC<FilesTable> = ({ isLoading, distribution }) => {
  const accessorFn = useCallback(v => v.sortValue, []);

  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!distribution || distribution.length === 0) {
    return (
      <Box overflow='auto'>
        <Text>No data available.</Text>
      </Box>
    );
  }

  const column_name_config = {
    '@id': 'id',
    name: 'Name',
    encodingFormat: 'File Format',
    contentUrl: 'Download',
    dateCreated: 'Date Created',
    dateModified: 'Date Modified',
    datePublished: 'Date Published',
    description: 'Description',
  } as Record<keyof Distribution, string>;

  const columns =
    distribution && getTableColumns(distribution!, column_name_config, false);

  // Format rows
  const rows = distribution.map(d => {
    let obj = {} as Row;

    Object.entries(d).map(([k, v], i) => {
      let value = v;
      let { icon, color } = getFileIcon(v);

      if (k === 'encodingFormat' && icon && color) {
        value = (
          <Flex alignItems='baseline'>
            <Text pt={2} ml={1} fontSize='sm'>
              <FormatLinkCell value={v} />
            </Text>
            <Icon
              id={`${k}-${i}`}
              as={icon}
              color={color}
              boxSize={6}
              aria-label={v}
              m={1}
            />
          </Flex>
        );
      }

      obj[k] = {
        value,
        sortValue: typeof v === 'string' || typeof v === 'number' ? v : '',
      };
    });
    return obj;
  });

  return (
    <Table
      columns={columns}
      rowData={rows}
      caption={'Files available for download.'}
      accessor={accessorFn}
    />
  );
};

export default FilesTable;
