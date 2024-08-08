import { Box, Text } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { MetadataSource } from 'src/hooks/api/types';
import { CompatibilityBadge } from './components/badge';
import TooltipWithLink from '../tooltip-with-link';

export const MetadataCompatibilitySourceBadge: React.FC<{
  source: MetadataSource;
}> = ({ source }) => {
  if (
    !source ||
    !source.sourceInfo ||
    !source.sourceInfo.metadata_completeness
  ) {
    return <></>;
  }
  return (
    <Box my={2} borderTop='1px solid' borderColor='gray.100'>
      <TooltipWithLink
        label='The metadata compatibility badge is a quantitative measure that represents how well a repository aligns with the metadata standards of the NIAID Data Ecosystem'
        url='/knowledge-center/metadata-compatibility-badge'
      >
        Metadata Compatibility
      </TooltipWithLink>
      <Box w='350px' h='60px' mt={1}>
        <ParentSize>
          {({ width, height }) => (
            <CompatibilityBadge width={width} height={height} data={source} />
          )}
        </ParentSize>
      </Box>
    </Box>
  );
};
