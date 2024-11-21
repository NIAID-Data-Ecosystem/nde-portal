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
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  FaAngleLeft,
  FaAngleRight,
  FaCheck,
  FaEllipsis,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import {
  fetchFromBioThingsAPI,
  fetchOntologyChildrenByTaxonID,
  fetchFromOLSAPI,
  fetchPortalCounts,
  getChildren,
  PaginatedOntologyTreeResponse,
  sortChildrenList,
} from '../helpers';
import { Link } from 'src/components/link';
import { fetchSearchResults } from 'src/utils/api';
import Tooltip from 'src/components/tooltip';
import { ConfigureView } from './configure-view';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItem,
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from '../types';

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
  // Store the view configuration in local storage.
  // [isCondensed]: Show only the selected node and its immediate parent/children.
  // [includeEmptyCounts]: Include items without datasets in the view.
  const [viewConfig, setViewConfig] = useLocalStorage('ontology-browser-view', {
    isCondensed: true,
    includeEmptyCounts: true,
  });

  // State to manage the ontology tree lineage
  const [lineage, setLineage] = useState<OntologyLineageItem[] | null>(null);

  // Index of the node used for the condensed view
  const [showFromIndex, setShowFromIndex] = useState(0);

  // Extract the query ID from the router, defaulting to the root taxon ID
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';

  // Memoize query parameters to avoid recalculating on each render
  const queryParams = useMemo(() => {
    const parsedId = Array.isArray(id) ? id[0] : id;
    const ontology =
      parsedId
        .match(/[a-zA-Z]+/g)
        ?.join('')
        .toLowerCase() || '';
    return {
      q: (router.query.q || '__all__') as string,
      id: parsedId.replace(/[^0-9]/g, ''),
      ontology: ontology as OntologyLineageRequestParams['ontology'],
    };
  }, [id, router.query.q]);

  // Fetch tree data using the ontology type and query parameters
  const {
    error,
    isLoading,
    data: treeData,
  } = useQuery({
    queryKey: [
      'ontology-browser-tree',
      queryParams.q,
      queryParams.id,
      queryParams.ontology,
    ],
    queryFn: () => {
      if (queryParams.ontology === 'ncbitaxon') {
        return fetchFromBioThingsAPI(queryParams).then(data =>
          fetchPortalCounts(data.lineage, queryParams),
        );
      }
      return fetchFromOLSAPI(queryParams).then(data =>
        fetchPortalCounts(data.lineage, queryParams),
      );
    },
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!queryParams.id,
  });

  const selectedNode = treeData?.lineage[treeData.lineage.length - 1];
  const MAX_NODES = 5;
  useEffect(() => {
    if (treeData) {
      setLineage(treeData.lineage);
      if (viewConfig.isCondensed) {
        setShowFromIndex(
          treeData.lineage.length > MAX_NODES ? treeData.lineage.length - 3 : 0,
        );
      } else {
        setShowFromIndex(0);
      }
    }
  }, [treeData, viewConfig.isCondensed]);

  // Update lineage with new children
  const updateLineageWithChildren = useCallback(
    (nodeId: string, children: OntologyLineageItem[]) => {
      setLineage(prevLineage => {
        if (!prevLineage) return [];

        // If no children, return previous lineage as it is
        if (children.length === 0) return prevLineage;

        // Find the index of the node to insert children after
        const index = prevLineage.findIndex(node => +node.id === +nodeId);
        if (index === -1) return prevLineage;

        // Filter out children that are already in the prevLineage
        const filteredChildren = children.filter(
          child =>
            !prevLineage.some(prevNode => prevNode.taxonId === child.taxonId),
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
              {/* Popover menu with options to configure the display table */}
              <ConfigureView
                label='Configure View'
                buttonProps={{ size: 'sm' }}
              >
                <VStack lineHeight='shorter' spacing={4}>
                  <FormControl
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mt={1}
                  >
                    <FormLabel htmlFor='condensed-view' mb='0' fontSize='sm'>
                      Enable condensed view?
                    </FormLabel>
                    <Switch
                      id='condensed-view'
                      colorScheme='primary'
                      isChecked={viewConfig.isCondensed === true}
                      onChange={() =>
                        setViewConfig(() => {
                          return {
                            ...viewConfig,
                            isCondensed: !viewConfig.isCondensed,
                          };
                        })
                      }
                    />
                  </FormControl>
                  <FormControl
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mt={1}
                  >
                    <FormLabel
                      htmlFor='include-empty-counts'
                      mb='0'
                      fontSize='sm'
                    >
                      Hide terms with 0 datasets?
                    </FormLabel>
                    <Switch
                      id='include-empty-counts'
                      colorScheme='primary'
                      isChecked={viewConfig.includeEmptyCounts === false}
                      onChange={() =>
                        setViewConfig(() => {
                          return {
                            ...viewConfig,
                            includeEmptyCounts: !viewConfig.includeEmptyCounts,
                          };
                        })
                      }
                    />
                  </FormControl>
                </VStack>
              </ConfigureView>
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
                  params={queryParams}
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
const SIZE = 100;

// TreeNode component
const TreeNode = ({
  addToSearch,
  node,
  data,
  depth = 0,
  isIncludedInSearch,
  params,
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
  data: OntologyLineageItem[];
  depth: number;
  isIncludedInSearch: (id: string) => boolean;
  node: OntologyLineageItemWithCounts;
  params: OntologyLineageRequestParams;
  queryId: string;
  updateLineage: (nodeId: string, children: OntologyLineageItem[]) => void;
}) => {
  console.log(data);
  const [isToggled, setIsToggled] = useState(node.state.opened);
  const [fetchedChildren, setFetchedChildren] = useState<OntologyLineageItem[]>(
    [],
  );
  const [childrenList, setChildrenList] = useState<OntologyLineageItem[]>([]);
  const [childrenMeta, setChildrenMeta] = useState<Pick<
    PaginatedOntologyTreeResponse,
    'hasMore' | 'numPage' | 'totalPages' | 'totalElements'
  > | null>(null);
  const [page, setPage] = useState(0);
  const {
    error,
    isLoading,
    data: childrenData,
    refetch: fetchChildren,
  } = useQuery({
    queryKey: [
      'fetch-descendants',
      node.taxonId,
      node.id,
      node.ontologyName,
      params.q,
      page,
    ],
    queryFn: () => {
      return fetchOntologyChildrenByTaxonID({
        q: params.q,
        id: node.taxonId.toString(),
        ontology: node.ontologyName as OntologyLineageRequestParams['ontology'],
        size: SIZE,
        page,
        parentId: node.id.toString(),
      });
    },
    refetchOnWindowFocus: false,
    enabled: page > 0,
  });

  const toggleNode = () => {
    fetchChildren();
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    if (
      isToggled &&
      childrenData?.children &&
      childrenData?.children.length > 0
    ) {
      setFetchedChildren(childrenData.children);
      setChildrenMeta({
        hasMore: childrenData.hasMore,
        numPage: childrenData.numPage,
        totalPages: childrenData.totalPages,
        totalElements: childrenData.totalElements,
      });
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
      updateLineage(node.id.toString(), fetchedChildren);
    }
  }, [queryId, isToggled, fetchedChildren, node.id, updateLineage]);

  // Hide nodes with no children if configured
  const config = useReadLocalStorage<{ includeEmptyCounts: boolean }>(
    'ontology-browser-view',
  );

  if (
    !config?.includeEmptyCounts &&
    node.counts.term === 0 &&
    node.counts.lineage === 0 &&
    !childrenList.length
  ) {
    return <></>;
  }

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
          <Tooltip
            label={
              <>
                Number of datasets{' '}
                <Text as='span' textDecoration='underline'>
                  for this term
                </Text>{' '}
                in the NIAID Discovery Portal
              </>
            }
          >
            <Tag
              borderRadius='full'
              colorScheme={node.counts.term === 0 ? 'gray' : 'primary'}
              variant='subtle'
              size='sm'
            >
              {isLoading ? (
                <Spinner size='sm' color='primary.500' mx={2} />
              ) : (
                node.counts.term?.toLocaleString() || 0
              )}
            </Tag>
          </Tooltip>

          <Tooltip
            label={
              <>
                Number of datasets{' '}
                <Text as='span' textDecoration='underline'>
                  for this term and sub-terms
                </Text>{' '}
                in the NIAID Discovery Portal
              </>
            }
          >
            <Text fontSize='sm' mr={2} fontWeight='medium' color='text.body'>
              {isLoading ? (
                <Spinner size='sm' color='primary.500' mx={2} />
              ) : (
                '/ ' + node.counts.lineage?.toLocaleString() || 0
              )}
            </Text>
          </Tooltip>
          <IconButton
            aria-label='Search database'
            icon={
              isIncludedInSearch(node.taxonId.toString()) ? (
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
              // addToSearch({
              //   id: node.taxonId.toString(),
              //   label: node.label,
              //   ontology: node.ontologyName,
              //   count: node.counts.term,
              // });
            }}
          />
        </HStack>
      </Flex>
      {isToggled && childrenList.length > 0 && (
        <UnorderedList ml={0}>
          {(childrenMeta?.hasMore || (isLoading && page > 0)) && (
            <ListItem
              borderTop='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${(depth + 1) * MARGIN}px`}
              bg='blackAlpha.100'
            >
              <Flex
                px={4}
                ml={4}
                pl={10}
                flexDirection='row'
                alignItems='baseline'
                flex={1}
              >
                <Text color='niaid.800' fontSize='13px'>
                  Showing{' '}
                  {childrenMeta ? SIZE * (childrenMeta.numPage + 1) : '-'} of{' '}
                  {childrenMeta
                    ? childrenMeta.totalElements.toLocaleString()
                    : ' - '}{' '}
                  children for{' '}
                  <Text as='span' fontWeight='semibold'>
                    {node.label}.
                  </Text>
                </Text>
                <Button
                  isLoading={isLoading}
                  variant='link'
                  size='sm'
                  fontSize='13px'
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  ml={2}
                >
                  Show {SIZE} more
                </Button>
              </Flex>
            </ListItem>
          )}
          {sortChildrenList(childrenList).map(child => (
            <TreeNode
              key={child.id}
              addToSearch={addToSearch}
              isIncludedInSearch={isIncludedInSearch}
              queryId={queryId}
              node={child}
              params={params}
              data={data}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}

          {(childrenMeta?.hasMore || (isLoading && page > 0)) && (
            <ListItem
              borderTop='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${(depth + 1) * MARGIN}px`}
              bg='blackAlpha.100'
            >
              <Flex
                px={4}
                ml={4}
                pl={10}
                flexDirection='row'
                alignItems='baseline'
                flex={1}
              >
                <Text color='niaid.800' fontSize='13px'>
                  Showing{' '}
                  {childrenMeta
                    ? (SIZE * (childrenMeta.numPage + 1)).toLocaleString()
                    : '-'}{' '}
                  of{' '}
                  {childrenMeta
                    ? childrenMeta.totalElements.toLocaleString()
                    : ' - '}{' '}
                  children for{' '}
                  <Text as='span' fontWeight='semibold'>
                    {node.label}.
                  </Text>
                </Text>
                <Button
                  isLoading={isLoading}
                  variant='link'
                  size='sm'
                  fontSize='13px'
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  ml={2}
                >
                  Show {SIZE} more
                </Button>
              </Flex>
            </ListItem>
          )}
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
  params,
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
  params: OntologyLineageRequestParams;
  queryId: string;
  data: OntologyLineageItemWithCounts[];
  showFromIndex: number;
  updateLineage: (nodeId: string, children: OntologyLineageItem[]) => void;
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
            <Tooltip label='Show parent'>
              <Flex
                alignItems='center'
                borderY='0.25px solid'
                borderColor='gray.200'
                px={4}
                py={2}
                pl={`${MARGIN}px`}
                onClick={() => {
                  updateShowFromIndex(
                    showFromIndex < 1 ? 0 : showFromIndex - 1,
                  );
                }}
                cursor='pointer'
                _hover={{
                  bg: 'blackAlpha.100',
                }}
              >
                <IconButton
                  aria-label='show parent node'
                  icon={<FaEllipsis />}
                  variant='ghost'
                  colorScheme='gray'
                  size='sm'
                  color='currentColor'
                  justifyContent='flex-start'
                  px={2}
                />
              </Flex>
            </Tooltip>
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
          params={params}
          depth={0}
          updateLineage={updateLineage}
        />
      ))}
    </UnorderedList>
  );
};
