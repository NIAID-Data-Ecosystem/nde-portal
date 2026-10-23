import { VStack } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';

interface DataUsageProps {
  loading: boolean;
  usageInfo?: FormattedResource['usageInfo'];
  type?: FormattedResource['@type'];
}

export const DataUsage: React.FC<DataUsageProps> = ({
  loading,
  type,
  usageInfo,
}) => {
  if (!loading && !usageInfo) {
    return <></>;
  }
  const usageAgreement = Array.isArray(usageInfo) ? usageInfo : [usageInfo];
  // If there are no usage agreements, don't render anything.
  if (!usageAgreement.some(ua => ua?.url || ua?.name) || !type) {
    return <></>;
  }
  const description = SCHEMA_DEFINITIONS['usageInfo']?.description;

  const tooltipLabel =
    description && type && type in description
      ? (description as Record<string, string>)[type]
      : '';

  return (
    <VStack align='start' gap={0.5}>
      <InfoLabel
        label='Usage Information'
        tooltipProps={{ content: tooltipLabel }}
      />
      {usageAgreement.map((usageInfo, idx) => {
        if (!usageInfo?.url)
          return (
            <React.Fragment key={'ua' + idx}>
              {usageInfo?.name || 'View usage agreement'}
            </React.Fragment>
          );
        return (
          <Link key={'ua' + idx} href={usageInfo?.url} isExternal>
            {usageInfo?.name || 'View usage agreement'}
          </Link>
        );
      })}
    </VStack>
  );
};
