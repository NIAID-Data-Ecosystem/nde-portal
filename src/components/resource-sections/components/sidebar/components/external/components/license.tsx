import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { Link } from 'src/components/link';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

interface LicenseProps {
  isLoading: boolean;
  license?: FormattedResource['license'];
  type?: FormattedResource['@type'];
}

export const License: React.FC<LicenseProps> = ({
  isLoading,
  license,
  type,
}) => {
  if (!isLoading && !(license && type)) {
    return <></>;
  }
  const licenseInfo = license ? formatLicense(license) : null;

  return (
    <Box>
      <HeadingWithTooltip
        label='License'
        tooltipLabel={`${
          SCHEMA_DEFINITIONS['license']?.description?.[type || 'Dataset'] || ''
        }`}
      />

      {licenseInfo?.img && (
        <Image
          src={licenseInfo.img}
          alt={licenseInfo.type}
          width='auto'
          height={7}
          mb={0.5}
        />
      )}
      {licenseInfo?.url ? (
        <Link href={licenseInfo.url} isExternal>
          {licenseInfo?.title || licenseInfo.url}
        </Link>
      ) : (
        <Text>{licenseInfo?.title}</Text>
      )}
    </Box>
  );
};
