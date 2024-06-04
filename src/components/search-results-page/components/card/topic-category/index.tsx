import React from 'react';
import { Stack, Flex, Tag, TagLabel, Text } from '@chakra-ui/react';
import { TopicCategory } from 'src/utils/api/types';

interface TopicCategoryProps {
  data?: TopicCategory[] | null;
}

const TopicCategories: React.FC<TopicCategoryProps> = ({ data }) => {
  const topicCategoryNames = data?.map(element => element.name).sort();
  const paddingCard = [4, 6, 8, 10];
  return (
    <Stack
      my='0'
      px={paddingCard}
      py='2'
      borderBottom='1px solid'
      borderBottomColor='gray.200'
    >
      <Flex flexWrap='wrap'>
        {topicCategoryNames?.map(name => {
          return (
            <Tag
              key={`${name}`}
              size='sm'
              variant='subtle'
              borderRadius='full'
              m='0.5'
              colorScheme='teal'
            >
              <TagLabel>
                <Text fontSize='xs' m='0.5'>
                  {name}
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
