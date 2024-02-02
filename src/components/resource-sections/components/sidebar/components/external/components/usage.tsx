import React from 'react';
import { Box } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import MetadataConfig from 'configs/resource-metadata.json';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { Link } from 'src/components/link';

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
  const usageAgreement = Array.isArray(usageInfo) ? usageInfo : [usageInfo];
  // If there are no usage agreements, don't render anything.
  if (!usageAgreement.some(ua => ua?.url)) {
    return <></>;
  }
  return (
    <Box>
      <HeadingWithTooltip
        label='Usage Information'
        tooltipLabel={`${
          MetadataConfig?.find(d => d.property === 'usageInfo')?.description[
            'dataset'
          ] || ''
        }`}
      />
      {usageAgreement.map((usageInfo, idx) => {
        if (!usageInfo?.url)
          return <React.Fragment key={'ua' + idx}></React.Fragment>;
        return (
          <Link key={'ua' + idx} href={usageInfo?.url} fontSize='xs' isExternal>
            {usageInfo?.name || 'View usage agreement'}
          </Link>
        );
      })}
    </Box>
  );
};
