import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { FaComputer, FaRegClock } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { operatingSystemIcons } from 'src/utils/helpers/operating-system-icons';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';

import TypeBanner, { getProgramResourceVariant } from '../type-banner';

interface DateTagProps extends FlexProps {
  type?: string;
  date: string;
}

export const DateTag: React.FC<DateTagProps> = ({ type, date, ...props }) => {
  return (
    <Flex
      px={2}
      m={1}
      alignItems='center'
      bg='secondary.50'
      w={['100%', '100%', 'unset']}
      flex={1}
      whiteSpace='nowrap'
      borderRadius='semi'
      {...props}
    >
      <Icon mr={2}>
        <FaRegClock />
      </Icon>
      <Text fontSize='xs'>
        {type && <strong>{type}</strong>} {date}
      </Text>
    </Flex>
  );
};

interface ResourceBannerProps {
  data?: FormattedResource;
}

const date_fields = [
  { property: 'date', name: '' },
  { property: 'datePublished', name: 'Published' },
  { property: 'dateCreated', name: 'Created' },
  { property: 'dateModified', name: 'Modified' },
];

const ResourceBanner: React.FC<ResourceBannerProps> = ({ data }) => {
  if (!data) {
    return null;
  }
  const date_data = date_fields
    .map(({ property, ...fields }) => ({
      ...fields,
      property,
      value: data?.[property],
    }))
    .filter(({ property, value }) => {
      if (property === 'date') {
        // Check if date string is unique or is already included as datePublished, dateModified, dateCreated.
        const is_unique =
          Object.values(data).filter(date => date === value).length === 1;
        return is_unique;
      }
      // Filter data for date properties where a values exists.
      return value;
    });

  const type = data?.['@type'];

  // ResourceCatalogs with a sourceOrganization are displayed as
  // "Program Resource" or "Program Info and Resource" with cyan banner
  // styling instead of the default ResourceCatalog treatment.
  const programVariant = getProgramResourceVariant(data);

  return (
    <TypeBanner
      label={formatAPIResourceTypeForDisplay(type)}
      type={type}
      creativeWorkStatus={data?.creativeWorkStatus}
      bg='info.subtle'
      isNiaidFunded={isSourceFundedByNiaid(data.includedInDataCatalog)}
      programVariant={programVariant}
    >
      <Flex flexWrap='wrap' ml={[0, 0, 4]}>
        {date_data.map((date, i) => {
          return <DateTag key={i} type={date.name} date={date.value} />;
        })}
      </Flex>

      {type === 'ComputationalTool' && (
        <Flex
          alignItems='center'
          mt={1}
          mb={1}
          ml={1}
          bg='secondary.50'
          borderRadius='semi'
        >
          {data.operatingSystem &&
            data.operatingSystem.map((os, i) => {
              const osIcon = operatingSystemIcons.find(
                obj => obj.os === os,
              )?.icon;
              return (
                <Icon key={i} ml={i === 0 ? 2 : 0} mr={2}>
                  {osIcon || <FaComputer />}
                </Icon>
              );
            })}
        </Flex>
      )}
    </TypeBanner>
  );
};

export default ResourceBanner;
