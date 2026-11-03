import {
  chakra,
  Flex,
  Icon,
  Separator,
  Stack,
  StackSeparator,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaComputer, FaRegClock } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';
import TypeBanner from 'src/components/type-banner';
import { getProgramResourceVariant } from 'src/components/type-banner/helpers';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { operatingSystemIcons } from 'src/utils/helpers/operating-system-icons';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';

import { getBannerDates } from './helpers';
import { ResourceBannerProps } from './types';

// A light chip on the banner strip.
const BannerTag = chakra('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    px: 2,
    py: 1,
    borderRadius: 'semi',
    fontSize: 'sm',
    whiteSpace: 'nowrap',
  },
});

// The resource page's type banner, followed by the resource's dates and, for
// computational tools, the operating systems it supports.
const ResourceBanner: React.FC<ResourceBannerProps> = ({ data }) => {
  if (!data) return null;

  const type = data['@type'];
  const dates = getBannerDates(data);
  const operatingSystems =
    (type === 'ComputationalTool' && data.operatingSystem) || [];
  const osLabel = `Operating systems supported: ${operatingSystems.join(', ')}`;

  return (
    <TypeBanner
      label={formatAPIResourceTypeForDisplay(type)}
      type={type}
      creativeWorkStatus={data.creativeWorkStatus}
      bg='info.subtle'
      isNiaidFunded={isSourceFundedByNiaid(data.includedInDataCatalog)}
      programVariant={getProgramResourceVariant(data)}
    >
      {(dates.length > 0 || operatingSystems.length > 0) && (
        // Drops below the labels when there's less than 250px beside them.
        <Stack
          flex='1 1 250px'
          flexWrap='wrap'
          direction='row'
          alignItems='center'
          justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          gap={2}
          px={{ base: 4, md: 2 }}
          py={1}
        >
          {dates.length > 0 && (
            <Flex
              flexWrap='wrap'
              justifyContent={{ base: 'flex-start', md: 'flex-end' }}
            >
              {dates.map(({ label, value }) => (
                <BannerTag key={label ?? 'date'}>
                  <Icon as={FaRegClock} />
                  <Text>
                    {label && <strong>{label} </strong>}
                    {value}
                  </Text>
                </BannerTag>
              ))}
            </Flex>
          )}
          {operatingSystems.length > 0 && (
            <Tooltip content={osLabel}>
              <BannerTag role='img' aria-label={osLabel}>
                {operatingSystems.map(os => (
                  <Icon
                    key={os}
                    as={
                      operatingSystemIcons.find(icon => icon.os === os)?.icon ??
                      FaComputer
                    }
                  />
                ))}
              </BannerTag>
            </Tooltip>
          )}
        </Stack>
      )}
    </TypeBanner>
  );
};

export default ResourceBanner;
