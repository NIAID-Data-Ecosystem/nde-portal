import React, { useCallback } from 'react';
import { Box, Text } from '@candicecz/test-design-system';
import { CitedBy, FormattedResource } from 'src/utils/api/types';
import Table, { Row } from 'src/components/table';
import LoadingSpinner from 'src/components/loading';
import { getTableColumns } from 'src/components/table/helpers';
import { formatDate, formatType } from 'src/utils/api/helpers';

interface CitedByTable {
  isLoading: boolean;
  citedBy?: FormattedResource['citedBy'];
}

const CitedByTable: React.FC<CitedByTable> = ({ isLoading, citedBy }) => {
  const accessorFn = useCallback((v: any) => v.sortValue, []);

  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!citedBy || citedBy.length === 0) {
    return (
      <Box overflow='auto'>
        <Text>No cited by data available.</Text>
      </Box>
    );
  }

  const column_name_config = {
    '@type': 'Type',
    abstract: 'Abstract',
    citation: 'citation',
    datePublished: 'Date Published',
    description: 'Description',
    doi: 'DOI',
    identifier: 'Identifier',
    name: 'name',
    pmid: 'PMID',
    url: 'URL',
  } as Record<keyof CitedBy, string>;

  const columns =
    citedBy && getTableColumns(citedBy, column_name_config, false);

  // Format rows
  const rows = citedBy.map(d => {
    let obj = {} as Row;
    Object.entries(d).map(([k, v]) => {
      let value = v;
      let props: { [key: string]: any } = { styles: {} };

      if (k.toLowerCase().includes('name')) {
        props.styles.minWidth = '400px';
      }

      // Format date values.
      if (v && k.toLowerCase().includes('date')) {
        value = formatDate(v);
      }

      if (k.toLowerCase() === '@type') {
        value = formatType(v);
      }

      obj[k] = {
        value,
        sortValue: typeof v === 'string' || typeof v === 'number' ? v : '',
        props,
      };
    });
    return obj;
  });

  return (
    <Table
      columns={columns}
      rowData={rows}
      accessor={accessorFn}
      caption={'Cited by information.'}
    />
  );
};

export default CitedByTable;
