import { Box, Flex, FlexProps } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { MetadataSource } from 'src/hooks/api/types';

import { InfoLabel } from '../info-label';
import { CompatibilityBadge } from './components/badge';

export const MetadataCompatibilitySourceBadge: React.FC<
  FlexProps & {
    data: MetadataSource['sourceInfo']['metadata_completeness'] | null;
  }
> = ({ data, ...flexProps }) => {
  if (!data) {
    return <></>;
  }

  return (
    <Flex flexDirection='column' {...flexProps}>
      <InfoLabel
        href='/knowledge-center/metadata-compatibility-badge'
        tooltipProps={{
          interactive: true,
          content:
            'The metadata compatibility badge is a quantitative measure that represents how well a repository aligns with the metadata standards of the NIAID Data Ecosystem.',
        }}
      >
        Metadata Compatibility
      </InfoLabel>

      <Box w='350px'>
        <ParentSize>
          {({ width }) => <CompatibilityBadge width={width} data={data} />}
        </ParentSize>
      </Box>
    </Flex>
  );
};
