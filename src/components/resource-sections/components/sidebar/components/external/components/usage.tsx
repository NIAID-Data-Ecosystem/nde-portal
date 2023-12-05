import React from 'react';
import { Box, Link } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import MetadataConfig from 'configs/resource-metadata.json';
import { HeadingWithTooltip } from './heading-with-tooltip';

interface DataUsageProps {
  isLoading: boolean;
  usageInfo?: FormattedResource['usageInfo'];
}

export const DataUsage: React.FC<DataUsageProps> = ({
  isLoading,
  usageInfo,
}) => {
  if (!isLoading && !usageInfo) {
    return <></>;
  }

  return (
    usageInfo?.url && (
      <Box>
        <HeadingWithTooltip
          label='Usage Information'
          aria-label='Information about data re-use'
          tooltipLabel={`${
            usageInfo?.description ||
            MetadataConfig?.find(d => d.property === 'usageInfo')?.description[
              'dataset'
            ] ||
            ''
          }`}
        />
        <Link href={usageInfo.url} fontSize='xs' isExternal>
          {usageInfo?.name || 'View usage agreement'}
        </Link>
      </Box>
    )
  );
};
