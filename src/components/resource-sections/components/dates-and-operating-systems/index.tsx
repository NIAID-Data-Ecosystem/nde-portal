import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaRegClock, FaComputer } from 'react-icons/fa6';
import TypeBanner from '../type-banner';
import { FormattedResource } from 'src/utils/api/types';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { operatingSystemIcons } from 'src/utils/helpers/operating-system-icons';

/*
[COMPONENT INFO]:
  Display (publishes, created, modified) dates and operating system info if available for a given computational tool.
  The ["date"] field in the api is general. It represents either the latest value between published, created and modified dates OR is a unique field provided from the source repo. Therefore, if the date field is the same as one of the other fields we can remove it.
*/

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
      <Icon as={FaRegClock} mr={2} />
      <Text fontSize='xs'>
        {type && <strong>{type}</strong>} {date}
      </Text>
    </Flex>
  );
};

interface ResourceDatesAndOperatingSystems {
  data?: FormattedResource;
}

const date_fields = [
  { property: 'date', name: '' },
  { property: 'datePublished', name: 'Published' },
  { property: 'dateCreated', name: 'Created' },
  { property: 'dateModified', name: 'Modified' },
];

const ResourceDatesAndOperatingSystems: React.FC<
  ResourceDatesAndOperatingSystems
> = ({ data }) => {
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

  const os_data = data.operatingSystem;

  return (
    <TypeBanner
      type={data?.['@type']}
      bg='status.info_lt'
      isNiaidFunded={isSourceFundedByNiaid(data.includedInDataCatalog)}
    >
      <Flex flexWrap='wrap' ml={[0, 0, 4]}>
        {date_data.map((date, i) => {
          return <DateTag key={i} type={date.name} date={date.value} />;
        })}
      </Flex>

      <Flex
        alignItems='center'
        mt={1}
        mb={1}
        ml={1}
        bg='secondary.50'
        borderRadius='semi'
      >
        {os_data &&
          os_data.map((os, i) => {
            const osIcon = operatingSystemIcons.find(
              obj => obj.os === os,
            )?.icon;
            return (
              <Icon
                key={i}
                as={osIcon || FaComputer}
                ml={i === 0 ? 2 : 0}
                mr={2}
              />
            );
          })}
      </Flex>
    </TypeBanner>
  );
};

export default ResourceDatesAndOperatingSystems;
