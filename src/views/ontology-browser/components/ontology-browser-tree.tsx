import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FaAngleRight, FaCheck, FaMagnifyingGlass } from 'react-icons/fa6';
import {
  fetchChildrenFromBioThingsAPI,
  fetchChildrenFromOLSAPI,
  fetchPortalCounts,
} from '../utils/api-helpers';
import { Link } from 'src/components/link';
import { useReadLocalStorage, useLocalStorage } from 'usehooks-ts';
import {
  LocalStorageConfig,
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
  OntologyPagination,
} from '../types';
import { OntologyTreeBreadcrumbs } from './ontology-browser-tree-breadcrumbs';
import { getChildren, sortChildrenList } from '../utils/ontology-helpers';
import {
  getTooltipLabelByCountType,
  OntologyBrowserCountTag,
} from './ontology-browser-count-tag';

const MARGIN = 16; // Base margin for indenting tree levels
const SIZE = 20; // Number of items to fetch per page

/**
 * Tree Component
 *
 * Renders the ontology tree starting from the `showFromIndex`.
 * It includes breadcrumb navigation for the collapsed portion of the lineage
 * and recursively renders `TreeNode` components for each node in the visible portion of the tree.
 */

interface TreeProps {
  addToSearch: (
    searchItem: Pick<
      OntologyLineageItemWithCounts,
      'counts' | 'label' | 'ontologyName' | 'taxonId'
    >,
  ) => void;
  isIncludedInSearch: (id: OntologyLineageItemWithCounts['taxonId']) => boolean;
  lineage: OntologyLineageItemWithCounts[];
  params: {
    q: string;
    id: string;
    ontology: OntologyLineageRequestParams['ontology'];
  };
  showFromIndex: number;
  updateLineage: (
    nodeId: string,
    children: OntologyLineageItemWithCounts[],
  ) => void;
  updateShowFromIndex: (index: number) => void;
}

export const Tree = ({
  addToSearch,
  isIncludedInSearch,
  lineage,
  params,
  showFromIndex,
  updateLineage,
  updateShowFromIndex,
}: TreeProps) => {
  const treeNodes = lineage.slice(showFromIndex); // Visible portion of the lineage
  const rootNodes = [treeNodes[0]]; // Only render the root node initially

  return (
    <>
      {/* Breadcrumbs for collapsed portion of the tree */}
      <OntologyTreeBreadcrumbs
        margin={MARGIN}
        nodes={lineage.slice(0, showFromIndex)}
        showFromIndex={showFromIndex}
        updateShowFromIndex={updateShowFromIndex}
      ></OntologyTreeBreadcrumbs>
      <UnorderedList ml={0}>
        {rootNodes.map(node => (
          <TreeNode
            key={node.id}
            addToSearch={addToSearch}
            isIncludedInSearch={isIncludedInSearch}
            node={node}
            lineage={treeNodes}
            params={params}
            depth={0}
            updateLineage={updateLineage}
          />
        ))}
      </UnorderedList>
    </>
  );
};

/**
 * TreeNode Component
 *
 * Represents a single node in the ontology tree.
 * - Handles toggling open/closed state to show or hide children.
 * - Fetches child nodes when toggled open if they haven't been loaded.
 * - Renders node details, including links, counts, and actions.
 */
const TreeNode = ({
  addToSearch,
  depth = 0,
  isIncludedInSearch,
  lineage,
  node,
  params,
  updateLineage,
}: {
  addToSearch: TreeProps['addToSearch'];
  depth: number; //Depth level in the tree for indentation
  isIncludedInSearch: TreeProps['isIncludedInSearch'];
  lineage: TreeProps['lineage'];
  node: OntologyLineageItemWithCounts;
  params: TreeProps['params'];
  updateLineage: (
    nodeId: string,
    children: OntologyLineageItemWithCounts[],
  ) => void;
}) => {
  const queryId = params.id;
  const [isToggled, setIsToggled] = useState(node.state.opened);

  const [fetchedChildren, setFetchedChildren] = useState<
    OntologyLineageItemWithCounts[]
  >([]);
  const [childrenList, setChildrenList] = useState<
    OntologyLineageItemWithCounts[]
  >([]);

  const [childrenMeta, setChildrenMeta] = useState<OntologyPagination | null>(
    null,
  );
  const [pageFrom, setPageFrom] = useState(0);
  const [pageSize, setPageSize] = useState(SIZE);
  const {
    error,
    isLoading,
    data: childrenData,
    refetch: fetchChildren,
  } = useQuery({
    queryKey: [
      'fetch-descendants',
      node,
      node.taxonId,
      node.id,
      node.ontologyName,
      params.q,
      pageFrom,
      pageSize,
    ],
    queryFn: () => {
      //  Fetch children from the BioThings API for the NCBI Taxonomy
      if (node.ontologyName === 'ncbitaxon') {
        return fetchChildrenFromBioThingsAPI({
          node,
          q: params.q,
          id: node.taxonId,
          ontology: node.ontologyName,
          size: pageSize,
          from: pageFrom,
        }).then(async data => ({
          ...data,
          children: await fetchPortalCounts(data.children, {
            q: params.q,
          }),
        }));
      }
      return fetchChildrenFromOLSAPI({
        node,
        q: params.q,
        id: node.taxonId,
        ontology: node.ontologyName,
        size: pageSize,
        from: pageFrom,
      }).then(async data => ({
        ...data,
        children: await fetchPortalCounts(data.children, {
          q: params.q,
        }),
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: pageFrom > 0,
  });

  // Toggle the node's open/closed state and fetch children if opening
  const toggleNode = () => {
    fetchChildren();
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    if (childrenData) {
      const { children, pagination } = childrenData || {};
      if (isToggled && children && children.length > 0) {
        setFetchedChildren(children);
        setChildrenMeta({
          hasMore: pagination.hasMore,
          numPage: pagination.numPage,
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
        });
      } else {
        setFetchedChildren([]);
      }
    }
  }, [childrenData, isToggled, queryId]);

  useEffect(() => {
    setIsToggled(node.state.opened); // Reset toggle state when the query ID changes
    setFetchedChildren([]);
  }, [queryId, node.state.opened]);

  // Set children data in state with node information. Refresh when queryId changes.
  useEffect(() => {
    const children = getChildren(node.taxonId, lineage); // Retrieve immediate children from lineage
    setChildrenList(children);
  }, [queryId, lineage, node.taxonId]);

  // Update lineage with new children data (if there is) when toggled open
  useEffect(() => {
    if (isToggled && fetchedChildren.length > 0) {
      updateLineage(node.id.toString(), fetchedChildren);
    }
  }, [queryId, isToggled, fetchedChildren, node.id, updateLineage]);

  const config = useReadLocalStorage<LocalStorageConfig>(
    'ontology-browser-view',
  );
  const [viewConfig, setViewConfig] = useLocalStorage(
    'ontology-browser-view',
    () => config || { includeEmptyCounts: false },
  );

  const numChildrenItemsDisplayed = useMemo(
    () =>
      childrenList.filter(item => {
        if (config?.includeEmptyCounts) {
          return true;
        }
        return item.counts.termCount > 0;
      }).length,
    [childrenList, config?.includeEmptyCounts],
  );

  const showHiddenElementsWarning = useMemo(
    () =>
      Boolean(
        isToggled &&
          !config?.includeEmptyCounts &&
          childrenList.some(item => !item.counts.termCount),
      ),
    [childrenList, config?.includeEmptyCounts, isToggled],
  );

  const showPagination = useMemo(
    () => childrenMeta?.hasMore || (isLoading && pageFrom > 0),
    [childrenMeta, isLoading, pageFrom],
  );

  // Hide nodes with no children that have 0 datasets if configured to do so
  if (
    !config?.includeEmptyCounts &&
    node.counts.termCount === 0 &&
    node.counts.termAndChildrenCount === 0 &&
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
              {node.ontologyName} | {node.taxonId}
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
        <Flex alignItems='center'>
          <OntologyBrowserCountTag
            colorScheme={node.counts.termCount === 0 ? 'gray' : 'primary'}
            isLoading={isLoading}
            label={getTooltipLabelByCountType('termCount')}
          >
            {node.counts.termCount?.toLocaleString() || 0}
          </OntologyBrowserCountTag>
          <Text mx={0.5} fontWeight='bold' color='niaid.placeholder'>
            {' / '}
          </Text>
          <OntologyBrowserCountTag
            colorScheme='white'
            isLoading={isLoading}
            label={getTooltipLabelByCountType('termAndChildrenCount')}
          >
            {node.counts.termAndChildrenCount?.toLocaleString() || 0}
          </OntologyBrowserCountTag>

          <IconButton
            ml={1}
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
                counts: node.counts,
                label: node.label,
                ontologyName: node.ontologyName,
                taxonId: node.taxonId,
              });
            }}
          />
        </Flex>
      </Flex>

      {/* If there are only children with 0 counts and the conmfiguration hides them, show a note */}
      {isToggled && childrenList.length > 0 ? (
        <UnorderedList ml={0}>
          {sortChildrenList(childrenList).map(child => (
            <TreeNode
              key={child.id}
              addToSearch={addToSearch}
              isIncludedInSearch={isIncludedInSearch}
              node={child}
              params={params}
              lineage={lineage}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}
          {/* warning about hidden items */}
          {showHiddenElementsWarning &&
            (showPagination ||
              (numChildrenItemsDisplayed === 0 && childrenList.length > 0)) && (
              <ListItem
                bg='status.warning_lt'
                fontSize='xs'
                px={4}
                py={2}
                pl={`${(depth + 2) * MARGIN}px`}
              >
                <Flex
                  ml={4}
                  pl={10}
                  pr={4}
                  flexDirection='column'
                  alignItems='flex-start'
                  lineHeight='shorter'
                >
                  <Text pr={4}>
                    <Text as='span' fontWeight='semibold'>
                      {node.label} (Taxon ID: {node.taxonId})
                    </Text>{' '}
                    has hidden children with 0 associated datasets.{' '}
                  </Text>
                  {/* Button to update config to show hidden dataset */}
                  <Button
                    variant='link'
                    color='yellow.700'
                    size='sm'
                    onClick={() => {
                      if (viewConfig?.includeEmptyCounts === false) {
                        setViewConfig({
                          ...viewConfig,
                          includeEmptyCounts: true,
                        });
                      }
                    }}
                    fontSize='inherit'
                  >
                    Show hidden terms
                  </Button>
                </Flex>
              </ListItem>
            )}
          {/* Handles pagination */}
          {showPagination && (
            <ListItem
              borderTop='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${(depth + 2) * MARGIN}px`}
              bg='tertiary.50'
            >
              <Flex
                ml={4}
                pl={10}
                pr={4}
                flexDirection='row'
                alignItems='baseline'
                flex={1}
                fontSize='xs'
                lineHeight='shorter'
              >
                <Text>
                  Displaying {numChildrenItemsDisplayed || '-'} of{' '}
                  {childrenMeta
                    ? childrenMeta.totalElements.toLocaleString()
                    : ' - '}{' '}
                  children for{' '}
                  <Text as='span' fontWeight='semibold'>
                    {node.label} (Taxon ID: {node.taxonId}).
                  </Text>
                </Text>
                {numChildrenItemsDisplayed < childrenList.length ? (
                  <></>
                ) : (
                  <Button
                    isDisabled={
                      isLoading ||
                      !childrenMeta ||
                      childrenList.length === childrenMeta?.totalElements
                    }
                    isLoading={isLoading}
                    size='sm'
                    variant='link'
                    onClick={() => {
                      const page = Math.floor(childrenList.length / pageSize);
                      setPageFrom(page);
                    }}
                    fontSize='inherit'
                    mx={2}
                  >
                    Show more
                  </Button>
                )}
              </Flex>
            </ListItem>
          )}
        </UnorderedList>
      ) : (
        <></>
      )}
    </ListItem>
  );
};
