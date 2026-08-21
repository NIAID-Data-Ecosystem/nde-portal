import { Box } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { MetadataSource } from 'src/hooks/api/types';

import TooltipWithLink from '../tooltip-with-link';
import { CompatibilityBadge } from './components/badge';

export const MetadataCompatibilitySourceBadge: React.FC<{
  data: MetadataSource['sourceInfo']['metadata_completeness'] | null;
}> = ({ data }) => {
  if (!data) {
    return <></>;
  }

  return (
    <>
      <TooltipWithLink
        content='The metadata compatibility badge is a quantitative measure that represents how well a repository aligns with the metadata standards of the NIAID Data Ecosystem.'
        url='/knowledge-center/metadata-compatibility-badge'
      >
        Metadata Compatibility
      </TooltipWithLink>
      <Box w='350px'>
        <ParentSize>
          {({ width }) => <CompatibilityBadge width={width} data={data} />}
        </ParentSize>
      </Box>
    </>
  );
};
