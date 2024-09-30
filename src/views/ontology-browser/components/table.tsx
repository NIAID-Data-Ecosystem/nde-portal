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
  Tag,
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
} from 'react-icons/fa6';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  formatIdentifier,
  getChildren,
  OntologyTreeItem,
  OntologyTreeParams,
} from '../helpers';
import { Link } from 'src/components/link';
import { fetchSearchResults } from 'src/utils/api';
import Tooltip from 'src/components/tooltip';

export const OntologyBrowserTable = ({
  searchList,
  setSearchList,
}: {
  searchList: {
    ontology: string;
    id: string;
    label: string;
    facet: string[];
    count?: number;
  }[];
  setSearchList: React.Dispatch<
    React.SetStateAction<
      {
        ontology: string;
        id: string;
        label: string;
        facet: string[];
        count?: number;
      }[]
    >
  >;
}) => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [lineage, setLineage] = useState<OntologyTreeItem[] | null>(null);

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
    queryKey: ['ontology-browser-tree', queryParams.id, queryParams.ontology],
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
      <Flex
        className='onto-table'
        w='100%'
        alignItems='flex-start'
        flexWrap='wrap'
        flex={1}
      >
        <Box flex={2} minWidth={{ base: 'unset', md: '500px' }}>
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
                  addToSearch={({ ontology, id, label, facet, count }) => {
                    setSearchList(prev => {
                      //if it already exists in the list, remove it
                      if (prev.some(item => item.id === id)) {
                        return prev.filter(item => item.id !== id);
                      } else {
                        return [...prev, { ontology, id, label, facet, count }];
                      }
                    });
                  }}
                />
              )
            )}
          </Box>
        </Box>
      </Flex>
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
    facet: string[];
    count?: number;
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

  // Fetch resource count for each node.
  const router = useRouter();

  const {
    isLoading: countIsLoading,
    data: { total: count, facet } = { total: 0, facet: [] },
  } = useQuery({
    queryKey: ['fetch-count', node.id],
    queryFn: async () => {
      if (!node.id) {
        return {
          total: 0,
          facet: [],
        };
      }

      const id = formatIdentifier({ id: node.taxonId });

      // Separate query handlers for ncbitaxon and edam
      if (node.ontology_name === 'ncbitaxon') {
        const species_property = 'species.identifier';
        const infectiousAgent_property = 'infectiousAgent.identifier';

        /*
        Based on the counts (maybe by running multiple queries), we can decide which facet to use (i.e. infectiousAgent vs species) when executing the final search.
        Then instead of "OR"ing these two general categories which could be really long depending on the onto. We can drill down further to the specific facet. (i.e. species.identifier:"####" OR species.name "-----")
        */
        const speciesQuery = fetchSearchResults({
          q: `${
            router.query.q ? `${router.query.q} AND ` : ''
          }(${species_property}:"${id}")`,
          size: 0,
        });

        const infectiousAgentQuery = fetchSearchResults({
          q: `${
            router.query.q ? `${router.query.q} AND ` : ''
          }(${infectiousAgent_property}:"${id}")`,
          size: 0,
        });

        // Wait for both queries to complete
        const [speciesResult, infectiousAgentResult] = await Promise.all([
          speciesQuery,
          infectiousAgentQuery,
        ]);

        if (speciesResult?.total) {
          return { total: speciesResult.total, facet: [species_property] };
        } else if (infectiousAgentResult?.total) {
          return {
            total: infectiousAgentResult.total,
            facet: [infectiousAgent_property],
          };
        } else {
          return {
            total: 0,
            facet: [infectiousAgent_property, species_property],
          };
        }
      } else if (node.ontology_name === 'edam') {
        const topicCategory_property = 'topicCategory.identifier';
        const edamQuery = fetchSearchResults({
          q: `${
            router.query.q ? `${router.query.q} AND ` : ''
          }(${topicCategory_property}:"${id}")`,
          size: 0,
        });

        const topicCategoryResult = await edamQuery;

        return {
          total: topicCategoryResult?.total || 0,
          facet: [topicCategory_property],
        };
      }

      return {
        total: 0,
        facet: [],
      };
    },
    select: data => data,
    refetchOnWindowFocus: false,
    enabled: !!node.id,
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
        sx={{ '>*': { px: 4, py: 2 } }}
        pl={`${(depth + 1) * MARGIN}px`}
        _hover={{
          bg: 'blackAlpha.50',
        }}
      >
        <Flex
          as='button'
          alignItems='center'
          onClick={toggleNode}
          cursor={
            childrenList.length > 0 || node.hasChildren ? 'pointer' : 'default'
          }
          flex={1}
        >
          {childrenList.length > 0 || node.hasChildren ? (
            <IconButton
              as='div'
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
          <Box
            alignItems='flex-start'
            flex={1}
            fontWeight='normal'
            lineHeight='short'
            ml={2}
            textAlign='left'
            wordBreak='break-word'
          >
            <Text color='gray.800' fontSize='12px'>
              {node.taxonId}
            </Text>

            <Link href={node.iri} fontSize='xs' isExternal>
              <Text
                color={node.state.selected ? 'primary.500' : 'currentColor'}
                fontWeight={node.state.selected ? 'semibold' : 'medium'}
                lineHeight='inherit'
                textAlign='left'
                fontSize='xs'
              >
                {node.label}
              </Text>
            </Link>
          </Box>
        </Flex>
        <HStack>
          <Tooltip label='Number of potential matching resources in NIAID Discovery Portal'>
            <Tag
              borderRadius='full'
              colorScheme={!countIsLoading && count === 0 ? 'gray' : 'primary'}
              variant='subtle'
              size='sm'
            >
              {isLoading || countIsLoading ? (
                <Spinner size='sm' color='primary.500' mx={2} />
              ) : (
                count?.toLocaleString() || 0
              )}
            </Tag>
          </Tooltip>
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
                count,
                facet,
              });
            }}
          />
        </HStack>
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
    facet: string[];
    count?: number;
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
