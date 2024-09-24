import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  ListItem,
  Spinner,
  Switch,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  FaAngleRight,
  FaCheck,
  FaEllipsis,
  FaMagnifyingGlass,
  FaX,
} from 'react-icons/fa6';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  getChildren,
  OntologyTreeItem,
  OntologyTreeParams,
} from '../helpers';
import { TagWithUrl } from 'src/components/tag-with-url';
import { Link } from 'src/components/link';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [lineage, setLineage] = useState<OntologyTreeItem[] | null>(null);
  const [searchList, setSearchList] = useState<
    { ontology: string; id: string; label: string }[]
  >([]);
  const [showFromIndex, setShowFromIndex] = useState(0);
  const [viewMode, setViewMode] = useState('condensed');

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
  const MAX_NODES = 5;
  useEffect(() => {
    if (allData) {
      setLineage(allData.lineage);
      if (viewMode === 'condensed') {
        setShowFromIndex(
          allData.lineage.length > MAX_NODES ? allData.lineage.length - 3 : 0,
        );
      } else {
        setShowFromIndex(0);
      }
    }
  }, [allData, viewMode]);

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
    <>
      <HStack w='100%' alignItems='flex-start' spacing={10} flexWrap='wrap'>
        <Box flex={2} minWidth='500px'>
          {selectedNode && (
            <Flex
              w='100%'
              justifyContent='space-between'
              alignItems='flex-end'
              mb={1}
            >
              <Box>
                <Text fontWeight='normal' fontSize='sm' lineHeight='short'>
                  Selected taxonomy:{' '}
                </Text>
                <HStack>
                  <Link
                    href={selectedNode.iri}
                    fontWeight='medium'
                    isExternal
                    fontSize='sm'
                  >
                    {selectedNode.label}
                  </Link>
                </HStack>
              </Box>
              {/* toggle */}
              <Flex justifyContent='flex-end'>
                {router.query.id && (
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel htmlFor='condensed-view' mb='0' fontSize='sm'>
                      Enable condensed view?
                    </FormLabel>
                    <Switch
                      id='condensed-view'
                      colorScheme='primary'
                      isChecked={viewMode === 'condensed'}
                      onChange={() =>
                        setViewMode(
                          viewMode === 'condensed' ? 'expanded' : 'condensed',
                        )
                      }
                    />
                  </FormControl>
                )}
              </Flex>
            </Flex>
          )}
          {/* Tree Browser */}
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
                  showFromIndex={showFromIndex}
                  data={lineage}
                  updateLineage={updateLineageWithChildren}
                  updateShowFromIndex={setShowFromIndex}
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
        </Box>

        {/* Search List */}
        {searchList && searchList.length > 0 && (
          <Flex
            flexDirection='column'
            flex={1}
            maxWidth='400px'
            mt={7}
            alignItems='flex-end'
          >
            <Flex justifyContent='space-between' w='100%'>
              <Text fontSize='sm' fontWeight='medium' mb={1} lineHeight='tall'>
                List of search values
              </Text>
              <Button
                size='sm'
                onClick={() => setSearchList([])}
                variant='link'
              >
                Clear all
              </Button>
            </Flex>
            {/* Search list */}
            <Box
              flex={1}
              w='100%'
              flexDirection='column'
              bg='white'
              border='1px solid'
              borderRadius='semi'
              borderColor='niaid.placeholder'
              maxHeight={300}
              overflow='auto'
            >
              {searchList.map(({ id, ontology, label }, index) => (
                <Flex
                  key={`${ontology}-${id}`}
                  px={2}
                  py={1}
                  bg={index % 2 ? 'primary.50' : 'transparent'}
                >
                  <Text
                    fontSize='xs'
                    lineHeight='short'
                    color='text.body'
                    wordBreak='break-word'
                    fontWeight='normal'
                    textAlign='left'
                    flex={1}
                    display='flex'
                    alignItems='center'
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
                  <IconButton
                    aria-label='remove item from search'
                    icon={<Icon as={FaX} boxSize={2.5} />}
                    variant='ghost'
                    colorScheme='red'
                    size='sm'
                    p={1}
                    color='red.500'
                    boxSize={6}
                    minWidth={6}
                    onClick={() => {
                      setSearchList(prev =>
                        prev.filter(item => item.label !== label),
                      );
                    }}
                  />
                </Flex>
              ))}
            </Box>
            <Button
              mt={2}
              leftIcon={<FaMagnifyingGlass />}
              size='sm'
              onClick={() => {
                const termsWithFields = searchList.map(node => {
                  if (node.id.includes('NCBITaxon')) {
                    return `species.identifier: "${
                      node.id.split('_')[1]
                    }" OR infectiousAgent.identifier: "${
                      node.id.split('_')[1]
                    }"`;
                  } else if (node.id.startsWith('topic')) {
                    return `topicCategory.identifier: "${node.id}"`;
                  }
                  return node.id;
                });
                // const terms = searchList.map(node => {
                //   if (node.id.includes('NCBITaxon')) {
                //     return node.id.split('_')[1];
                //   }
                //   return node.id;
                // });
                // const q = `"${termsWithFields.join('" OR "')}"`;

                router.push({
                  pathname: `/search`,
                  query: {
                    q: `${termsWithFields.join(' OR ')}`,
                  },
                });
              }}
            >
              Search for {searchList.length}{' '}
              {searchList.length > 1 ? 'values' : 'value'}
            </Button>
          </Flex>
        )}
      </HStack>
    </>
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
        px={4}
        py={2}
        pl={`${(depth + 1) * MARGIN}px`}
        onClick={toggleNode}
        cursor={
          childrenList.length > 0 || node.hasChildren ? 'pointer' : 'default'
        }
        _hover={{
          bg: 'blackAlpha.50',
        }}
      >
        {childrenList.length > 0 || node.hasChildren ? (
          <IconButton
            aria-label='Search database'
            icon={<FaAngleRight />}
            variant='ghost'
            colorScheme='gray'
            size='sm'
            transform={isToggled ? 'rotate(90deg)' : ''}
            color='currentColor'
          />
        ) : (
          <Box mx={4}></Box>
        )}
        <HStack spacing={2} flex={1} ml={`${MARGIN}px`}>
          <Link href={node.iri} fontSize='xs' isExternal>
            <Text
              color={node.state.selected ? 'primary.500' : 'currentColor'}
              fontWeight={node.state.selected ? 'semibold' : 'normal'}
              textAlign='left'
              fontSize='sm'
            >
              {node.label}
            </Text>
          </Link>
        </HStack>
        {isLoading && <Spinner size='sm' color='primary.500' mx={2} />}
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
        />
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
  showFromIndex,
  updateLineage,
  updateShowFromIndex,
}: {
  addToSearch: (search: {
    ontology: string;
    label: string;
    id: string;
  }) => void;
  isIncludedInSearch: (id: string) => boolean;
  queryId: string;
  data: OntologyTreeItem[];
  showFromIndex: number;
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
  updateShowFromIndex: (index: number) => void;
}) => {
  // Only render the root nodes initially (nodes with no parent)
  // const rootNodes = data.filter(item => !item.parent);
  const treeNodes = data.slice(showFromIndex);
  const rootNodes = [treeNodes[0]];

  const pathNodes = data.slice(0, showFromIndex);

  return (
    <UnorderedList ml={0}>
      {showFromIndex > 0 && (
        <>
          <ListItem>
            {/* breadcrumb like path for treenodes */}
            <HStack
              alignItems='center'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${MARGIN}px`}
              flexWrap='wrap'
              spacing={0}
              divider={
                <Icon
                  as={FaAngleRight}
                  color='gray.400'
                  boxSize={3}
                  borderLeft='none'
                />
              }
            >
              {pathNodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <Button
                    colorScheme='gray'
                    variant='ghost'
                    size='sm'
                    px={1}
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => updateShowFromIndex(index)}
                  >
                    {node.label}
                  </Button>
                </React.Fragment>
              ))}
            </HStack>
          </ListItem>
          <ListItem>
            <Flex
              alignItems='center'
              borderY='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${MARGIN}px`}
              onClick={() => {
                updateShowFromIndex(showFromIndex < 1 ? 0 : showFromIndex - 1);
              }}
              cursor='pointer'
              _hover={{
                bg: 'blackAlpha.100',
              }}
            >
              <IconButton
                aria-label='show previous nodes'
                icon={<FaEllipsis />}
                variant='ghost'
                colorScheme='gray'
                size='sm'
                color='currentColor'
                justifyContent='flex-start'
                px={2}
              />
            </Flex>
          </ListItem>
        </>
      )}
      {rootNodes.map(node => (
        <TreeNode
          key={node.id}
          addToSearch={addToSearch}
          isIncludedInSearch={isIncludedInSearch}
          queryId={queryId}
          node={node}
          data={treeNodes}
          depth={0}
          updateLineage={updateLineage}
        />
      ))}
    </UnorderedList>
  );
};
