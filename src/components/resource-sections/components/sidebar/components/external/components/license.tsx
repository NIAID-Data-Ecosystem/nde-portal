import { Image, Text, VStack } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';

interface LicenseProps {
  loading: boolean;
  license?: FormattedResource['license'];
  type?: FormattedResource['@type'];
}

export const License: React.FC<LicenseProps> = ({ loading, license, type }) => {
  if (!loading && !(license && type)) {
    return <></>;
  }
  const licenseInfo = license ? formatLicense(license) : null;

  return (
    <VStack align='start' gap={0.5}>
      <InfoLabel
        label='License'
        tooltipProps={{
          content: `${
            SCHEMA_DEFINITIONS['license']?.description?.[
              (type ??
                'Dataset') as keyof (typeof SCHEMA_DEFINITIONS)['license']['description']
            ] ?? ''
          }`,
        }}
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
          {licenseInfo?.title}
        </Link>
      ) : (
        <Text>{licenseInfo?.title}</Text>
      )}
    </VStack>
  );
};
