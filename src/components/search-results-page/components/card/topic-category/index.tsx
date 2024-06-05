import React from 'react';
import { Stack, Flex } from '@chakra-ui/react';
import { TopicCategory } from 'src/utils/api/types';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { TagWithUrl } from 'src/components/tag-with-url';

interface TopicCategoryProps {
  data?: TopicCategory[] | null;
}

const TopicCategories: React.FC<TopicCategoryProps> = ({ data }) => {
  const topicCategoryNames = data
    ?.filter(element => element.name !== undefined)
    .map(element => element.name!)
    .sort();
  const paddingCard = [4, 6, 8, 10];
  if (topicCategoryNames?.length === 0) return null;
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
            <TagWithUrl
              key={name}
              colorScheme='primary'
              href={{
                pathname: '/search',
                query: {
                  q: `topicCategory.name:"${name.trim()}"`,
                },
              }}
              m={0.5}
              leftIcon={FaMagnifyingGlass}
            >
              {name}
            </TagWithUrl>
          );
        })}
      </Flex>
    </Stack>
  );
};

export default TopicCategories;
