import React from 'react';
import { Stack, Flex, Tag, TagLabel, Text } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';

interface TopicCategoriesProps {
  data?: FormattedResource | null;
}

const TopicCategories: React.FC<TopicCategoriesProps> = ({ data }) => {
  const paddingCard = [4, 6, 8, 10];
  const topics = [
    { label: 'Infectious disease' },
    { label: 'Gynaecology and obstetrics' },
    { label: 'Public health and epidemiology' },
  ];
  return (
    <Stack
      my='0'
      px={paddingCard}
      py='2'
      borderBottom='1px solid'
      borderBottomColor='gray.200'
    >
      <Flex flexWrap='wrap'>
        {topics.map(({ label }) => {
          return (
            <Tag
              key={`${label}`}
              size='sm'
              variant='subtle'
              borderRadius='full'
              m='0.5'
              colorScheme='primary'
            >
              <TagLabel>
                <Text fontSize='xs' m='0.5'>
                  {label}
                </Text>
              </TagLabel>
            </Tag>
          );
        })}
      </Flex>
    </Stack>
  );
};

export default TopicCategories;
