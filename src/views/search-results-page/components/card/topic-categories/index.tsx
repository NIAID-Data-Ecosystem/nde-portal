import React, { useState } from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FormattedResource, TopicCategory } from 'src/utils/api/types';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';
import { Button } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import Tooltip from 'src/components/tooltip';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { FaInfo } from 'react-icons/fa6';

interface TopicCategoryProps extends FlexProps {
  data?: TopicCategory[] | null;
  type: FormattedResource['@type'];
}

// Number of topic categories to be shown when the view is not expanded
const DEFAULT_LIMIT = 3;

const generateButtonLabel = (limit: number, length: number) => {
  return limit === length
    ? 'Show fewer topics'
    : `Show all topics (${formatNumber(length - limit)} more)`;
};

const metadataFields = SCHEMA_DEFINITIONS as SchemaDefinitions;

const TopicCategories: React.FC<TopicCategoryProps> = ({
  data,
  type,
  ...props
}) => {
  const topicCategoryNames =
    data
      ?.flatMap(topic =>
        topic?.name && typeof topic.name === 'string' ? [topic.name] : [],
      )
      .sort() || [];

  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const toggleLimit = () => {
    setLimit(prev =>
      prev === topicCategoryNames.length
        ? DEFAULT_LIMIT
        : topicCategoryNames.length,
    );
  };

  if (topicCategoryNames?.length === 0) return null;

  return (
    <ScrollContainer maxHeight='320px' m={0} p={0}>
      <Flex
        flexWrap='wrap'
        my={0}
        py={1}
        borderBottom='1px solid'
        borderBottomColor='gray.200'
        {...props}
      >
        <Tooltip label={metadataFields['topicCategory'].description?.[type]}>
          <Text fontSize='xs' color='gray.800' mr={1} userSelect='none'>
            Topic Categories
            <Icon
              as={FaInfo}
              boxSize={3.5}
              border='1px solid'
              borderRadius='full'
              p={0.5}
              mx={1}
              color='gray.800!important'
            />
            :
          </Text>
        </Tooltip>
        {topicCategoryNames?.slice(0, limit).map(name => {
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
        {topicCategoryNames?.length > DEFAULT_LIMIT && (
          <Button
            size='xs'
            variant='link'
            justifyContent='flex-end'
            m={1}
            onClick={toggleLimit}
          >
            {generateButtonLabel(limit, topicCategoryNames.length)}
          </Button>
        )}
      </Flex>
    </ScrollContainer>
  );
};

export default TopicCategories;
