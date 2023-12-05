import React from 'react';
import { Box, Image, Link, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import MetadataConfig from 'configs/resource-metadata.json';
import { formatLicense } from 'src/utils/helpers';
import { HeadingWithTooltip } from './heading-with-tooltip';

interface LicenseProps {
  isLoading: boolean;
  license?: FormattedResource['license'];
}

export const License: React.FC<LicenseProps> = ({ isLoading, license }) => {
  if (!isLoading && !license) {
    return <></>;
  }
  const licenseInfo = license ? formatLicense(license) : null;

  return (
    <Box>
      <HeadingWithTooltip
        label='License'
        aria-label='Information about licensing'
        tooltipLabel={`${
          MetadataConfig?.find(d => d.property === 'license')?.description[
            'dataset'
          ] || ''
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
