import React from 'react';
import { Column, Table } from 'src/components/table';
import { Sample } from 'src/utils/api/types';
import { getSamplePropertyTableRows } from './config';
import { Cell } from './Cells';

interface SamplePropertiesProps {
  data: Sample;
}

export const SampleProperties = ({ data }: SamplePropertiesProps) => {
  const rows = getSamplePropertyTableRows(data);

  const columns: Column[] = [
    {
      title: 'Sample Properties',
      property: 'label',
      isSortable: true,
      props: { minWidth: '250px', maxWidth: '250px' },
      renderCell: Cell.renderLabel,
    },
    {
      title: '',
      property: 'values',
      renderCell: Cell.renderValues,
    },
  ];

  return (
    <Table
      ariaLabel='Sample Properties'
      caption='Sample Properties'
      data={rows}
      columns={columns}
      getCells={props => props?.column?.renderCell?.(props)}
      tableContainerProps={{
        overflowY: 'auto',
        maxHeight: '400px',
      }}
      getTableRowProps={(_, idx) => ({
        bg: idx % 2 === 0 ? 'white' : 'page.alt',
      })}
    />
  );
};
