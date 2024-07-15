import { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  ListItem,
  Stack,
  Text,
  Tag,
  TagLeftIcon,
  TagLabel,
  OrderedList,
} from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import NextLink from 'next/link';
import { encodeString } from 'src/utils/querystring-helpers';
import { TopicBrowser } from 'src/components/topic-brower';
import {
  ZoomContainer,
  ZoomProps,
} from 'src/components/topic-brower/components/zoom-container';
import {
  TreeNode,
  transformAncestorsArraysToTree,
} from 'src/components/topic-brower/helpers';
import { useEBIData } from 'src/components/topic-brower/hooks';
import { FacetTerm } from 'src/utils/api/types';
import { ParentSize } from '@visx/responsive';

interface TopicDisplayProps {
  facetTerms: FacetTerm[];
  initialZoom?: ZoomProps['initialTransform'];
  margin?: { top: number; right: number; bottom: number; left: number };
  zoomFactor?: number;
  facet: string;
}

export const TopicDisplay = ({
  facet,
  facetTerms,
  initialZoom,
  margin,
  zoomFactor = 1,
}: TopicDisplayProps) => {
  // Get the ontology based on the facet.
  const ontology = useMemo(() => {
    if (facet === 'topicCategory.url') {
      return 'edam';
    } else if (
      facet === 'species.identifier' ||
      facet === 'infectiousAgent.identifier'
    ) {
      return 'ncbitaxon';
    } else {
      return '';
    }
  }, [facet]);
  const [selectedTopic, setSelectedTopic] = useState<TreeNode | null>(null);
  // Using the biontology api to get the paths to root for the topics.
  // const { data: OntData } = useOntologyPaths2Root(facetTerms, ontology);
  // const oldTree = OntData && transformPathArraysToTree(OntData);

  // Using the ebi api to get the hierarchical relationships for the topics.
  const { data } = useEBIData(facetTerms, ontology);
  const tree = data && transformAncestorsArraysToTree(data);

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
      <Flex minWidth='500px' maxWidth='700px' flex={1}>
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
              pathname: '/visual-search',
              query: {
                q: selectedTopic.id
                  ? `${facet}:"${encodeString(selectedTopic.id)}"`
                  : '',
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
      ) : data && data?.length > 0 ? (
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
            {data.map(({ id, name, count }) => {
              return (
                <ListItem
                  key={id}
                  listStyleType='inherit'
                  color='gray.700'
                  fontSize='xs'
                  lineHeight='short'
                >
                  <Text>{name}</Text>
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
