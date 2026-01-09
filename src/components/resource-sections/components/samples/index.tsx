import { Box, Flex } from '@chakra-ui/react';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';
import { SampleTable } from './components/SampleTable';
import { Cell } from './components/SampleTable/Cells';
import { SAMPLE_COLLECTION_TABLE_CONFIG, SAMPLE_TABLE_CONFIG } from './config';
import { TableProps } from 'src/components/table';

interface SamplesDisplayProps {
  sample: SampleAggregate | SampleCollection | null | undefined;
}

function renderTableWithConfig<T extends SampleAggregate | SampleCollection>(
  sample: T,
  config: {
    label: string;
    caption: string;
    getColumns: (s: T) => any[];
    getRows: (s: T) => any[];
    tableProps?: Partial<TableProps<any>>;
  },
) {
  return (
    <SampleTable
      label={config.label}
      caption={config.caption}
      tableProps={{
        columns: config.getColumns(sample),
        data: config.getRows(sample),
        getCells: props => {
          const data = props.data?.[props.column.property];
          return Cell.renderCellData?.({ ...props, data });
        },
        ...config.tableProps,
      }}
    />
  );
}

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  if (!sample || !sample['@type']) return null;

  return (
    <Flex flexDirection='column' gap={8}>
      <Box>
        {sample['@type'] === 'Sample'
          ? renderTableWithConfig(sample, SAMPLE_TABLE_CONFIG)
          : renderTableWithConfig(sample, SAMPLE_COLLECTION_TABLE_CONFIG)}
      </Box>
    </Flex>
  );
};
