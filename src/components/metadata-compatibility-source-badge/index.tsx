import { Box, Text } from '@chakra-ui/react';
import { ParentSize } from '@visx/responsive';
import { Link } from 'src/components/link';
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
    <Box>
      <TooltipWithLink
        content={
          <>
            The metadata compatibility badge is a quantitative measure that
            represents how well a repository aligns with the metadata standards
            of the NIAID Data Ecosystem.{' '}
            <Link
              href='/knowledge-center/metadata-compatibility-badge'
              variant='underline'
              color='inherit'
              isExternal
            >
              See documentation
            </Link>
            .
          </>
        }
        url='/knowledge-center/metadata-compatibility-badge'
        showArrow
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
    </Box>
  );
};
