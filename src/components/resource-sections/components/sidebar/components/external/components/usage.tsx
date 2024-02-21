import React from 'react';
import { Box } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { Link } from 'src/components/link';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

interface DataUsageProps {
  isLoading: boolean;
  usageInfo?: FormattedResource['usageInfo'];
  type?: FormattedResource['@type'];
}

export const DataUsage: React.FC<DataUsageProps> = ({
  isLoading,
  type,
  usageInfo,
}) => {
  if (!isLoading && !usageInfo) {
    return <></>;
  }
  const usageAgreement = Array.isArray(usageInfo) ? usageInfo : [usageInfo];
  // If there are no usage agreements, don't render anything.
  if (!usageAgreement.some(ua => ua?.url) || !type) {
    return <></>;
  }

  return (
    <Box>
      <HeadingWithTooltip
        label='Usage Information'
        tooltipLabel={`${
          SCHEMA_DEFINITIONS['usageInfo']?.description?.[type] || ''
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
