import React from 'react';
import NextLink from 'next/link';
import { Stack, Flex, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { TopicCategory } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { FaMagnifyingGlass } from 'react-icons/fa6';

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
            <NextLink
              key={name}
              href={{
                pathname: '/search',
                query: {
                  q: `topicCategory.name:"${encodeString(name.trim())}"`,
                  advancedSearch: true,
                },
              }}
            >
              <Tag
                size='sm'
                variant='subtle'
                m='0.5'
                colorScheme='primary'
                cursor='pointer'
                _hover={{ textDecoration: 'underline' }}
              >
                <TagLeftIcon as={FaMagnifyingGlass} />
                <TagLabel>{name}</TagLabel>
              </Tag>
            </NextLink>
          );
        })}
      </Flex>
    </Stack>
  );
};

export default TopicCategories;
