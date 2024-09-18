import {
  Box,
  HStack,
  Spinner,
  Text,
  Alert,
  Flex,
  ListItem,
  UnorderedList,
  IconButton,
  Stack,
  Button,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  getChildren,
  OntologyTreeItem,
  OntologyTreeParams,
} from '../helpers';
import { TagWithUrl } from 'src/components/tag-with-url';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaAngleRight, FaCheck, FaMagnifyingGlass, FaX } from 'react-icons/fa6';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [lineage, setLineage] = useState<OntologyTreeItem[] | null>(null);
  const [searchList, setSearchList] = useState<
    { ontology: string; id: string; label: string }[]
  >([]);

  // Memoize the query params to avoid unnecessary recalculations on each render
  const queryParams = useMemo(() => {
    const string_id = Array.isArray(id) ? id[0] : id;
    return {
      id: string_id,
      ontology: (string_id.split('_')[0] === 'NCBITaxon'
        ? 'ncbitaxon'
        : 'edam') as OntologyTreeParams['ontology'],
    };
  }, [id]);

  // Fetch tree data
  const {
    error,
    isLoading,
    data: allData,
  } = useQuery({
    queryKey: ['tree-browser-search', queryParams.id, queryParams.ontology],
    queryFn: () => fetchOntologyTreeByTaxonId(queryParams),
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!queryParams.id,
  });

  const selectedNode = allData?.lineage[allData.lineage.length - 1];

  useEffect(() => {
    if (allData) {
      setLineage(allData.lineage);
    }
  }, [allData]);

  // Update lineage with new children
  const updateLineageWithChildren = useCallback(
    (nodeId: string, children: OntologyTreeItem[]) => {
      setLineage(prevLineage => {
        if (!prevLineage) return [];

        // If no children, return previous lineage as it is
        if (children.length === 0) return prevLineage;

        // Find the index of the node to insert children after
        const index = prevLineage.findIndex(node => node.id === nodeId);
        if (index === -1) return prevLineage;

        // Filter out children that are already in the prevLineage
        const filteredChildren = children.filter(
          child => !prevLineage.some(prevNode => prevNode.id === child.id),
        );

        // If no children left after filtering, return previous lineage as it is
        if (filteredChildren.length === 0) return prevLineage;

        // Merge filtered children into prevLineage
        const merged = [...prevLineage];
        merged.splice(index + 1, 0, ...filteredChildren);

        return merged;
      });
    },
    [],
  );
  if (error) {
    return (
      <Alert status='error'>
        Error fetching tree browser data: {error.message}
      </Alert>
    );
  }
  return (
    <Box w='100%'>
      {selectedNode && (
        <Box my={1}>
          <Text fontWeight='normal' fontSize='sm' lineHeight='none'>
            Selected taxonomy:{' '}
          </Text>
          <HStack>
            <Text as='span' fontWeight='medium'>
              {selectedNode.label}
            </Text>
            <TagWithUrl
              href={selectedNode.iri}
              isExternal
              colorScheme='primary'
            >
              {id}
            </TagWithUrl>
          </HStack>
        </Box>
      )}

      <Box
        w='100%'
        bg='white'
        border='1px solid'
        borderRadius='semi'
        borderColor='niaid.placeholder'
        overflow='hidden'
      >
        {isLoading || !router.isReady ? (
          <Spinner size='md' color='primary.500' m={4} />
        ) : (
          lineage && (
            <Tree
              queryId={queryParams.id}
              data={lineage}
              updateLineage={updateLineageWithChildren}
              isIncludedInSearch={id => {
                return searchList.some(item => item.id === id);
              }}
              addToSearch={({ ontology, id, label }) => {
                setSearchList(prev => {
                  //if it already exists in the list, remove it
                  if (prev.some(item => item.id === id)) {
                    return prev.filter(item => item.id !== id);
                  } else {
                    return [...prev, { ontology, id, label: label }];
                  }
                });
              }}
            />
          )
        )}
      </Box>

      {searchList && searchList.length > 0 && (
        <Box my={4}>
          <HStack my={4} spacing={4} justifyContent='flex-end'>
            <Button
              size='sm'
              onClick={() => setSearchList([])}
              variant='outline'
            >
              Clear
            </Button>
            <Button leftIcon={<FaMagnifyingGlass />} size='sm' isDisabled>
              Search for {searchList.length} values{' '}
            </Button>
          </HStack>
          <Stack
            flexDirection='column'
            bg='white'
            border='1px solid'
            borderRadius='semi'
            borderColor='niaid.placeholder'
            maxHeight={300}
            overflow='auto'
          >
            {searchList.map(({ ontology, label }, index) => (
              <Flex
                key={`${ontology}-${label}`}
                flexDirection={'column'}
                px={2}
                py={1}
                bg={index % 2 ? 'primary.50' : 'transparent'}
              >
                <Text
                  fontSize='12px'
                  color='primary.800'
                  wordBreak='break-word'
                  fontWeight='light'
                  textAlign='left'
                >
                  {ontology.toUpperCase()}
                </Text>

                <Text
                  size='sm'
                  lineHeight='short'
                  color='text.body'
                  wordBreak='break-word'
                  fontWeight='normal'
                  textAlign='left'
                >
                  {label}
                  <Text
                    as='span'
                    fontSize='12px'
                    color='primary.800'
                    ml={1}
                    borderLeft='1px solid'
                    borderLeftColor='gray.400'
                    pl={1}
                  >
                    {id}
                  </Text>
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
const MARGIN = 16;
// TreeNode component
const TreeNode = ({
  addToSearch,
  node,
  data,
  depth = 0,
  isIncludedInSearch,
  queryId,
  updateLineage,
}: {
  addToSearch: (search: {
    ontology: string;
    label: string;
    id: string;
  }) => void;
  data: OntologyTreeItem[];
  depth: number;
  isIncludedInSearch: (id: string) => boolean;
  node: OntologyTreeItem;
  queryId: string;
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  const [isToggled, setIsToggled] = useState(node.state.opened);
  const [fetchedChildren, setFetchedChildren] = useState<OntologyTreeItem[]>(
    [],
  );
  const [childrenList, setChildrenList] = useState<OntologyTreeItem[]>([]);

  const {
    error,
    isLoading,
    data: childrenData,
    refetch: fetchChildren,
  } = useQuery({
    queryKey: ['fetch-children', node.id],
    queryFn: () => {
      if (!node.id) {
        return null;
      }
      return fetchOntologyChildrenByNodeId(node.id, {
        id: node.taxonId,
        ontology: node.ontology_name as OntologyTreeParams['ontology'],
      });
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const toggleNode = () => {
    fetchChildren();
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    if (isToggled && childrenData?.children) {
      setFetchedChildren(childrenData.children);
    } else {
      setFetchedChildren([]);
    }
  }, [queryId, childrenData, isToggled]);

  useEffect(() => {
    setIsToggled(node.state.opened);
    setFetchedChildren([]);
  }, [queryId, node.state.opened]);

  // Set children data in state with node information. Refresh when queryId changes.
  useEffect(() => {
    const children = getChildren(node.id, data);
    setChildrenList(children);
  }, [queryId, data, node.id]);

  // Update lineage with new children data (if there is) when toggled open
  useEffect(() => {
    if (isToggled && fetchedChildren.length > 0) {
      updateLineage(node.id, fetchedChildren);
    }
  }, [queryId, isToggled, fetchedChildren, node.id, updateLineage]);

  return (
    <ListItem>
      <Flex
        alignItems='center'
        borderTop={depth !== 0 ? '0.25px solid' : 'none'}
        borderColor='gray.200'
        bg={node.state.selected ? 'primary.50' : 'transparent'}
        px={4}
        py={2}
        pl={`${(depth + 1) * MARGIN}px`}
        onClick={toggleNode}
        cursor={
          childrenList.length > 0 || node.hasChildren ? 'pointer' : 'default'
        }
        _hover={{
          bg: node.state.selected ? 'primary.50' : 'blackAlpha.100',
        }}
      >
        <IconButton
          aria-label='Search database'
          icon={<FaAngleRight />}
          variant='ghost'
          colorScheme='gray'
          size='sm'
          transform={isToggled ? 'rotate(90deg)' : ''}
          color={
            childrenList.length > 0 || node.hasChildren
              ? 'currentColor'
              : 'transparent'
          }
        />
        <Text
          ml={`${MARGIN}px`}
          color={node.state.selected ? 'primary.500' : 'currentColor'}
          fontWeight={node.state.selected ? 'semibold' : 'normal'}
          textAlign='left'
          flex={1}
        >
          {node.label}
        </Text>
        <IconButton
          aria-label='Search database'
          icon={
            isIncludedInSearch(node.taxonId) ? (
              <FaCheck />
            ) : (
              <FaMagnifyingGlass />
            )
          }
          size='sm'
          variant='outline'
          fontSize='xs'
          onClick={e => {
            e.stopPropagation();
            addToSearch({
              id: node.taxonId,
              label: node.label,
              ontology: node.ontology_name,
            });
          }}
        ></IconButton>
        {isLoading && <Spinner size='sm' color='primary.500' />}
      </Flex>

      {isToggled && childrenList.length > 0 && (
        <UnorderedList ml={0}>
          {childrenList.map(child => (
            <TreeNode
              key={child.id}
              addToSearch={addToSearch}
              isIncludedInSearch={isIncludedInSearch}
              queryId={queryId}
              node={child}
              data={data}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}
        </UnorderedList>
      )}
    </ListItem>
  );
};

// Tree component that renders the entire tree
const Tree = ({
  addToSearch,
  data,
  isIncludedInSearch,
  queryId,
  updateLineage,
}: {
  addToSearch: (search: {
    ontology: string;
    label: string;
    id: string;
  }) => void;
  isIncludedInSearch: (id: string) => boolean;
  queryId: string;
  data: OntologyTreeItem[];
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  // Only render the root nodes initially (nodes with no parent)
  const rootNodes = data.filter(item => !item.parent);

  return (
    <UnorderedList ml={0}>
      {rootNodes.map(node => (
        <TreeNode
          key={node.id}
          addToSearch={addToSearch}
          isIncludedInSearch={isIncludedInSearch}
          queryId={queryId}
          node={node}
          data={data}
          depth={0}
          updateLineage={updateLineage}
        />
      ))}
    </UnorderedList>
  );
};
