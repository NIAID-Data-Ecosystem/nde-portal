import { Box, Flex } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';

import { SampleCollectionItemsTable } from './components/SampleCollectionsTable';
import { SampleTable } from './components/SampleTable';
import { SAMPLE_TABLE_CONFIG } from './config';

interface SamplesDisplayProps {
  sample: SampleAggregate | SampleCollection | null | undefined;
  resourceIdentifier?: string;
}

// A single Sample: one row of its properties.
const SampleAggregateTable = ({ sample }: { sample: SampleAggregate }) => {
  const columns = useMemo(
    () => SAMPLE_TABLE_CONFIG.getColumns(sample),
    [sample],
  );
  const rows = useMemo(() => SAMPLE_TABLE_CONFIG.getRows(sample), [sample]);
  return (
    <SampleTable
      label={SAMPLE_TABLE_CONFIG.label}
      columns={columns}
      rows={rows}
    />
  );
};

export const SamplesDisplay = ({
  sample,
  resourceIdentifier,
}: SamplesDisplayProps) => {
  if (!sample || !sample['@type']) return null;

  return (
    <Flex flexDirection='column' gap={8}>
      <Box>
        {sample['@type'] === 'Sample' ? (
          <SampleAggregateTable sample={sample as SampleAggregate} />
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
            fallbackSampleCollection={sample as SampleCollection}
          />
        )}
      </Box>
    </Flex>
  );
};
