import React, { useCallback } from 'react';
import { Box, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import Table, { Row } from 'src/components/table';
import LoadingSpinner from 'src/components/loading';
import { getTableColumns } from 'src/components/table/helpers';

interface FundingTable {
  isLoading: boolean;
  funding?: FormattedResource['funding'];
}

const FundingTable: React.FC<FundingTable> = ({ isLoading, funding }) => {
  const accessorFn = useCallback((v: any) => v.sortValue, []);

  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!funding || funding.length === 0) {
    return (
      <Box overflow='auto'>
        <Text>No funding data available.</Text>
      </Box>
    );
  }

  const column_name_config = {
    identifier: 'Identifier',
    fundingURL: 'Funding URL',
    fundingDescription: 'Funding Description',
    name: 'Funder Name',
    alternateName: 'Alternate Name',
    role: 'Role',
    description: 'Funder Description',
    parentOrganization: 'Parent Organization',
    url: 'Funder URL',
  } as Record<keyof unknown, string>;

  const data = funding.map(f => {
    return {
      ...f.funder,
      identifier: f.identifier,
      fundingURL: f.url,
      fundingDescription: f.description,
    };
  });
  const columns = funding && getTableColumns(data, column_name_config, false);
  // Format rows
  const rows = data.map(d => {
    let obj = {} as Row;
    Object.entries(d).map(([k, v]) => {
      let props: { [key: string]: any } = { styles: {} };
      let value = v;

      if (k === 'name') {
        props.styles.minWidth = '200px';
      }
      if (k === 'fundingDescription' && value && value.length > 144) {
        props = { ...props, tooltipText: v };
        value = value.slice(0, 144) + '...';
      }
      obj[k] = {
        value,
        props,
        sortValue:
          typeof value === 'string' || typeof value === 'number' ? value : '',
      };
    });

    return obj;
  });

  return (
    <Table
      columns={columns}
      rowData={rows}
      accessor={accessorFn}
      caption='Grant and funding information.'
    />
  );
};

export default FundingTable;
