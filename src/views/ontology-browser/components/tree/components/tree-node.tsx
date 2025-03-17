import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
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
} from '../../../utils/api-helpers';
import { Link } from 'src/components/link';
import { useLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItemWithCounts,
  OntologyPagination,
} from '../../../types';
import { getChildren, sortChildrenList } from '../../../utils/ontology-helpers';
import {
  getTooltipLabelByCountType,
  OntologyBrowserCountTag,
} from '../../ontology-browser-count-tag';
import { Pagination } from '../components/pagination';
import { Warning } from '../components/warning';
import { TreeProps, MARGIN, SIZE } from '..';
import { transformSettingsToLocalStorageConfig } from '../../settings/helpers';
import { DEFAULT_ONTOLOGY_BROWSER_SETTINGS } from '../../settings';
import { ErrorMessage } from '../../error-message';

/**
 * TreeNode Component
 *
 * Represents a single node in the ontology tree.
 * - Handles toggling open/closed state to show or hide children.
 * - Fetches child nodes when toggled open if they haven't been loaded.
 * - Renders node details, including links, counts, and actions.
 */
export const TreeNode = ({
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
  // Retrieve view settings from local storage
  const [viewSettings, setViewSettings] = useLocalStorage(
    'ontology-browser-view',
    () =>
      transformSettingsToLocalStorageConfig(DEFAULT_ONTOLOGY_BROWSER_SETTINGS),
  );

  // Toggle the node's open/closed state and fetch children if open.
  const [isToggled, setIsToggled] = useState(node.state.opened);

  // State to manage the children fetched from the API
  const [fetchedChildren, setFetchedChildren] = useState<
    OntologyLineageItemWithCounts[]
  >([]);

  // State to manage the pagination fetched from the API
  const [pagination, setPagination] = useState<Pick<
    OntologyPagination,
    'hasMore' | 'totalElements'
  > | null>(null);

  const [pageFrom, setPageFrom] = useState(0);
  const [pageSize] = useState(SIZE);
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
    enabled: node.hasChildren && pageFrom > 0,
  });

  // Toggle the node's open/closed state and fetch children if opening
  const toggleNode = () => {
    if (node.hasChildren && !isToggled) {
      fetchChildren();
    }
    setIsToggled(!isToggled);
  };
  const queryId = params.id;

  useEffect(() => {
    if (childrenData) {
      const { children, pagination } = childrenData || {};
      if (isToggled && children && children.length > 0) {
        setFetchedChildren(children);
        setPagination({
          hasMore: pagination.hasMore,
          totalElements: pagination.totalElements,
        });
      } else {
        setFetchedChildren([]);
      }
    }
  }, [childrenData, isToggled, queryId]);

  useEffect(() => {
    if (queryId !== node.id.toString()) {
      console.log('happened', node.id);
      setIsToggled(node.state.opened); // Reset toggle state when the query ID changes
      setFetchedChildren([]);
    }
  }, [queryId, node.state.opened, node.id]);

  // Set children data in state with node information. Refresh when queryId changes.
  // useEffect(() => {
  //   const children = getChildren(node.taxonId, lineage); // Retrieve immediate children from lineage
  //   setChildrenList(children);
  // }, [queryId, lineage, node.taxonId]);

  const sortedChildrenList = useMemo(
    () => sortChildrenList(getChildren(node.taxonId, lineage)),
    [node.taxonId, lineage],
  );

  // Update lineage with new children data (if there is) when toggled open
  useEffect(() => {
    if (isToggled && fetchedChildren.length > 0) {
      updateLineage(node.id.toString(), fetchedChildren);
    }
  }, [queryId, isToggled, fetchedChildren, node.id, updateLineage]);

  const numChildrenItemsDisplayed = useMemo(() => {
    const filterChildrenItems = (item: OntologyLineageItemWithCounts) => {
      if (viewSettings?.hideEmptyCounts) {
        return item.counts.termCount > 0;
      }
      return true;
    };

    return sortedChildrenList.filter(filterChildrenItems).length;
  }, [sortedChildrenList, viewSettings?.hideEmptyCounts]);

  // Show a warning when there are hidden elements due to the hideEmptyCounts configuration
  const showHiddenElementsWarning = useMemo(
    () =>
      Boolean(
        isToggled &&
          viewSettings?.hideEmptyCounts &&
          sortedChildrenList.some(item => !item.counts.termCount),
      ),
    [sortedChildrenList, viewSettings?.hideEmptyCounts, isToggled],
  );

  const showPagination = useMemo(
    () => pagination?.hasMore || (isLoading && pageFrom > 0),
    [pagination?.hasMore, isLoading, pageFrom],
  );

  // Function to determine if a node should be hidden
  const shouldHideNode =
    viewSettings?.hideEmptyCounts &&
    node.counts.termCount === 0 &&
    node.counts.termAndChildrenCount === 0 &&
    sortedChildrenList.length === 0;

  if (error) {
    return (
      <ErrorMessage title={error.message}>
        Something went wrong, try refreshing the page.
      </ErrorMessage>
    );
  }
  // Hide nodes with no children that have 0 datasets if configured to do so
  if (shouldHideNode) {
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
            sortedChildrenList.length > 0 || node.hasChildren
              ? 'pointer'
              : 'default'
          }
          flex={1}
        >
          {sortedChildrenList.length > 0 || node.hasChildren ? (
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

      {isToggled && sortedChildrenList.length > 0 ? (
        <UnorderedList ml={0}>
          {sortedChildrenList.map(child => (
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
          {/* If there are only children with 0 counts and the conmfiguration hides them, show a note */}
          {showHiddenElementsWarning &&
            (showPagination ||
              (numChildrenItemsDisplayed === 0 &&
                sortedChildrenList.length > 0)) && (
              <ListItem
                bg='status.warning_lt'
                fontSize='xs'
                px={4}
                py={2}
                pl={`${(depth + 2) * MARGIN}px`}
              >
                <Warning
                  node={node}
                  onClick={() => {
                    if (viewSettings?.hideEmptyCounts) {
                      setViewSettings({
                        ...viewSettings,
                        hideEmptyCounts: false,
                      });
                    }
                  }}
                />
              </ListItem>
            )}

          {/* Handles pagination when children items exceed the SIZE value */}
          {showPagination && (
            <ListItem
              borderTop='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${(depth + 2) * MARGIN}px`}
              bg='tertiary.50'
            >
              <Pagination
                hasMore={
                  !(numChildrenItemsDisplayed < sortedChildrenList.length)
                }
                isDisabled={
                  isLoading ||
                  sortedChildrenList.length === pagination?.totalElements
                }
                isLoading={isLoading}
                node={node}
                numChildrenDisplayed={numChildrenItemsDisplayed}
                onShowMore={() => {
                  const page = Math.floor(sortedChildrenList.length / pageSize);
                  setPageFrom(page);
                }}
                totalElements={pagination?.totalElements || 0}
              />
            </ListItem>
          )}
        </UnorderedList>
      ) : (
        <></>
      )}
    </ListItem>
  );
};
