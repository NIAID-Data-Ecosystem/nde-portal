import { Box } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { MetadataSource } from 'src/hooks/api/types';
import { CompatibilityBadge } from './components/badge';
import TooltipWithLink from '../tooltip-with-link';

export const MetadataCompatibilitySourceBadge: React.FC<{
  data: MetadataSource['sourceInfo']['metadata_completeness'] | null;
}> = ({ data }) => {
  if (!data) {
    return <></>;
  }

  return (
    <>
      <TooltipWithLink
        label='The metadata compatibility badge is a quantitative measure that represents how well a repository aligns with the metadata standards of the NIAID Data Ecosystem.'
        url='/knowledge-center/metadata-compatibility-badge'
      >
        Metadata Compatibility
      </TooltipWithLink>
      <Box w='350px' h='70px'>
        <ParentSize>
          {({ width, height }) => (
            <CompatibilityBadge width={width} height={height} data={data} />
          )}
        </ParentSize>
      </Box>
    </>
  );
};
