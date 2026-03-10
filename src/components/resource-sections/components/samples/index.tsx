import { Box, Flex } from '@chakra-ui/react';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';
import { SampleTable } from './components/SampleTable';
import { Cell } from './components/SampleTable/Cells';
import { SampleCollectionItemsTable } from './components/SampleCollectionsTable';
import { SAMPLE_TABLE_CONFIG } from './config';
import { TableProps } from 'src/components/table';

interface SamplesDisplayProps {
  sample: SampleAggregate | SampleCollection | null | undefined;
  resourceIdentifier?: string;
}

function renderSampleTable<T extends SampleAggregate>(
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

export const SamplesDisplay = ({
  sample,
  resourceIdentifier,
}: SamplesDisplayProps) => {
  if (!sample || !sample['@type']) return null;

  return (
    <Flex flexDirection='column' gap={8}>
      <Box>
        {sample['@type'] === 'Sample' ? (
          renderSampleTable(sample as SampleAggregate, SAMPLE_TABLE_CONFIG)
        ) : (
          // SampleCollection: fetch individual sample records via the API and
          // render them in a table.
          <SampleCollectionItemsTable
            parentIdentifier={
              (sample as SampleCollection & { identifier?: string })
                .identifier ??
              resourceIdentifier ??
              ''
            }
          />
        )}
      </Box>
    </Flex>
  );
};
