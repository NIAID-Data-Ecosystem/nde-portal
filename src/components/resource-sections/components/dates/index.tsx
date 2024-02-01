import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa6';
import TypeBanner from '../type-banner';
import { FormattedResource } from 'src/utils/api/types';
import { isSourceFundedByNiaid } from 'src/utils/helpers';

/*
[COMPONENT INFO]:
  Display (publishes, created, modified) dates if available for a given resource.
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

interface ResourceDates {
  data?: FormattedResource;
}

const date_fields = [
  { property: 'date', name: '' },
  { property: 'datePublished', name: 'Published' },
  { property: 'dateCreated', name: 'Created' },
  { property: 'dateModified', name: 'Modified' },
];

const ResourceDates: React.FC<ResourceDates> = ({ data }) => {
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

  return (
    <TypeBanner
      type={data?.type}
      bg='status.info_lt'
      isNiaidFunded={isSourceFundedByNiaid(data.includedInDataCatalog)}
      subType={data?.collectionType}
    >
      <Flex flexWrap='wrap' ml={[0, 0, 4]}>
        {date_data.map((date, i) => {
          return <DateTag key={i} type={date.name} date={date.value} />;
        })}
      </Flex>
    </TypeBanner>
  );
};

export default ResourceDates;
