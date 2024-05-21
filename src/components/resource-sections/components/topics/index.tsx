import { TopicBrowser } from 'src/components/topic-brower';
import {
  ZoomContainer,
  ZoomProps,
} from 'src/components/topic-brower/components/zoom-container';
import {
  TreeNode,
  transformPathArraysToTree,
} from 'src/components/topic-brower/helpers';
import { useEDAMPaths2Root } from 'src/components/topic-brower/hooks';
import { FormattedResource } from 'src/utils/api/types';
import { ParentSize } from '@visx/responsive';
import {
  Box,
  Flex,
  ListItem,
  UnorderedList,
  Stack,
  Text,
  Tag,
  TagLeftIcon,
  TagLabel,
  OrderedList,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import NextLink from 'next/link';
import { encodeString } from 'src/utils/querystring-helpers';
interface TopicDisplayProps {
  topics: FormattedResource['topicCategory'];
  topTopics: FormattedResource['topicCategory'];
  initialZoom?: ZoomProps['initialTransform'];
  margin?: { top: number; right: number; bottom: number; left: number };
  zoomFactor?: number;
}

export const TopicDisplay = ({
  topics,
  initialZoom,
  margin,
  zoomFactor = 1,
  topTopics,
}: TopicDisplayProps) => {
  const [selectedTopic, setSelectedTopic] = useState<TreeNode | null>(null);
  const { data } = useEDAMPaths2Root(topics);
  const tree = data && transformPathArraysToTree(data.flat());
  const initialTransform = initialZoom
    ? {
        scaleX: initialZoom.scaleX * (1 / zoomFactor),
        scaleY: initialZoom.scaleY * (1 / zoomFactor),
        translateX: initialZoom.translateX,
        translateY: initialZoom.translateY,
        skewX: initialZoom.skewX,
        skewY: initialZoom.skewY,
      }
    : undefined;

  return (
    <Flex flexWrap='wrap'>
      <Flex minWidth='500px' flex={1}>
        <ParentSize>
          {parent => {
            return (
              <ZoomContainer
                width={parent.width}
                height={parent.width * 0.52}
                bg='#272b4d'
                initialTransform={initialTransform}
              >
                <TopicBrowser
                  data={tree}
                  width={parent.width * zoomFactor}
                  height={parent.width * zoomFactor * 0.52}
                  margin={margin}
                  setSelectedTopic={setSelectedTopic}
                />
              </ZoomContainer>
            );
          }}
        </ParentSize>
      </Flex>

      {/* List top 5 topics or if selected show info about selected */}

      {selectedTopic ? (
        <Stack
          flexDirection='column'
          p={{ base: 2, lg: 4 }}
          fontSize='sm'
          flex={1}
          minWidth='230px'
        >
          <Text lineHeight='shorter' fontWeight='semibold'>
            {selectedTopic.name}
          </Text>
          <Text lineHeight='shorter'>{selectedTopic.definition}</Text>

          <NextLink
            href={{
              pathname: '/search',
              query: {
                q: `topic.identifier:"${encodeString(selectedTopic.id)}"`,
                advancedSearch: true,
              },
            }}
          >
            <Tag
              m={1}
              colorScheme='primary'
              variant='subtle'
              size='sm'
              cursor='pointer'
              _hover={{ textDecoration: 'underline' }}
            >
              <TagLeftIcon as={FaMagnifyingGlass} />
              <TagLabel>{selectedTopic.id}</TagLabel>
            </Tag>
          </NextLink>
        </Stack>
      ) : topTopics && topTopics?.length > 0 ? (
        <Box minWidth='230px' px={{ base: 2, lg: 4 }} py={{ base: 2, lg: 0 }}>
          <Text
            color='tertiary.800'
            fontSize='md'
            fontWeight='semibold'
            lineHeight='shorter'
          >
            Most popular topics
          </Text>
          <OrderedList spacing={2} mx={4} my={2}>
            {topTopics.map(({ term, count }) => {
              return (
                <ListItem
                  key={term}
                  listStyleType='inherit'
                  color='gray.700'
                  fontSize='xs'
                  lineHeight='short'
                >
                  <Text>{term}</Text>
                  <Text fontStyle='italic'>{count} results</Text>
                </ListItem>
              );
            })}
          </OrderedList>
        </Box>
      ) : (
        <></>
      )}
    </Flex>
  );
};
