import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
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
    <Box
      my={0}
      px={paddingCard}
      py={1}
      borderBottom='1px solid'
      borderBottomColor='gray.200'
    >
      <Text fontWeight='medium' fontSize='xs' color='gray.800'>
        Topic Categories
      </Text>
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
    </Box>
  );
};

export default TopicCategories;
