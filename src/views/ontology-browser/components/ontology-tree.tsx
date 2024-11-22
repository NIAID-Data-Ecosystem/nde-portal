import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  ListItem,
  Spinner,
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
  fetchOntologyChildrenByTaxonID,
  getChildren,
  PaginatedOntologyTreeResponse,
  sortChildrenList,
} from '../helpers';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { useReadLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItem,
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from '../types';
import { OntologyTreeBreadcrumbs } from './ontology-tree-breadcrumbs';

const MARGIN = 16;
const SIZE = 100;

// Tree component that renders the entire tree
export const Tree = ({
  addToSearch,
  data,
  isIncludedInSearch,
  params,
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
  data: OntologyLineageItemWithCounts[];
  showFromIndex: number;
  updateLineage: (nodeId: string, children: OntologyLineageItem[]) => void;
  updateShowFromIndex: (index: number) => void;
}) => {
  // Only render the root nodes initially (nodes with no parent)
  // const rootNodes = data.filter(item => !item.parent);
  const treeNodes = data.slice(showFromIndex);
  const rootNodes = [treeNodes[0]];

  return (
    <>
      <OntologyTreeBreadcrumbs
        margin={MARGIN}
        nodes={data.slice(0, showFromIndex)}
        showFromIndex={showFromIndex}
        updateShowFromIndex={updateShowFromIndex}
      ></OntologyTreeBreadcrumbs>
      <UnorderedList ml={0}>
        {rootNodes.map(node => (
          <TreeNode
            key={node.id}
            addToSearch={addToSearch}
            isIncludedInSearch={isIncludedInSearch}
            queryId={params.id}
            node={node}
            data={treeNodes}
            params={params}
            depth={0}
            updateLineage={updateLineage}
          />
        ))}
      </UnorderedList>
    </>
  );
};

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
